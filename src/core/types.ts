export type Role = 'admin' | 'supervisor';

export interface Worker {
  id: string;
  name: string;
  color: string;
  active: boolean;
}

export interface CalendarConfig {
  year: number;
  month: number;
  maxPerDay: number;
  targetDaysPerWorker: number;
  blockSize: number;
}

export type DayAssignments = Record<number, string[]>;

export interface WorkerSummary {
  workerId: string;
  days: number[];
  complete: boolean;
}

export interface CalendarData {
  assignments: DayAssignments;
  summaries: WorkerSummary[];
}
