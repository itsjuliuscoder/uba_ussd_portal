// lib/mocks/users.ts
import { MockMode, getMockMode } from './config';
import { User } from '../../types/user';


const countries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda'];
const statuses: User['accountStatus'][] = ['active', 'inactive', 'suspended', 'blocked'];



const staticUsers: User[] = Array.from({ length: 20 }, (_, i) => {
  const id = i + 1;
  const firstNames = ['Jane', 'John', 'Emily', 'Michael', 'Sarah', 'David', 'Grace', 'Daniel', 'Mary', 'Paul', 'Chinedu', 'Amina', 'Kwame', 'Lerato', 'Fatima', 'Peter', 'Ngozi', 'Samuel', 'Linda', 'Joseph'];
  const lastNames = ['Doe', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Musa', 'Okafor', 'Mensah', 'Ndlovu', 'Kimani', 'Osei', 'Nkosi', 'Abiola', 'Ojo', 'Adebayo', 'Otieno', 'Moyo', 'Chukwu'];
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  // Make first 3 users created today
  const createdAt = i < 3 ? new Date().toISOString() : new Date(Date.now() - Math.random() * 1e10).toISOString();
  return {
    id,
    walletId: `WALLET${1000 + id}`,
    alternatePhoneno: `080${Math.floor(10000000 + Math.random() * 90000000)}`,
    accountNumber: `10020030${id.toString().padStart(2, '0')}`,
    fullName: `${firstName} ${lastName}`,
    country: 'Benin Republic',
    wallet: `wallet${id}@mock.com`,
    type: i % 2 === 0 ? 'admin' : 'user',
    pin: `${Math.floor(1000 + Math.random() * 9000)}`,
    accountStatus: statuses[i % statuses.length],
    createdAt,
    updatedAt: new Date().toISOString(),
  };
});



function randomUser(id: number): User {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Efe', 'Kwabena', 'Zainab', 'Tunde', 'Ama', 'Sipho'];
  const lastNames = ['Okoro', 'Mensah', 'Ncube', 'Osei', 'Nkosi', 'Abiola', 'Ojo', 'Adebayo', 'Otieno', 'Moyo'];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return {
    id,
    walletId: `WALLET${1000 + id}`,
    alternatePhoneno: `080${Math.floor(10000000 + Math.random() * 90000000)}`,
    accountNumber: `10020030${id.toString().padStart(2, '0')}`,
    fullName: `${firstName} ${lastName}`,
    country: 'Benin Republic',
    wallet: `wallet${id}@mock.com`,
    type: Math.random() > 0.5 ? 'admin' : 'user',
    pin: `${Math.floor(1000 + Math.random() * 9000)}`,
    accountStatus: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getMockUsers(): User[] {
  const mode = getMockMode();
  if (mode === 'static') return staticUsers;
  if (mode === 'random') {
    return Array.from({ length: 20 }, (_, i) => randomUser(i + 1));
  }
  return [];
}
