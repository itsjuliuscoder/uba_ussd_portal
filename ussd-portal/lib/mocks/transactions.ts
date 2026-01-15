// lib/mocks/transactions.ts
import { MockMode, getMockMode } from './config';
import { Transaction } from '../../types/transaction';

const staticTransactions: Transaction[] = [
  {
    id: 't1',
    userId: '1',
    amount: 1000,
    type: 'airtime',
    status: 'success',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    userId: '2',
    amount: 500,
    type: 'bill',
    status: 'failed',
    createdAt: new Date().toISOString(),
  },
];

function randomTransaction(id: string): Transaction {
  const types = ['airtime', 'bill', 'transfer', 'withdrawal'];
  const statuses = ['success', 'failed', 'pending'];
  return {
    id,
    userId: Math.ceil(Math.random() * 10).toString(),
    amount: Math.floor(Math.random() * 10000),
    type: types[Math.floor(Math.random() * types.length)] as Transaction['type'],
    status: statuses[Math.floor(Math.random() * statuses.length)] as Transaction['status'],
    createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
  };
}

export function getMockTransactions(): Transaction[] {
  const mode = getMockMode();
  if (mode === 'static') return staticTransactions;
  if (mode === 'random') {
    return Array.from({ length: 15 }, (_, i) => randomTransaction(`t${i + 1}`));
  }
  return [];
}
