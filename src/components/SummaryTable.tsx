import type { CalendarData, Worker } from '../core/types';

interface Props {
  workers: Worker[];
  data: CalendarData;
  target: number;
}

export function SummaryTable({ workers, data, target }: Props) {
  const byId = new Map(data.summaries.map((s) => [s.workerId, s]));

  return (
    <table className="summary">
      <thead>
        <tr>
          <th>Trabajador</th>
          <th>Días</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {workers.map((w) => {
          const summary = byId.get(w.id);
          const days = summary?.days ?? [];
          return (
            <tr key={w.id}>
              <td style={{ color: w.color }}>{w.name}</td>
              <td>{days.join(', ') || '—'}</td>
              <td>{days.length}/{target}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
