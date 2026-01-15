// lib/mocks/sessions.ts
import { MockMode, getMockMode } from './config';
import { Session } from '../../types/session';

const staticSessions: Session[] = [
  {
    id: 's1',
    userId: '1',
    status: 'active',
    startedAt: new Date().toISOString(),
    endedAt: null,
  },
  {
    id: 's2',
    userId: '2',
    status: 'ended',
    startedAt: new Date(Date.now() - 1000000).toISOString(),
    endedAt: new Date().toISOString(),
  },
];

function randomSession(id: string): Session {
  const statuses = ['active', 'ended'];
  const status = statuses[Math.floor(Math.random() * statuses.length)] as Session['status'];
  return {
    id,
    userId: Math.ceil(Math.random() * 10).toString(),
    status,
    startedAt: new Date(Date.now() - Math.random() * 1e10).toISOString(),
    endedAt: status === 'ended' ? new Date().toISOString() : null,
  };
}

export function getMockSessions(): Session[] {
  const mode = getMockMode();
  if (mode === 'static') return staticSessions;
  if (mode === 'random') {
    return Array.from({ length: 8 }, (_, i) => randomSession(`s${i + 1}`));
  }
  return [];
}
