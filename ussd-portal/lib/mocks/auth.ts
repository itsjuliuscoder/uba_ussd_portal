// lib/mocks/auth.ts
import { MockMode, getMockMode } from './config';
import { Admin } from '../../types/auth';


const staticAdmin: Admin = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  password: 'password',
  role: 'admin',
  isActive: true,
  lastLogin: new Date().toISOString(),
};

export function mockLogin(usernameOrEmail: string, password: string): Promise<{ token: string; admin: Admin } | null> {
  const mode = getMockMode();
  if (mode === 'off') return Promise.resolve(null);
  if (mode === 'static') {
    if ((usernameOrEmail === staticAdmin.email || usernameOrEmail === staticAdmin.username) && password === staticAdmin.password) {
      return Promise.resolve({
        token: 'mock-token',
        admin: staticAdmin,
      });
    }
    return Promise.resolve(null);
  }
  if (mode === 'random') {
    // Always succeed with a random admin
    return Promise.resolve({
      token: 'mock-token',
      admin: {
        id: Math.floor(Math.random() * 1000),
        username: usernameOrEmail,
        email: `${usernameOrEmail}@mock.com`,
        password: 'password',
        role: 'admin',
        isActive: true,
        lastLogin: new Date().toISOString(),
      },
    });
  }
  return Promise.resolve(null);
}

export function mockLogout(): Promise<void> {
  return Promise.resolve();
}

export function mockIsAuthenticated(): boolean {
  return getMockMode() !== 'off';
}
