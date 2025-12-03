import "server-only";

import { prisma } from "@/lib/db";

export async function getAllCreators() {
  const creators = await prisma.user.findMany({
    where: {
      role: "admin",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      image: true,
      bio: true,
      designation: true,
      socialGithub: true,
      socialLinkedin: true,
      socialTwitter: true,
      socialWebsite: true,
      createdAt: true,
      courses: {
        where: {
          status: "Published",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          fileKey: true,
          smallDescription: true,
          price: true,
          duration: true,
          level: true,
          category: true,
          createdAt: true,
          _count: {
            select: {
              enrollment: {
                where: {
                  status: "Active",
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          courses: {
            where: {
              status: "Published",
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return creators;
}

export type CreatorType = Awaited<ReturnType<typeof getAllCreators>>[0];
