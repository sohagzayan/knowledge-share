"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FinancialPage() {
  const [revenue, setRevenue] = useState<any>(null);
  const [payments, setPayments] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, payRes] = await Promise.all([
        fetch(`/api/superadmin/financial/revenue?period=${period}`),
        fetch("/api/superadmin/financial/payments"),
      ]);
      const revData = await revRes.json();
      const payData = await payRes.json();
      setRevenue(revData);
      setPayments(payData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Analytics</h1>
          <p className="text-muted-foreground">
            Revenue, payments, and financial insights
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${((revenue?.totalRevenue || 0) / 100).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {revenue?.totalOrders || 0} orders
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {payments?.paymentStats?.successRate || 0}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {payments?.paymentStats?.successful || 0} successful
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Refunds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${((payments?.refundStats?.totalRefundAmount || 0) / 100).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {payments?.refundStats?.totalRefunds || 0} refunds
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="revenue">
            <TabsList>
              <TabsTrigger value="revenue">Revenue by Course</TabsTrigger>
              <TabsTrigger value="teacher">Revenue by Teacher</TabsTrigger>
              <TabsTrigger value="category">Revenue by Category</TabsTrigger>
              <TabsTrigger value="best-selling">Best Selling</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Enrollments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenue?.revenueByCourse?.map((course: any) => (
                        <TableRow key={course.courseId}>
                          <TableCell className="font-medium">
                            {course.courseTitle}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${(course.revenue / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>{course.enrollments}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teacher" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Teacher</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenue?.revenueByTeacher?.map((teacher: any) => (
                        <TableRow key={teacher.teacherId}>
                          <TableCell className="font-medium">
                            {teacher.teacherName}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${(teacher.revenue / 100).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="category" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenue?.revenueByCategory?.map((cat: any) => (
                        <TableRow key={cat.category}>
                          <TableCell className="font-medium">
                            {cat.category}
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${(cat.revenue / 100).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="best-selling" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Best Selling Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments?.bestSellingCourses?.map((course: any) => (
                        <TableRow key={course.courseId}>
                          <TableCell className="font-medium">
                            {course.courseTitle}
                          </TableCell>
                          <TableCell>{course.sales}</TableCell>
                          <TableCell className="font-semibold">
                            ${(course.revenue / 100).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
