import { useMemo, useState } from 'react';
import { generateSchedule, moveAssignment } from '../core/scheduler';
import { validateCalendar } from '../core/validation';
import type { CalendarConfig, CalendarData, Role, Worker } from '../core/types';

const DEFAULT_WORKERS: Worker[] = [
  { id: 'sole', name: 'Sole', color: '#ff6b6b', active: true },
  { id: 'jaime', name: 'Jaime', color: '#4ecdc4', active: true },
  { id: 'philip', name: 'Philip', color: '#45b7d1', active: true },
  { id: 'karo', name: 'Karo', color: '#f9ca24', active: true },
  { id: 'geraldi', name: 'Geraldi', color: '#a29bfe', active: true },
  { id: 'paty', name: 'Paty', color: '#fd79a8', active: true },
];

const now = new Date();

export function useCalendarStore() {
  const [role, setRole] = useState<Role>('admin');
  const [workers] = useState<Worker[]>(DEFAULT_WORKERS);
  const [config, setConfig] = useState<CalendarConfig>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    maxPerDay: 2,
    targetDaysPerWorker: 8,
    blockSize: 2,
  });

  const [data, setData] = useState<CalendarData>(() => generateSchedule(DEFAULT_WORKERS, {
    year: now.getFullYear(), month: now.getMonth() + 1, maxPerDay: 2, targetDaysPerWorker: 8, blockSize: 2,
  }));

  const issues = useMemo(() => validateCalendar(data, config), [data, config]);

  function regenerate(seed?: number) {
    if (role !== 'admin') return;
    setData(generateSchedule(workers, config, seed));
  }

  function setMaxPerDay(maxPerDay: number) {
    if (role !== 'admin') return;
    const next = { ...config, maxPerDay };
    setConfig(next);
    setData(generateSchedule(workers, next));
  }

  function move(workerId: string, fromDay: number, toDay: number) {
    if (role !== 'admin') return;
    setData((prev) => moveAssignment(prev, workerId, fromDay, toDay, config.maxPerDay));
  }

  return {
    role,
    setRole,
    workers,
    config,
    data,
    issues,
    regenerate,
    setMaxPerDay,
    move,
  };
}
