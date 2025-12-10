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
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function SecurityPage() {
  const [loginHistory, setLoginHistory] = useState<any>(null);
  const [errorLogs, setErrorLogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loginRes, errorRes] = await Promise.all([
        fetch("/api/superadmin/security/login-history"),
        fetch("/api/superadmin/security/error-logs"),
      ]);
      setLoginHistory(await loginRes.json());
      setErrorLogs(await errorRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security & Logs</h1>
        <p className="text-muted-foreground">
          Monitor login history, suspicious activity, and system errors
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          {loginHistory?.suspiciousActivity?.length > 0 && (
            <Card className="border-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Suspicious Activity Detected
                </CardTitle>
                <CardDescription>
                  Multiple failed login attempts detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User ID</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Failed Attempts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginHistory.suspiciousActivity.map((activity: any) => (
                      <TableRow key={`${activity.userId}-${activity.ipAddress}`}>
                        <TableCell>{activity.userId}</TableCell>
                        <TableCell>{activity.ipAddress}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {activity.failedAttempts} attempts
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="login">
            <TabsList>
              <TabsTrigger value="login">Login History</TabsTrigger>
              <TabsTrigger value="errors">Error Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Login History</CardTitle>
                  <CardDescription>
                    Recent login attempts and authentication events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loginHistory?.loginHistory?.slice(0, 50).map((login: any) => (
                        <TableRow key={login.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {login.user.firstName} {login.user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {login.user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{login.ipAddress || "N/A"}</TableCell>
                          <TableCell>{login.country || "N/A"}</TableCell>
                          <TableCell>
                            {login.success ? (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Success
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(login.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="errors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Error Logs</CardTitle>
                  <CardDescription>
                    System errors and API failures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">4xx Errors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {errorLogs?.statistics?.fourxx || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">5xx Errors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {errorLogs?.statistics?.fivexx || 0}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Errors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {errorLogs?.statistics?.total || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Error Type</TableHead>
                        <TableHead>Status Code</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errorLogs?.errorLogs?.slice(0, 50).map((error: any) => (
                        <TableRow key={error.id}>
                          <TableCell>
                            <Badge variant="outline">{error.errorType}</Badge>
                          </TableCell>
                          <TableCell>
                            {error.statusCode ? (
                              <Badge
                                variant={
                                  error.statusCode >= 500
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {error.statusCode}
                              </Badge>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {error.message}
                          </TableCell>
                          <TableCell>{error.endpoint || "N/A"}</TableCell>
                          <TableCell>
                            {new Date(error.createdAt).toLocaleString()}
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
