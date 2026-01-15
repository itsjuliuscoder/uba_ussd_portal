// lib/mocks/transactions.ts

import { MockMode, getMockMode } from './config';
import { Transaction } from '../../types/transaction';
import { getMockUsers } from './users';


const transactionTypes = ['airtime', 'bill', 'transfer', 'withdrawal', 'deposit'];
const transactionStatuses = ['success', 'failed', 'pending'];
const currencies = ['NGN', 'GHS', 'KES', 'ZAR', 'UGX'];
const operators = ['MTN', 'Airtel', 'Glo', '9mobile', 'Vodafone'];

function getRandomArrayItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateStaticTransactions(): Transaction[] {
  const users = getMockUsers();
  const txs: Transaction[] = [];
  for (let i = 0; i < 50; i++) {
    const user = users[i % users.length];
    // Make first 5 transactions created today
    const createdAt = i < 5 ? new Date().toISOString() : new Date(Date.now() - Math.random() * 1e10).toISOString();
    txs.push({
      id: i + 1,
      walletId: user.walletId,
      sender: user.fullName,
      receiver: getRandomArrayItem(users).fullName,
      sessionId: `SESSION${1000 + i}`,
      transactionId: `TXN${2000 + i}`,
      amount: (Math.floor(Math.random() * 100000) / 100).toFixed(2),
      currency: getRandomArrayItem(currencies),
      status: getRandomArrayItem(transactionStatuses),
      statusCode: '00',
      statusMessage: 'Mocked transaction',
      type: getRandomArrayItem(transactionTypes),
      operator: getRandomArrayItem(operators),
      CBAReference: `CBA${3000 + i}`,
      createdAt,
      updatedAt: new Date().toISOString(),
    });
  }
  return txs;
}

const staticTransactions: Transaction[] = generateStaticTransactions();


function randomTransaction(id: number, users: ReturnType<typeof getMockUsers>): Transaction {
  const user = getRandomArrayItem(users);
  return {
    id,
    walletId: user.walletId,
    sender: user.fullName,
    receiver: getRandomArrayItem(users).fullName,
    sessionId: `SESSION${1000 + id}`,
    transactionId: `TXN${2000 + id}`,
    amount: (Math.floor(Math.random() * 100000) / 100).toFixed(2),
    currency: getRandomArrayItem(currencies),
    status: getRandomArrayItem(transactionStatuses),
    statusCode: '00',
    statusMessage: 'Mocked transaction',
    type: getRandomArrayItem(transactionTypes),
    operator: getRandomArrayItem(operators),
    CBAReference: `CBA${3000 + id}`,
    createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getMockTransactions(): Transaction[] {
  const mode = getMockMode();
  const users = getMockUsers();
  if (mode === 'static') return staticTransactions;
  if (mode === 'random') {
    return Array.from({ length: 50 }, (_, i) => randomTransaction(i + 1, users));
  }
  return [];
}
