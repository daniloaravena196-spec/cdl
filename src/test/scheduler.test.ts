import { describe, expect, it } from 'vitest';
import { generateSchedule, moveAssignment } from '../core/scheduler';
import type { CalendarConfig, Worker } from '../core/types';

const workers: Worker[] = [
  { id: 'a', name: 'A', color: '#fff', active: true },
  { id: 'b', name: 'B', color: '#fff', active: true },
  { id: 'c', name: 'C', color: '#fff', active: true },
];

const cfg: CalendarConfig = {
  year: 2026,
  month: 3,
  maxPerDay: 2,
  targetDaysPerWorker: 8,
  blockSize: 2,
};

describe('scheduler', () => {
  it('respeta maxPerDay', () => {
    const data = generateSchedule(workers, cfg, 1234);
    Object.values(data.assignments).forEach((ids) => expect(ids.length).toBeLessThanOrEqual(cfg.maxPerDay));
  });

  it('mueve asignación sin duplicar', () => {
    const data = generateSchedule(workers, cfg, 999);
    const summary = data.summaries.find((s) => s.workerId === 'a');
    expect(summary).toBeTruthy();
    const from = summary!.days[0];
    const to = summary!.days.find((d) => d !== from) ?? from + 1;
    const moved = moveAssignment(data, 'a', from, to, cfg.maxPerDay);
    const totalA = moved.summaries.find((s) => s.workerId === 'a')!.days.length;
    expect(totalA).toBe(summary!.days.length);
  });
});
