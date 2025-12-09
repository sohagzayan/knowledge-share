import "server-only";

import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "./require-superadmin";

// Platform Overview Metrics
export async function superadminGetPlatformOverview() {
  await requireSuperAdmin();

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  
  const monthStart = new Date(now);
  monthStart.setDate(monthStart.getDate() - 30);
  monthStart.setHours(0, 0, 0, 0);
  
  const lastMonthStart = new Date(now);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  lastMonthStart.setDate(1);
  lastMonthStart.setHours(0, 0, 0, 0);
  
  const lastMonthEnd = new Date(lastMonthStart);
  lastMonthEnd.setMonth(lastMonthEnd.getMonth() + 1);
  lastMonthEnd.setDate(0);
  lastMonthEnd.setHours(23, 59, 59, 999);

  const [
    totalUsers,
    totalStudents,
    totalTeachers,
    activeStudentsToday,
    activeStudentsThisWeek,
    newRegistrationsToday,
    newRegistrationsThisMonth,
    totalCourses,
    totalEnrollments,
    lessonsCompleted,
    totalRevenue,
    monthlyRevenue,
  ] = await Promise.all([
    // Total Users
    prisma.user.count(),

    // Total Students (users with enrollments)
    prisma.user.count({
      where: {
        enrollment: {
          some: {},
        },
      },
    }),

    // Total Teachers (users who created courses)
    prisma.user.count({
      where: {
        courses: {
          some: {},
        },
      },
    }),

    // Active Students Today
    prisma.enrollment.count({
      where: {
        lastActivityAt: {
          gte: todayStart,
        },
      },
    }),

    // Active Students This Week
    prisma.enrollment.count({
      where: {
        lastActivityAt: {
          gte: weekStart,
        },
      },
    }),

    // New Registrations Today
    prisma.user.count({
      where: {
        createdAt: {
          gte: todayStart,
        },
      },
    }),

    // New Registrations This Month
    prisma.user.count({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
    }),

    // Total Courses Published
    prisma.course.count({
      where: {
        status: "Published",
      },
    }),

    // Total Enrollments
    prisma.enrollment.count(),

    // Total Lessons Completed
    prisma.lessonProgress.count({
      where: {
        completed: true,
      },
    }),

    // Total Revenue (sum of all enrollment amounts)
    prisma.enrollment.aggregate({
      _sum: {
        amount: true,
      },
    }),

    // Monthly Revenue
    prisma.enrollment.aggregate({
      where: {
        createdAt: {
          gte: monthStart,
        },
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  // Calculate user growth rate (comparing this month to last month)
  const lastMonthUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: lastMonthStart,
        lte: lastMonthEnd,
      },
    },
  });

  const userGrowthRate =
    lastMonthUsers > 0
      ? ((newRegistrationsThisMonth - lastMonthUsers) / lastMonthUsers) * 100
      : 0;

  return {
    totalUsers,
    totalStudents,
    totalTeachers,
    activeStudentsToday,
    activeStudentsThisWeek,
    newRegistrationsToday,
    newRegistrationsThisMonth,
    totalCourses,
    totalEnrollments,
    lessonsCompleted,
    totalRevenue: totalRevenue._sum.amount || 0,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    userGrowthRate: Math.round(userGrowthRate * 10) / 10,
  };
}

// User Analytics
export async function superadminGetUserAnalytics() {
  await requireSuperAdmin();

  const now = new Date();

  // Daily Active Users (last 30 days)
  const dailyActiveUsers: { date: string; users: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const activeCount = await prisma.enrollment.count({
      where: {
        lastActivityAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    dailyActiveUsers.push({
      date: dayStart.toISOString().split("T")[0],
      users: activeCount,
    });
  }

  // Weekly Active Users (last 12 weeks)
  const weeklyActiveUsers: { week: string; users: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - i * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const activeCount = await prisma.enrollment.count({
      where: {
        lastActivityAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    weeklyActiveUsers.push({
      week: `Week ${12 - i}`,
      users: activeCount,
    });
  }

  // Monthly Active Users (last 12 months)
  const monthlyActiveUsers: { month: string; users: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    const activeCount = await prisma.enrollment.count({
      where: {
        lastActivityAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    monthlyActiveUsers.push({
      month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      users: activeCount,
    });
  }

  // User Growth (new users per month)
  const userGrowth: { month: string; users: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    userGrowth.push({
      month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      users: newUsers,
    });
  }

  // User Type Breakdown
  const totalUsers = await prisma.user.count();
  const students = await prisma.user.count({
    where: {
      enrollment: {
        some: {},
      },
    },
  });
  const teachers = await prisma.user.count({
    where: {
      courses: {
        some: {},
      },
    },
  });
  const pendingVerification = await prisma.user.count({
    where: {
      emailVerified: false,
    },
  });

  return {
    dailyActiveUsers,
    weeklyActiveUsers,
    monthlyActiveUsers,
    userGrowth,
    userTypeBreakdown: {
      students: Math.round((students / totalUsers) * 100) || 0,
      teachers: Math.round((teachers / totalUsers) * 100) || 0,
      pendingVerification: Math.round((pendingVerification / totalUsers) * 100) || 0,
      others: Math.round(((totalUsers - students - teachers - pendingVerification) / totalUsers) * 100) || 0,
    },
  };
}

// Course Analytics
export async function superadminGetCourseAnalytics() {
  await requireSuperAdmin();

  const totalCourses = await prisma.course.count();
  const publishedCourses = await prisma.course.count({
    where: {
      status: "Published",
    },
  });

  // Top Performing Courses
  const topCourses = await prisma.course.findMany({
    where: {
      status: "Published",
    },
    select: {
      id: true,
      title: true,
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      enrollment: {
        select: {
          id: true,
          amount: true,
        },
      },
      chapter: {
        select: {
          lessons: {
            select: {
              id: true,
              lessonProgress: {
                where: {
                  completed: true,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
    take: 10,
    orderBy: {
      enrollment: {
        _count: "desc",
      },
    },
  });

  const topPerformingCourses = topCourses.map((course) => {
    const totalEnrollments = course.enrollment.length;
    const totalRevenue = course.enrollment.reduce((sum, e) => sum + e.amount, 0);
    
    // Calculate completion rate
    const totalLessons = course.chapter.reduce(
      (sum, ch) => sum + ch.lessons.length,
      0
    );
    const completedLessons = course.chapter.reduce(
      (sum, ch) =>
        sum +
        ch.lessons.reduce(
          (lSum, lesson) => lSum + lesson.lessonProgress.length,
          0
        ),
      0
    );
    const completionRate =
      totalLessons > 0 ? Math.round((completedLessons / (totalLessons * totalEnrollments)) * 100) : 0;

    return {
      id: course.id,
      courseName: course.title,
      teacher: `${course.user.firstName} ${course.user.lastName || ""}`.trim(),
      totalEnrollments,
      completionRate: Math.min(completionRate, 100),
      revenueEarned: totalRevenue,
      ratings: 4.5, // Placeholder - would need a reviews/ratings system
    };
  });

  // Course Category Distribution
  const coursesByCategory = await prisma.course.groupBy({
    by: ["category"],
    _count: {
      id: true,
    },
    where: {
      status: "Published",
    },
  });

  const categoryDistribution = coursesByCategory.map((cat) => ({
    category: cat.category,
    count: cat._count.id,
  }));

  // Course Completion Heatmap (enrollments per month)
  const now = new Date();
  const completionHeatmap: { month: string; enrollments: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    const enrollments = await prisma.enrollment.count({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });

    completionHeatmap.push({
      month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      enrollments,
    });
  }

  return {
    totalCourses,
    publishedCourses,
    topPerformingCourses,
    categoryDistribution,
    completionHeatmap,
  };
}

// Teacher Performance Analytics
export async function superadminGetTeacherAnalytics() {
  await requireSuperAdmin();

  // Get all teachers (users who created courses)
  const teachers = await prisma.user.findMany({
    where: {
      courses: {
        some: {},
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      courses: {
        select: {
          id: true,
          enrollment: {
            select: {
              id: true,
              amount: true,
              userId: true,
            },
          },
          chapter: {
            select: {
              lessons: {
                select: {
                  id: true,
                  lessonProgress: {
                    where: {
                      completed: true,
                    },
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const teacherLeaderboard = teachers.map((teacher) => {
    const totalCourses = teacher.courses.length;
    const allEnrollments = teacher.courses.flatMap((c) => c.enrollment);
    const totalStudents = new Set(allEnrollments.map((e) => e.userId)).size;
    const totalRevenue = allEnrollments.reduce((sum, e) => sum + e.amount, 0);

    // Calculate average completion rate
    let totalCompletionRate = 0;
    let coursesWithData = 0;

    teacher.courses.forEach((course) => {
      const enrollments = course.enrollment.length;
      if (enrollments > 0) {
        const totalLessons = course.chapter.reduce(
          (sum, ch) => sum + ch.lessons.length,
          0
        );
        const completedLessons = course.chapter.reduce(
          (sum, ch) =>
            sum +
            ch.lessons.reduce(
              (lSum, lesson) => lSum + lesson.lessonProgress.length,
              0
            ),
          0
        );
        const completionRate =
          totalLessons > 0
            ? (completedLessons / (totalLessons * enrollments)) * 100
            : 0;
        totalCompletionRate += completionRate;
        coursesWithData++;
      }
    });

    const avgCompletionRate =
      coursesWithData > 0
        ? Math.round(totalCompletionRate / coursesWithData)
        : 0;

    return {
      teacherId: teacher.id,
      teacherName: `${teacher.firstName} ${teacher.lastName || ""}`.trim(),
      totalStudents,
      totalCourses,
      avgRatings: 4.5, // Placeholder
      completionRate: Math.min(avgCompletionRate, 100),
      totalRevenueEarned: totalRevenue,
    };
  });

  // Sort by total revenue
  teacherLeaderboard.sort((a, b) => b.totalRevenueEarned - a.totalRevenueEarned);

  // Teacher Engagement
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now);
  monthStart.setDate(monthStart.getDate() - 30);
  monthStart.setHours(0, 0, 0, 0);

  const activeTeachersToday = await prisma.user.count({
    where: {
      courses: {
        some: {
          updatedAt: {
            gte: todayStart,
          },
        },
      },
    },
  });

  const activeTeachersThisWeek = await prisma.user.count({
    where: {
      courses: {
        some: {
          updatedAt: {
            gte: weekStart,
          },
        },
      },
    },
  });

  const coursesCreatedThisMonth = await prisma.course.count({
    where: {
      createdAt: {
        gte: monthStart,
      },
    },
  });

  const lessonsUploadedThisMonth = await prisma.lesson.count({
    where: {
      createdAt: {
        gte: monthStart,
      },
    },
  });

  return {
    teacherLeaderboard: teacherLeaderboard.slice(0, 20), // Top 20
    engagement: {
      activeTeachersToday,
      activeTeachersThisWeek,
      coursesCreatedThisMonth,
      lessonsUploadedThisMonth,
    },
  };
}

// Student Learning Analytics
export async function superadminGetStudentAnalytics() {
  await requireSuperAdmin();

  // Most Active Students - Fetch enrollments and related data separately
  const enrollments = await prisma.enrollment.findMany({
    select: {
      id: true,
      userId: true,
      courseId: true,
      User: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Get all unique course IDs and user IDs
  const courseIds = [...new Set(enrollments.map((e) => e.courseId))];
  const userIds = [...new Set(enrollments.map((e) => e.userId))];

  // Fetch courses with their lessons
  const courses = await prisma.course.findMany({
    where: {
      id: {
        in: courseIds,
      },
    },
    select: {
      id: true,
      chapter: {
        select: {
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  // Create a map of courseId -> lessonIds
  const courseLessonsMap = new Map<string, string[]>();
  courses.forEach((course) => {
    const lessonIds = course.chapter.flatMap((ch) =>
      ch.lessons.map((lesson) => lesson.id)
    );
    courseLessonsMap.set(course.id, lessonIds);
  });

  // Get lesson progress for all users
  const allLessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: {
        in: userIds,
      },
      completed: true,
    },
    select: {
      userId: true,
      lessonId: true,
    },
  });

  // Create a map of userId -> completed lessonIds
  const userCompletedLessons = new Map<string, Set<string>>();
  allLessonProgress.forEach((progress) => {
    if (!userCompletedLessons.has(progress.userId)) {
      userCompletedLessons.set(progress.userId, new Set());
    }
    userCompletedLessons.get(progress.userId)!.add(progress.lessonId);
  });

  const studentActivity = enrollments.map((enrollment) => {
    const completedLessonIds = userCompletedLessons.get(enrollment.userId) || new Set();
    const allLessonIds = courseLessonsMap.get(enrollment.courseId) || [];
    const lessonsCompleted = allLessonIds.filter((id) => completedLessonIds.has(id)).length;
    const totalLessons = allLessonIds.length;
    const coursesCompleted = lessonsCompleted === totalLessons && totalLessons > 0 ? 1 : 0;

    return {
      userId: enrollment.userId,
      studentName: `${enrollment.User.firstName} ${enrollment.User.lastName || ""}`.trim(),
      lessonsCompleted,
      coursesCompleted,
      hoursStudied: Math.round(lessonsCompleted * 0.5), // Estimate: 30 min per lesson
    };
  });

  // Group by user and aggregate
  const studentMap = new Map();
  studentActivity.forEach((activity) => {
    const existing = studentMap.get(activity.userId) || {
      userId: activity.userId,
      studentName: activity.studentName,
      lessonsCompleted: 0,
      coursesCompleted: 0,
      hoursStudied: 0,
    };
    existing.lessonsCompleted += activity.lessonsCompleted;
    existing.coursesCompleted += activity.coursesCompleted;
    existing.hoursStudied += activity.hoursStudied;
    studentMap.set(activity.userId, existing);
  });

  const mostActiveStudents = Array.from(studentMap.values())
    .sort((a, b) => b.lessonsCompleted - a.lessonsCompleted)
    .slice(0, 20);

  // Student Progress Funnel
  const totalEnrollments = await prisma.enrollment.count();
  
  // Get all enrollments with their user IDs
  const allEnrollments = await prisma.enrollment.findMany({
    select: {
      userId: true,
      courseId: true,
      certificateEarned: true,
    },
  });

  // Get all lesson progress for these users
  const funnelUserIds = [...new Set(allEnrollments.map((e) => e.userId))];
  const userLessonProgress = await prisma.lessonProgress.findMany({
    where: {
      userId: {
        in: funnelUserIds,
      },
    },
    select: {
      userId: true,
      lessonId: true,
      completed: true,
    },
  });

  // Group by user and course
  const userCourseProgress = new Map<string, Map<string, { total: number; completed: number }>>();
  
  // Get all courses and their lessons
  const funnelCourseIds = [...new Set(allEnrollments.map((e) => e.courseId))];
  const coursesWithLessons = await prisma.course.findMany({
    where: {
      id: {
        in: funnelCourseIds,
      },
    },
    select: {
      id: true,
      chapter: {
        select: {
          lessons: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  // Initialize progress tracking
  allEnrollments.forEach((enrollment) => {
    const key = `${enrollment.userId}-${enrollment.courseId}`;
    const course = coursesWithLessons.find((c) => c.id === enrollment.courseId);
    const totalLessons = course
      ? course.chapter.reduce((sum, ch) => sum + ch.lessons.length, 0)
      : 0;
    
    if (!userCourseProgress.has(enrollment.userId)) {
      userCourseProgress.set(enrollment.userId, new Map());
    }
    userCourseProgress.get(enrollment.userId)!.set(enrollment.courseId, {
      total: totalLessons,
      completed: 0,
    });
  });

  // Count completed lessons
  userLessonProgress.forEach((progress) => {
    if (progress.completed) {
      // Find which course this lesson belongs to
      const course = coursesWithLessons.find((c) =>
        c.chapter.some((ch) => ch.lessons.some((l) => l.id === progress.lessonId))
      );
      if (course) {
        const userMap = userCourseProgress.get(progress.userId);
        if (userMap) {
          const courseProgress = userMap.get(course.id);
          if (courseProgress) {
            courseProgress.completed++;
          }
        }
      }
    }
  });

  // Calculate funnel metrics
  let startedCourses = 0;
  let halfwayCourses = 0;
  let completedCourses = 0;

  userCourseProgress.forEach((courseMap) => {
    courseMap.forEach((progress) => {
      if (progress.completed > 0) {
        startedCourses++;
      }
      if (progress.total > 0 && progress.completed >= progress.total / 2) {
        halfwayCourses++;
      }
      if (progress.total > 0 && progress.completed >= progress.total) {
        completedCourses++;
      }
    });
  });

  const completedCertificates = await prisma.enrollment.count({
    where: {
      certificateEarned: true,
    },
  });

  // Drop-off Analysis (simplified - would need more detailed tracking)
  const dropOffData = await prisma.lesson.findMany({
    select: {
      id: true,
      title: true,
      lessonProgress: {
        where: {
          completed: false,
        },
        select: {
          id: true,
        },
      },
    },
    take: 20,
    orderBy: {
      lessonProgress: {
        _count: "desc",
      },
    },
  });

  const dropOffAnalysis = dropOffData.map((lesson) => {
    const totalStarted = lesson.lessonProgress.length;
    // This is simplified - would need total views vs completions
    return {
      lessonTitle: lesson.title,
      dropOffRate: totalStarted > 0 ? Math.round((totalStarted / 100) * 100) : 0, // Placeholder
    };
  });

  return {
    mostActiveStudents,
    progressFunnel: {
      enrolled: totalEnrollments,
      started: startedCourses,
      halfway: halfwayCourses,
      completed: completedCourses,
    },
    dropOffAnalysis: dropOffAnalysis.slice(0, 10),
  };
}

// Revenue & Earnings Analytics
export async function superadminGetRevenueAnalytics() {
  await requireSuperAdmin();

  const now = new Date();
  const twelveMonthsAgo = new Date(now.setMonth(now.getMonth() - 12));

  // Monthly Revenue
  const monthlyRevenue: { month: string; revenue: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    const revenue = await prisma.enrollment.aggregate({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    monthlyRevenue.push({
      month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      revenue: revenue._sum.amount || 0,
    });
  }

  // Revenue by Course
  const revenueByCourse = await prisma.course.findMany({
    where: {
      status: "Published",
    },
    select: {
      id: true,
      title: true,
      enrollment: {
        select: {
          amount: true,
        },
      },
    },
  });

  const courseRevenue = revenueByCourse
    .map((course) => ({
      courseName: course.title,
      revenue: course.enrollment.reduce((sum, e) => sum + e.amount, 0),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Revenue by Teacher
  const revenueByTeacher = await prisma.user.findMany({
    where: {
      courses: {
        some: {},
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      courses: {
        select: {
          enrollment: {
            select: {
              amount: true,
            },
          },
        },
      },
    },
  });

  const teacherRevenue = revenueByTeacher
    .map((teacher) => ({
      teacherName: `${teacher.firstName} ${teacher.lastName || ""}`.trim(),
      revenue: teacher.courses.reduce(
        (sum, course) =>
          sum + course.enrollment.reduce((eSum, e) => eSum + e.amount, 0),
        0
      ),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Payment Insights
  const totalOrders = await prisma.enrollment.count();
  const successfulPayments = await prisma.enrollment.count({
    where: {
      status: "Active",
    },
  });
  const failedPayments = await prisma.enrollment.count({
    where: {
      status: "Cancelled",
    },
  });
  // Refunds would need additional tracking
  const refunds = 0;

  return {
    monthlyRevenue,
    revenueByCourse: courseRevenue,
    revenueByTeacher: teacherRevenue,
    paymentInsights: {
      totalOrders,
      successfulPayments,
      failedPayments,
      refunds,
    },
  };
}

// Engagement & Activity Analytics
export async function superadminGetEngagementAnalytics() {
  await requireSuperAdmin();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  // Lesson Completion Rate
  const totalLessons = await prisma.lesson.count();
  const completedLessons = await prisma.lessonProgress.count({
    where: {
      completed: true,
    },
  });
  const overallCompletionRate =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  // Time Spent on Platform (daily learning hours - estimated)
  const dailyLearningHours: { date: string; hours: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.setHours(0, 0, 0, 0));
    const dayEnd = new Date(date.setHours(23, 59, 59, 999));

    const lessonsCompleted = await prisma.lessonProgress.count({
      where: {
        completed: true,
        updatedAt: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // Estimate: 30 minutes per lesson
    dailyLearningHours.push({
      date: dayStart.toISOString().split("T")[0],
      hours: Math.round((lessonsCompleted * 0.5 * 10) / 10), // Round to 1 decimal
    });
  }

  // Device Usage (from LoginSession if available)
  const deviceUsage = await prisma.loginSession.groupBy({
    by: ["device"],
    _count: {
      id: true,
    },
    where: {
      loggedInAt: {
        gte: thirtyDaysAgo,
      },
    },
  });

  const deviceBreakdown = deviceUsage.map((d) => ({
    device: d.device || "Unknown",
    count: d._count.id,
  }));

  // Activity Timeline (learning peaks by hour)
  const activityTimeline: { hour: number; activity: number }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const hourStart = new Date();
    hourStart.setHours(hour, 0, 0, 0);
    const hourEnd = new Date();
    hourEnd.setHours(hour, 59, 59, 999);

    const activity = await prisma.lessonProgress.count({
      where: {
        updatedAt: {
          gte: hourStart,
          lte: hourEnd,
        },
      },
    });

    activityTimeline.push({
      hour,
      activity,
    });
  }

  return {
    overallCompletionRate,
    dailyLearningHours,
    deviceBreakdown,
    activityTimeline,
  };
}

// System Health Metrics
export async function superadminGetSystemHealth() {
  await requireSuperAdmin();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  // API Usage (simplified - would need actual API logging)
  const apiUsage: { date: string; requests: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Placeholder - would need actual API request tracking
    apiUsage.push({
      date: date.toISOString().split("T")[0],
      requests: Math.floor(Math.random() * 1000) + 500, // Placeholder
    });
  }

  // Error Logs (would need error logging system)
  const errorLogs = {
    fourxx: 0, // Placeholder
    fivexx: 0, // Placeholder
  };

  // Storage Usage (would need S3/storage tracking)
  const storageUsage = {
    total: 0, // Placeholder
    videos: 0,
    pdfs: 0,
    images: 0,
  };

  // Server Response Time (would need monitoring)
  const serverResponseTime = {
    average: 120, // Placeholder in ms
    p95: 250,
    p99: 500,
  };

  return {
    apiUsage,
    errorLogs,
    storageUsage,
    serverResponseTime,
  };
}

