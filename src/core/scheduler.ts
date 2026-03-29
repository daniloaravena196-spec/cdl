import type { CalendarConfig, CalendarData, Worker } from './types';

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function seededRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSchedule(workers: Worker[], cfg: CalendarConfig, seed = 20260329): CalendarData {
  const totalDays = daysInMonth(cfg.year, cfg.month);
  const assignments: Record<number, string[]> = {};
  for (let d = 1; d <= totalDays; d += 1) assignments[d] = [];

  const rng = seededRng(seed);
  const sortedWorkers = [...workers].sort((a, b) => a.id.localeCompare(b.id));

  const workerDays = new Map<string, number[]>();
  sortedWorkers.forEach((w) => workerDays.set(w.id, []));

  for (const worker of sortedWorkers) {
    let guards = 0;
    while ((workerDays.get(worker.id)?.length ?? 0) < cfg.targetDaysPerWorker && guards < 15000) {
      guards += 1;
      const start = 1 + Math.floor(rng() * (totalDays - cfg.blockSize + 1));
      const block = Array.from({ length: cfg.blockSize }, (_, i) => start + i);

      const canAssign = block.every((day) => {
        const already = workerDays.get(worker.id)?.includes(day);
        return !already && assignments[day].length < cfg.maxPerDay;
      });

      if (canAssign) {
        for (const day of block) {
          assignments[day].push(worker.id);
          workerDays.get(worker.id)?.push(day);
        }
      }
    }
  }

  const summaries = sortedWorkers.map((w) => {
    const days = [...(workerDays.get(w.id) ?? [])].sort((a, b) => a - b);
    return {
      workerId: w.id,
      days,
      complete: days.length === cfg.targetDaysPerWorker,
    };
  });

  return { assignments, summaries };
}

export function moveAssignment(data: CalendarData, workerId: string, fromDay: number, toDay: number, maxPerDay: number): CalendarData {
  if (fromDay === toDay) return data;
  const next = structuredClone(data);

  if (next.assignments[toDay].includes(workerId)) return data;
  if (next.assignments[toDay].length >= maxPerDay) return data;

  next.assignments[fromDay] = next.assignments[fromDay].filter((id) => id !== workerId);
  next.assignments[toDay].push(workerId);

  const summary = next.summaries.find((s) => s.workerId === workerId);
  if (summary) {
    summary.days = summary.days.filter((d) => d !== fromDay);
    summary.days.push(toDay);
    summary.days.sort((a, b) => a - b);
  }

  return next;
}
