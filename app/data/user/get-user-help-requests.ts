import "server-only";

import { requireUser } from "./require-user";
import { prisma } from "@/lib/db";

export async function getUserHelpRequests() {
  const user = await requireUser();
  
  const helpRequests = await prisma.helpRequest.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      subject: true,
      message: true,
      userType: true,
      status: true,
      response: true,
      respondedAt: true,
      userReply: true,
      userRepliedAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return helpRequests;
}
