"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RevenueData } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils/format";

interface RevenueChartProps {
  data: RevenueData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    period: item.period,
    revenue: parseFloat(item.totalAmount || "0"),
    transactions: parseInt(item.transactionCount || "0"),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === "revenue") {
              return formatCurrency(value);
            }
            return value;
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          strokeWidth={2}
          name="Revenue"
        />
        <Line
          type="monotone"
          dataKey="transactions"
          stroke="#82ca9d"
          strokeWidth={2}
          name="Transactions"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
