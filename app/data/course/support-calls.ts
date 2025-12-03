import "server-only";

import { prisma } from "@/lib/db";
import { requireUser } from "@/app/data/user/require-user";

export async function createSupportCall({
  courseId,
  title,
  description,
  streamCallId,
}: {
  courseId: string;
  title?: string;
  description?: string;
  streamCallId: string;
}) {
  const user = await requireUser();

  const supportCall = await prisma.supportCall.create({
    data: {
      courseId,
      createdBy: user.id,
      streamCallId,
      title,
      description,
      status: "Active",
    },
    include: {
      Course: true,
      Creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return supportCall;
}

export async function getSupportCallsByCourse(courseId: string) {
  const supportCalls = await prisma.supportCall.findMany({
    where: {
      courseId,
    },
    include: {
      Creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
      requests: {
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Debug logging
  console.log(`[getSupportCallsByCourse] Found ${supportCalls.length} support calls for course ${courseId}`);
  supportCalls.forEach((call) => {
    console.log(`[getSupportCallsByCourse] Call ${call.id} has ${call.requests.length} requests`);
    call.requests.forEach((req) => {
      console.log(`[getSupportCallsByCourse]   Request ${req.id}: status=${req.status}, user=${req.User.email}`);
    });
  });

  return supportCalls;
}

export async function getSupportCallById(id: string) {
  const supportCall = await prisma.supportCall.findUnique({
    where: { id },
    include: {
      Course: true,
      Creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
      requests: {
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  return supportCall;
}

export async function getSupportCallByStreamId(streamCallId: string) {
  const supportCall = await prisma.supportCall.findUnique({
    where: { streamCallId },
    include: {
      Course: true,
      Creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
      requests: {
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  return supportCall;
}

export async function endSupportCall(id: string) {
  const supportCall = await prisma.supportCall.update({
    where: { id },
    data: {
      status: "Ended",
      endedAt: new Date(),
    },
  });

  return supportCall;
}

export async function createSupportCallRequest({
  supportCallId,
  userId,
  supportType,
}: {
  supportCallId: string;
  userId: string;
  supportType: string;
}) {
  // Get the current highest position
  const lastRequest = await prisma.supportCallRequest.findFirst({
    where: { supportCallId },
    orderBy: { position: "desc" },
  });

  const position = lastRequest ? lastRequest.position + 1 : 1;

  const request = await prisma.supportCallRequest.create({
    data: {
      supportCallId,
      userId,
      supportType,
      status: "Pending",
      position,
    },
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
    },
  });

  console.log(`[createSupportCallRequest] Created request ${request.id} for support call ${supportCallId} by user ${userId} (${request.User.email})`);

  return request;
}

export async function updateSupportRequestStatus({
  id,
  status,
}: {
  id: string;
  status: "Pending" | "Accepted" | "Rejected" | "Completed";
}) {
  const request = await prisma.supportCallRequest.update({
    where: { id },
    data: { status },
    include: {
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
    },
  });

  return request;
}

export async function markRequestAsJoined(id: string) {
  const request = await prisma.supportCallRequest.update({
    where: { id },
    data: {
      joinedAt: new Date(),
      status: "Accepted",
    },
  });

  return request;
}

export async function getActiveSupportCallsByCourse(courseId: string) {
  const supportCalls = await prisma.supportCall.findMany({
    where: {
      courseId,
      status: "Active",
    },
    include: {
      Creator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return supportCalls;
}


