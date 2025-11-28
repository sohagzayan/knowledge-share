import { env } from "@/lib/env";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { S3 } from "@/lib/S3Client";
import { requireUser } from "@/app/data/user/require-user";
import arcjet, { fixedWindow } from "@/lib/arcjet";

const aj = arcjet.withRule(
  fixedWindow({
    mode: "LIVE",
    window: "1m",
    max: 10,
  })
);

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    
    const decision = await aj.protect(request, {
      fingerprint: user.id,
    });

    if (decision.isDenied()) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Validate required environment variables
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
      console.error("AWS credentials are missing");
      return NextResponse.json(
        { error: "AWS credentials are not configured" },
        { status: 500 }
      );
    }

    if (!env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES) {
      console.error("S3 bucket name is missing");
      return NextResponse.json(
        { error: "S3 bucket name is not configured" },
        { status: 500 }
      );
    }

    if (!env.AWS_ENDPOINT_URL_S3) {
      console.error("AWS S3 endpoint URL is missing");
      return NextResponse.json(
        { error: "AWS S3 endpoint URL is not configured" },
        { status: 500 }
      );
    }

    // Get the FormData from the request
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size for documents (10MB max)
    const maxDocumentSize = 10 * 1024 * 1024; // 10MB

    if (file.size > maxDocumentSize) {
      return NextResponse.json(
        { error: "File size exceeds limit (max: 10MB)" },
        { status: 400 }
      );
    }

    // Validate file type - only allow document types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, and TXT files are allowed." },
        { status: 400 }
      );
    }

    // Generate unique key
    const uniqueKey = `submissions/${uuidv4()}-${file.name}`;

    // Convert File to Buffer/ArrayBuffer for S3 upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload directly to S3 using PutObjectCommand
    const command = new PutObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: uniqueKey,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
    });

    await S3.send(command);

    return NextResponse.json({
      key: uniqueKey,
    });
  } catch (error) {
    console.error("Failed to upload submission file:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

