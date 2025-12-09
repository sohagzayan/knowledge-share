"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconBook,
  IconShoppingCart,
  IconPlaylistX,
  IconSchool,
  IconCurrencyDollar,
  IconChartLine,
  IconClock,
  IconDeviceDesktop,
  IconActivity,
  IconServer,
} from "@tabler/icons-react";
import { LineChartComponent } from "./charts/LineChart";
import { PieChartComponent } from "./charts/PieChart";
import { BarChartComponent } from "./charts/BarChart";
import { TopCoursesTable } from "./tables/TopCoursesTable";
import { TeacherLeaderboardTable } from "./tables/TeacherLeaderboardTable";
import { MostActiveStudentsTable } from "./tables/MostActiveStudentsTable";

// Types
type PlatformOverview = {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  activeStudentsToday: number;
  activeStudentsThisWeek: number;
  newRegistrationsToday: number;
  newRegistrationsThisMonth: number;
  totalCourses: number;
  totalEnrollments: number;
  lessonsCompleted: number;
  totalRevenue: number;
  monthlyRevenue: number;
  userGrowthRate: number;
};

type UserAnalytics = {
  dailyActiveUsers: Array<{ date: string; users: number }>;
  weeklyActiveUsers: Array<{ week: string; users: number }>;
  monthlyActiveUsers: Array<{ month: string; users: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  userTypeBreakdown: {
    students: number;
    teachers: number;
    pendingVerification: number;
    others: number;
  };
};

type CourseAnalytics = {
  totalCourses: number;
  publishedCourses: number;
  topPerformingCourses: Array<{
    id: string;
    courseName: string;
    teacher: string;
    totalEnrollments: number;
    completionRate: number;
    revenueEarned: number;
    ratings: number;
  }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  completionHeatmap: Array<{ month: string; enrollments: number }>;
};

type TeacherAnalytics = {
  teacherLeaderboard: Array<{
    teacherId: string;
    teacherName: string;
    totalStudents: number;
    totalCourses: number;
    avgRatings: number;
    completionRate: number;
    totalRevenueEarned: number;
  }>;
  engagement: {
    activeTeachersToday: number;
    activeTeachersThisWeek: number;
    coursesCreatedThisMonth: number;
    lessonsUploadedThisMonth: number;
  };
};

type StudentAnalytics = {
  mostActiveStudents: Array<{
    userId: string;
    studentName: string;
    lessonsCompleted: number;
    coursesCompleted: number;
    hoursStudied: number;
  }>;
  progressFunnel: {
    enrolled: number;
    started: number;
    halfway: number;
    completed: number;
  };
  dropOffAnalysis: Array<{
    lessonTitle: string;
    dropOffRate: number;
  }>;
};

type RevenueAnalytics = {
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  revenueByCourse: Array<{ courseName: string; revenue: number }>;
  revenueByTeacher: Array<{ teacherName: string; revenue: number }>;
  paymentInsights: {
    totalOrders: number;
    successfulPayments: number;
    failedPayments: number;
    refunds: number;
  };
};

type EngagementAnalytics = {
  overallCompletionRate: number;
  dailyLearningHours: Array<{ date: string; hours: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  activityTimeline: Array<{ hour: number; activity: number }>;
};

type SystemHealth = {
  apiUsage: Array<{ date: string; requests: number }>;
  errorLogs: {
    fourxx: number;
    fivexx: number;
  };
  storageUsage: {
    total: number;
    videos: number;
    pdfs: number;
    images: number;
  };
  serverResponseTime: {
    average: number;
    p95: number;
    p99: number;
  };
};

type AnalyticsPageClientProps = {
  platformOverview: PlatformOverview;
  userAnalytics: UserAnalytics;
  courseAnalytics: CourseAnalytics;
  teacherAnalytics: TeacherAnalytics;
  studentAnalytics: StudentAnalytics;
  revenueAnalytics: RevenueAnalytics;
  engagementAnalytics: EngagementAnalytics;
  systemHealth: SystemHealth;
};

export function AnalyticsPageClient({
  platformOverview,
  userAnalytics,
  courseAnalytics,
  teacherAnalytics,
  studentAnalytics,
  revenueAnalytics,
  engagementAnalytics,
  systemHealth,
}: AnalyticsPageClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  // KPI Cards
  const kpiCards = [
    {
      label: "Total Users",
      value: platformOverview.totalUsers.toLocaleString(),
      icon: IconUsers,
      trend: `${platformOverview.userGrowthRate >= 0 ? "+" : ""}${platformOverview.userGrowthRate}%`,
      trendUp: platformOverview.userGrowthRate >= 0,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Total Students",
      value: platformOverview.totalStudents.toLocaleString(),
      icon: IconSchool,
      trend: `${platformOverview.activeStudentsThisWeek} active this week`,
      trendUp: true,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Total Teachers",
      value: platformOverview.totalTeachers.toLocaleString(),
      icon: IconUsers,
      trend: `${teacherAnalytics.engagement.activeTeachersThisWeek} active this week`,
      trendUp: true,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Active Students Today",
      value: platformOverview.activeStudentsToday.toLocaleString(),
      icon: IconActivity,
      trend: "Today",
      trendUp: true,
      color: "text-amber-600",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Total Courses",
      value: platformOverview.totalCourses.toLocaleString(),
      icon: IconBook,
      trend: `${courseAnalytics.publishedCourses} published`,
      trendUp: true,
      color: "text-indigo-600",
      bgColor: "bg-indigo-500/10",
    },
    {
      label: "Monthly Revenue",
      value: formatCurrency(platformOverview.monthlyRevenue),
      icon: IconCurrencyDollar,
      trend: "This month",
      trendUp: true,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          SuperAdmin Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Comprehensive platform analytics, user insights, and performance metrics
        </p>
      </motion.div>

      {/* 1. Platform Overview Metrics - KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 100 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {kpiCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.2 + index * 0.1,
                duration: 0.4,
                type: "spring",
                stiffness: 200,
              }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className="group relative overflow-hidden border-border/60 bg-gradient-to-br from-background/98 via-background/95 to-background shadow-lg shadow-black/5 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardDescription className="text-xs">{stat.label}</CardDescription>
                    <CardTitle className="text-xl font-semibold tabular-nums">
                      {stat.value}
                    </CardTitle>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative pt-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    {stat.trendUp ? (
                      <IconTrendingUp className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <IconTrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={stat.trendUp ? "text-emerald-600" : "text-red-600"}>
                      {stat.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 2. User Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">User Analytics</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LineChartComponent
            title="Daily Active Users (DAU)"
            description="Last 30 days"
            data={userAnalytics.dailyActiveUsers}
            dataKey="users"
            xAxisKey="date"
            color="hsl(var(--chart-1))"
          />
          <BarChartComponent
            title="User Growth"
            description="New users per month"
            data={userAnalytics.userGrowth}
            dataKey="users"
            xAxisKey="month"
            color="hsl(var(--chart-2))"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PieChartComponent
            title="User Type Breakdown"
            description="Distribution of user types"
            data={[
              { name: "Students", value: userAnalytics.userTypeBreakdown.students },
              { name: "Teachers", value: userAnalytics.userTypeBreakdown.teachers },
              { name: "Pending Verification", value: userAnalytics.userTypeBreakdown.pendingVerification },
              { name: "Others", value: userAnalytics.userTypeBreakdown.others },
            ]}
          />
          <LineChartComponent
            title="Monthly Active Users (MAU)"
            description="Last 12 months"
            data={userAnalytics.monthlyActiveUsers}
            dataKey="users"
            xAxisKey="month"
            color="hsl(var(--chart-3))"
          />
        </div>
      </motion.div>

      {/* 3. Course Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">Course Analytics</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <BarChartComponent
            title="Course Completion Heatmap"
            description="Enrollments per month"
            data={courseAnalytics.completionHeatmap}
            dataKey="enrollments"
            xAxisKey="month"
            color="hsl(var(--chart-4))"
          />
          <PieChartComponent
            title="Course Category Distribution"
            description="Content variety across categories"
            data={courseAnalytics.categoryDistribution.map((cat) => ({
              name: cat.category,
              value: cat.count,
            }))}
          />
        </div>
        <TopCoursesTable courses={courseAnalytics.topPerformingCourses} />
      </motion.div>

      {/* 4. Teacher Performance Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">Teacher Performance Analytics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Teachers Today</CardDescription>
              <CardTitle className="text-2xl">
                {teacherAnalytics.engagement.activeTeachersToday}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Teachers This Week</CardDescription>
              <CardTitle className="text-2xl">
                {teacherAnalytics.engagement.activeTeachersThisWeek}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Courses Created This Month</CardDescription>
              <CardTitle className="text-2xl">
                {teacherAnalytics.engagement.coursesCreatedThisMonth}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Lessons Uploaded This Month</CardDescription>
              <CardTitle className="text-2xl">
                {teacherAnalytics.engagement.lessonsUploadedThisMonth}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
        <TeacherLeaderboardTable teachers={teacherAnalytics.teacherLeaderboard} />
      </motion.div>

      {/* 5. Student Learning Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">Student Learning Analytics</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Enrolled</CardDescription>
              <CardTitle className="text-2xl">
                {studentAnalytics.progressFunnel.enrolled}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Started Courses</CardDescription>
              <CardTitle className="text-2xl">
                {studentAnalytics.progressFunnel.started}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>50% Complete</CardDescription>
              <CardTitle className="text-2xl">
                {studentAnalytics.progressFunnel.halfway}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed Courses</CardDescription>
              <CardTitle className="text-2xl">
                {studentAnalytics.progressFunnel.completed}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MostActiveStudentsTable students={studentAnalytics.mostActiveStudents} />
          <BarChartComponent
            title="Drop-off Analysis"
            description="Lessons with highest drop-off rates"
            data={studentAnalytics.dropOffAnalysis.map((item) => ({
              lesson: item.lessonTitle.length > 30 ? item.lessonTitle.substring(0, 30) + "..." : item.lessonTitle,
              dropOffRate: item.dropOffRate,
            }))}
            dataKey="dropOffRate"
            xAxisKey="lesson"
            color="hsl(var(--chart-5))"
          />
        </div>
      </motion.div>

      {/* 6. Revenue & Earnings Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">Revenue & Earnings Analytics</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LineChartComponent
            title="Monthly Revenue"
            description="Platform earnings over time"
            data={revenueAnalytics.monthlyRevenue.map((item) => ({
              month: item.month,
              revenue: item.revenue / 100, // Convert cents to dollars
            }))}
            dataKey="revenue"
            xAxisKey="month"
            color="hsl(var(--chart-1))"
          />
          <PieChartComponent
            title="Revenue by Course"
            description="Top 10 courses by revenue"
            data={revenueAnalytics.revenueByCourse.slice(0, 10).map((item) => ({
              name: item.courseName.length > 15 ? item.courseName.substring(0, 15) + "..." : item.courseName,
              value: item.revenue / 100,
            }))}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Orders</CardDescription>
              <CardTitle className="text-2xl">
                {revenueAnalytics.paymentInsights.totalOrders}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Successful Payments</CardDescription>
              <CardTitle className="text-2xl text-emerald-600">
                {revenueAnalytics.paymentInsights.successfulPayments}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Failed Payments</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {revenueAnalytics.paymentInsights.failedPayments}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Refunds</CardDescription>
              <CardTitle className="text-2xl text-amber-600">
                {revenueAnalytics.paymentInsights.refunds}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </motion.div>

      {/* 7. Engagement & Activity Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">Engagement & Activity Analytics</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Overall Lesson Completion Rate</CardTitle>
              <CardDescription>Percentage of lessons completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">
                {engagementAnalytics.overallCompletionRate}%
              </div>
            </CardContent>
          </Card>
          <PieChartComponent
            title="Device Usage"
            description="Platform access by device type"
            data={engagementAnalytics.deviceBreakdown.map((item) => ({
              name: item.device,
              value: item.count,
            }))}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LineChartComponent
            title="Daily Learning Hours"
            description="Estimated learning time per day"
            data={engagementAnalytics.dailyLearningHours}
            dataKey="hours"
            xAxisKey="date"
            color="hsl(var(--chart-2))"
          />
          <BarChartComponent
            title="Activity Timeline"
            description="Learning activity by hour of day"
            data={engagementAnalytics.activityTimeline.map((item) => ({
              hour: `${item.hour}:00`,
              activity: item.activity,
            }))}
            dataKey="activity"
            xAxisKey="hour"
            color="hsl(var(--chart-3))"
          />
        </div>
      </motion.div>

      {/* 8. System Health Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-semibold">System Health Metrics</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <LineChartComponent
            title="API Usage"
            description="Request volume over time"
            data={systemHealth.apiUsage}
            dataKey="requests"
            xAxisKey="date"
            color="hsl(var(--chart-4))"
          />
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Error Logs</CardTitle>
                <CardDescription>Error counts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>4xx Errors</span>
                  <span className="font-semibold text-amber-600">
                    {systemHealth.errorLogs.fourxx}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>5xx Errors</span>
                  <span className="font-semibold text-red-600">
                    {systemHealth.errorLogs.fivexx}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Server Response Time</CardTitle>
                <CardDescription>Performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Average</span>
                  <span className="font-semibold">
                    {systemHealth.serverResponseTime.average}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>P95</span>
                  <span className="font-semibold">
                    {systemHealth.serverResponseTime.p95}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>P99</span>
                  <span className="font-semibold">
                    {systemHealth.serverResponseTime.p99}ms
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
