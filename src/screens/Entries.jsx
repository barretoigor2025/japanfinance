import { useState } from "react";
import { Card, MonthPicker, Badge, ConfirmBar } from "../components/ui.jsx";
import { calcDay } from "../utils/calc.js";
import { YEN, formatMinutes, fmtDate, currentMonth } from "../utils/fmt.js";
import { EntryForm } from "../components/EntryForm.jsx";
import { CalcDetailModal } from "../components/CalcDetailModal.jsx";

export function Entries({ entries, settings, onAddEntry, onDeleteEntry }) {
  const [month, setMonth] = useState(currentMonth);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [detailEntry, setDetailEntry] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const monthEntries = entries
    .filter(e => e.date.slice(0, 7) === month)
    .sort((a, b) => b.date.localeCompare(a.date));

  let accOT = 0;
  const calcsMap = {};
  [...monthEntries].reverse().forEach(e => {
    const c = calcDay(e, settings, accOT);
    accOT += c.overtimeHours;
    calcsMap[e.id] = c;
  });

  const dayTypeBadge = {
    holiday: { color: "red", label: "Feriado" },
    saturday: { color: "yellow", label: "Sábado" },
    sunday: { color: "blue", label: "Domingo" },
    yukyu: { color: "green", label: "有給" },
  };

  return (
    <div className="space-y-3 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Jornada</div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>Lançamentos</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--text)", color: "var(--bg)" }}
        >+ Lançar</button>
      </div>

      <MonthPicker value={month} onChange={setMonth} />

      {monthEntries.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>Nenhum lançamento em {month}</div>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {monthEntries.map(e => {
            const c = calcsMap[e.id];
            const badge = dayTypeBadge[e.dayType];
            return (
              <Card key={e.id}>
                <div className="flex items-start gap-3">
                  {/* Date block */}
                  <div className="shrink-0 text-center w-10">
                    <div className="text-lg font-bold font-mono leading-tight" style={{ color: "var(--text)" }}>
                      {e.date.slice(8)}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" })}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {e.dayType !== "yukyu" ? (
                        <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{e.start} → {e.end}</span>
                      ) : (
                        <span className="text-sm font-medium" style={{ color: "var(--positive)" }}>有給休暇</span>
                      )}
                      {badge && <Badge color={badge.color}>{badge.label}</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {e.dayType !== "yukyu" && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatMinutes(c?.totalMin)}</span>}
                      {c?.overtimeHours > 0 && <Badge color="yellow">HE {formatMinutes(c.overtimeDailyMin)}</Badge>}
                      {c?.nightHours > 0 && <Badge color="purple">🌙 {formatMinutes(c.nightMin)}</Badge>}
                      {e.note && <span className="text-xs italic truncate" style={{ color: "var(--text-muted)" }}>{e.note}</span>}
                    </div>
                    {deleteId === e.id && (
                      <div className="mt-2">
                        <ConfirmBar
                          message="Excluir este lançamento?"
                          onConfirm={() => { onDeleteEntry(e.id); setDeleteId(null); }}
                          onCancel={() => setDeleteId(null)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Pay + actions */}
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-mono font-bold" style={{ color: "var(--positive)" }}>{YEN(c?.grossPay)}</div>
                    <div className="flex gap-1 mt-1 justify-end">
                      <button onClick={() => setDetailEntry(e)} className="px-1.5 py-0.5 rounded text-xs" style={{ color: "var(--text-muted)", border: "1px solid var(--border-mid)" }}>≡</button>
                      <button onClick={() => setEditEntry(e)} className="px-1.5 py-0.5 rounded text-xs" style={{ color: "var(--text-muted)", border: "1px solid var(--border-mid)" }}>✎</button>
                      <button onClick={() => { onAddEntry({ ...e, id: Date.now().toString() }); }} className="px-1.5 py-0.5 rounded text-xs" style={{ color: "var(--text-muted)", border: "1px solid var(--border-mid)" }}>⎘</button>
                      <button onClick={() => setDeleteId(e.id)} className="px-1.5 py-0.5 rounded text-xs" style={{ color: "var(--negative)", border: "1px solid var(--border-mid)" }}>✕</button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showForm && (
        <EntryForm
          settings={settings}
          entries={entries}
          onSave={e => { onAddEntry(e); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}
      {editEntry && (
        <EntryForm
          initial={editEntry}
          settings={settings}
          entries={entries}
          onSave={e => { onAddEntry(e); setEditEntry(null); }}
          onClose={() => setEditEntry(null)}
        />
      )}
      {detailEntry && (
        <CalcDetailModal entry={detailEntry} settings={settings} onClose={() => setDetailEntry(null)} />
      )}
    </div>
  );
}
