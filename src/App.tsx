import { CalendarGrid } from './components/CalendarGrid';
import { SummaryTable } from './components/SummaryTable';
import { useCalendarStore } from './state/useCalendarStore';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function App() {
  const { role, setRole, workers, config, data, issues, regenerate, setMaxPerDay, move } = useCalendarStore();

  return (
    <main className="app">
      <header>
        <h1>CDL React</h1>
        <p>Migración modular con motor de turnos testeable.</p>
      </header>

      <section className="toolbar">
        <label>
          Rol
          <select value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'supervisor')}>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </label>

        <label>
          Máx. libres por día
          <input
            type="number"
            min={1}
            max={8}
            value={config.maxPerDay}
            onChange={(e) => setMaxPerDay(Number(e.target.value))}
            disabled={role !== 'admin'}
          />
        </label>

        <button onClick={() => regenerate(Date.now())} disabled={role !== 'admin'}>
          Regenerar
        </button>
      </section>

      <h2>{MONTHS[config.month - 1]} {config.year}</h2>

      {issues.length > 0 && (
        <section className="issues">
          {issues.map((i) => <div key={i.message} className={i.level}>{i.message}</div>)}
        </section>
      )}

      <CalendarGrid
        year={config.year}
        month={config.month}
        maxPerDay={config.maxPerDay}
        workers={workers}
        data={data}
        onMove={move}
        editable={role === 'admin'}
      />

      <SummaryTable workers={workers} data={data} target={config.targetDaysPerWorker} />
    </main>
  );
}
