import { daysInMonth } from '../core/scheduler';
import type { CalendarData, Worker } from '../core/types';

interface Props {
  year: number;
  month: number;
  maxPerDay: number;
  workers: Worker[];
  data: CalendarData;
  onMove: (workerId: string, fromDay: number, toDay: number) => void;
  editable: boolean;
}

const DOW = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function CalendarGrid({ year, month, maxPerDay, workers, data, onMove, editable }: Props) {
  const total = daysInMonth(year, month);
  let firstDay = new Date(year, month - 1, 1).getDay();
  firstDay = (firstDay + 6) % 7;

  function workerName(id: string) {
    return workers.find((w) => w.id === id)?.name ?? id;
  }

  function workerColor(id: string) {
    return workers.find((w) => w.id === id)?.color ?? '#999';
  }

  return (
    <div className="panel">
      <div className="weekdays">{DOW.map((d) => <div key={d}>{d}</div>)}</div>
      <div className="grid">
        {Array.from({ length: firstDay }).map((_, i) => <div className="cell empty" key={`e-${i}`}>·</div>)}
        {Array.from({ length: total }, (_, i) => i + 1).map((day) => {
          const assigned = data.assignments[day] ?? [];
          return (
            <div
              key={day}
              className={`cell ${assigned.length >= maxPerDay ? 'limit' : ''}`}
              onDragOver={(e) => editable && e.preventDefault()}
              onDrop={(e) => {
                if (!editable) return;
                const payload = e.dataTransfer.getData('text/plain');
                const [workerId, fromDay] = payload.split('|');
                onMove(workerId, Number(fromDay), day);
              }}
            >
              <div className="day">{day}</div>
              {assigned.map((workerId) => (
                <div
                  className="tag"
                  key={`${day}-${workerId}`}
                  draggable={editable}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', `${workerId}|${day}`)}
                  style={{ borderColor: workerColor(workerId), color: workerColor(workerId) }}
                >
                  {workerName(workerId)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
