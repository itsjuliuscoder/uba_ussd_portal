"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CreditCard, TrendingUp, Activity } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { UserGrowthChart } from "@/components/dashboard/UserGrowthChart";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardApi.getStats(),
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ["dashboard", "revenue"],
    queryFn: () => dashboardApi.getRevenue({ period: "day", days: 30 }),
  });

  const { data: userGrowth, isLoading: growthLoading } = useQuery({
    queryKey: ["dashboard", "user-growth"],
    queryFn: () => dashboardApi.getUserGrowth({ period: "day", days: 30 }),
  });

  const statsData = stats?.data;

  const statCards = [
    {
      title: "Total Users",
      value: statsData?.users.total || 0,
      change: `+${statsData?.users.newToday || 0} today`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Users",
      value: statsData?.users.active || 0,
      change: `${Math.round(
        ((statsData?.users.active || 0) / (statsData?.users.total || 1)) * 100
      )}% of total`,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Total Transactions",
      value: statsData?.transactions.total || 0,
      change: `+${statsData?.transactions.today || 0} today`,
      icon: CreditCard,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: formatCurrency(statsData?.transactions.totalAmount || 0),
      change: `${statsData?.transactions.successful || 0} successful`,
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      title: "Active Sessions",
      value: statsData?.sessions.active || 0,
      change: `${statsData?.sessions.total || 0} total`,
      icon: Activity,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your USSD menu system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <RevenueChart data={revenue?.data.revenue || []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {growthLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <UserGrowthChart data={userGrowth?.data.growth || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
