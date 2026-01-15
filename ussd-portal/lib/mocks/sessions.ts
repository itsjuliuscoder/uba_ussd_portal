// lib/mocks/sessions.ts

import { UssdSession } from '../../types/session';
import { getMockUsers } from './users';
import { getMockMode } from './config';

const questionTypes = ['menu', 'input', 'confirmation', 'info'];
const languages = ['en', 'fr', 'sw', 'yo', 'ig'];

function getRandomArrayItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateStaticSessions(): UssdSession[] {
  const users = getMockUsers();
  const sessions: UssdSession[] = [];
  for (let i = 0; i < 20; i++) {
    const user = users[i % users.length];
    // Make first 3 sessions created today
    const createdAt = i < 3 ? new Date().toISOString() : new Date(Date.now() - Math.random() * 1e10).toISOString();
    sessions.push({
      id: i + 1,
      walletId: user.walletId,
      sessionId: `SESSION${1000 + i}`,
      questionType: getRandomArrayItem(questionTypes),
      wallet: user.wallet,
      closeState: Math.random() > 0.5 ? 'closed' : undefined,
      items: '[{"label":"Option 1","value":"1"},{"label":"Option 2","value":"2"}]',
      steps: `${Math.ceil(Math.random() * 5)}`,
      language: getRandomArrayItem(languages),
      createdAt,
      updatedAt: new Date().toISOString(),
    });
  }
  return sessions;
}

const staticSessions: UssdSession[] = generateStaticSessions();

function randomSession(id: number, users: ReturnType<typeof getMockUsers>): UssdSession {
  const user = getRandomArrayItem(users);
  return {
    id,
    walletId: user.walletId,
    sessionId: `SESSION${1000 + id}`,
    questionType: getRandomArrayItem(questionTypes),
    wallet: user.wallet,
    closeState: Math.random() > 0.5 ? 'closed' : undefined,
    items: '[{"label":"Option 1","value":"1"},{"label":"Option 2","value":"2"}]',
    steps: `${Math.ceil(Math.random() * 5)}`,
    language: getRandomArrayItem(languages),
    createdAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getMockSessions(): UssdSession[] {
  const mode = getMockMode();
  const users = getMockUsers();
  let sessions: UssdSession[] = [];
  if (mode === 'static') sessions = staticSessions;
  else if (mode === 'random') {
    sessions = Array.from({ length: 20 }, (_, i) => randomSession(i + 1, users));
  }
  console.log('[MOCK] getMockSessions:', { mode, count: sessions.length, sessions });
  return sessions;
}
