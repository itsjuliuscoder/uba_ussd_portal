// lib/mocks/dashboardStats.ts
import { getMockUsers } from './users';
import { getMockTransactions } from './transactions';
import { getMockSessions } from './sessions';

function isToday(dateStr?: string) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function getDashboardStats() {
  const users = getMockUsers();
  const transactions = getMockTransactions();
  const sessions = getMockSessions();

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.accountStatus === 'active').length;
  const newUsersToday = users.filter(u => isToday(u.createdAt)).length;

  const totalTransactions = transactions.length;
  const transactionsToday = transactions.filter(t => isToday(t.createdAt)).length;
  const revenue = transactions
    .filter(t => t.status === 'success' && ['deposit', 'airtime'].includes(t.type))
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const activeSessions = sessions.filter(s => s.closeState !== 'closed').length;
  const activeSessionsToday = sessions.filter(s => isToday(s.createdAt) && s.closeState !== 'closed').length;

  return {
    totalUsers,
    activeUsers,
    newUsersToday,
    totalTransactions,
    transactionsToday,
    revenue,
    activeSessions,
    activeSessionsToday,
  };
}
