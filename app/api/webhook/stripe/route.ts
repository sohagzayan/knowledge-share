import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();

  const headersList = await headers();

  const signature = headersList.get("Stripe-Signature") as string;

  // Check if Stripe webhook secret is configured
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook secret not configured");
    return new Response("Stripe webhook not configured", { status: 501 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return new Response("Webhook error", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    try {
      // Validate required metadata
      const courseId = session.metadata?.courseId;
      const enrollmentId = session.metadata?.enrollmentId;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      if (!courseId) {
        console.error("Course id not found in session metadata", {
          sessionId: session.id,
          metadata: session.metadata,
        });
        return new Response("Course id not found", { status: 400 });
      }

      if (!enrollmentId) {
        console.error("Enrollment id not found in session metadata", {
          sessionId: session.id,
          metadata: session.metadata,
        });
        return new Response("Enrollment id not found", { status: 400 });
      }

      if (!customerId) {
        console.error("Customer id not found in session", {
          sessionId: session.id,
        });
        return new Response("Customer id not found", { status: 400 });
      }

      // Find user by stripe customer ID
      const user = await prisma.user.findUnique({
        where: {
          stripeCustomerId: customerId,
        },
      });

      if (!user) {
        console.error("User not found for stripe customer", {
          customerId,
          sessionId: session.id,
        });
        return new Response("User not found", { status: 404 });
      }

      // Check if enrollment exists and belongs to the correct user and course
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          id: enrollmentId,
        },
      });

      if (!existingEnrollment) {
        console.error("Enrollment not found", {
          enrollmentId,
          sessionId: session.id,
        });
        return new Response("Enrollment not found", { status: 404 });
      }

      // Validate enrollment belongs to the correct user and course
      if (existingEnrollment.userId !== user.id) {
        console.error("Enrollment user mismatch", {
          enrollmentId,
          enrollmentUserId: existingEnrollment.userId,
          expectedUserId: user.id,
          sessionId: session.id,
        });
        return new Response("Enrollment user mismatch", { status: 400 });
      }

      if (existingEnrollment.courseId !== courseId) {
        console.error("Enrollment course mismatch", {
          enrollmentId,
          enrollmentCourseId: existingEnrollment.courseId,
          expectedCourseId: courseId,
          sessionId: session.id,
        });
        return new Response("Enrollment course mismatch", { status: 400 });
      }

      // If already active, return success (idempotency)
      if (existingEnrollment.status === "Active") {
        console.log("Enrollment already active", {
          enrollmentId: existingEnrollment.id,
          courseId: existingEnrollment.courseId,
          userId: existingEnrollment.userId,
        });
        return new Response(null, { status: 200 });
      }

      // Update enrollment status to Active
      const enrollment = await prisma.enrollment.update({
        where: {
          id: enrollmentId,
        },
        data: {
          status: "Active",
          amount: session.amount_total ? Math.round(session.amount_total) : undefined,
          updatedAt: new Date(),
        },
      });

      console.log("Enrollment updated successfully", {
        enrollmentId: enrollment.id,
        courseId: enrollment.courseId,
        userId: enrollment.userId,
        status: enrollment.status,
      });
    } catch (error) {
      console.error("Error processing checkout.session.completed:", error);
      // Return 500 so Stripe will retry
      return new Response("Internal server error", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
}
