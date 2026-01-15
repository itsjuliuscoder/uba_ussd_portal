// lib/mocks/dashboardAnalytics.ts
import { getMockTransactions } from './transactions';
import { getMockUsers } from './users';

export function getMockRevenue(period = 'day', days = 30) {
  // Generate fake revenue data for the last N days
  const today = new Date();
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const totalAmount = Math.floor(Math.random() * 100000) / 100;
    const transactionCount = Math.floor(Math.random() * 20) + 1;
    data.push({
      period: date.toISOString().slice(0, 10),
      totalAmount: totalAmount.toString(),
      transactionCount: transactionCount.toString(),
    });
  }
  return data;
}

export function getMockUserGrowth(period = 'day', days = 30) {
  // Generate fake user growth data for the last N days
  const today = new Date();
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const count = Math.floor(Math.random() * 10) + 1;
    data.push({
      period: date.toISOString().slice(0, 10),
      count: count.toString(),
    });
  }
  return data;
}
