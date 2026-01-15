// lib/mocks/users.ts
import { MockMode, getMockMode } from './config';
import { User } from '../../types/user';

const staticUsers: User[] = [
  {
    id: '1',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'user',
    status: 'inactive',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Emily Johnson',
    email: 'anthony.onye@ubagroup.com',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
];

function randomUser(id: string): User {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana'];
  const name = names[Math.floor(Math.random() * names.length)];
  return {
    id,
    name: `${name} ${id}`,
    email: `${name.toLowerCase()}${id}@mock.com`,
    role: Math.random() > 0.5 ? 'admin' : 'user',
    status: Math.random() > 0.5 ? 'active' : 'inactive',
    createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
  };
}

export function getMockUsers(): User[] {
  const mode = getMockMode();
  if (mode === 'static') return staticUsers;
  if (mode === 'random') {
    return Array.from({ length: 10 }, (_, i) => randomUser((i + 1).toString()));
  }
  return [];
}
