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
import { UserGrowth } from "@/types/dashboard";

interface UserGrowthChartProps {
  data: UserGrowth[];
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const chartData = data.map((item) => ({
    period: item.period,
    users: parseInt(item.count || "0"),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="users"
          stroke="#8884d8"
          strokeWidth={2}
          name="New Users"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
