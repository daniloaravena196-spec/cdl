import type { CalendarConfig, CalendarData } from './types';

export interface ValidationIssue {
  level: 'warn' | 'error';
  message: string;
}

export function validateCalendar(data: CalendarData, cfg: CalendarConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const [day, workerIds] of Object.entries(data.assignments)) {
    if (workerIds.length > cfg.maxPerDay) {
      issues.push({
        level: 'error',
        message: `Día ${day} excede máximo (${workerIds.length}/${cfg.maxPerDay})`,
      });
    }
  }

  for (const s of data.summaries) {
    if (s.days.length !== cfg.targetDaysPerWorker) {
      issues.push({
        level: 'warn',
        message: `${s.workerId} tiene ${s.days.length}/${cfg.targetDaysPerWorker} días`,
      });
    }
  }

  return issues;
}
