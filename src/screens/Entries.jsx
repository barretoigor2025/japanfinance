import { useState } from "react";
import { Card, MonthPicker, Badge, ConfirmBar } from "../components/ui.jsx";
import { calcMonthEntries } from "../utils/calc.js";
import { YEN, formatMinutes, currentMonth } from "../utils/fmt.js";
import { buildHoursReportText } from "../utils/hoursReport.js";
import { EntryForm } from "../components/EntryForm.jsx";
import { CalcDetailModal } from "../components/CalcDetailModal.jsx";

export function Entries({ entries, settings, onAddEntry, onDeleteEntry }) {
  const [month, setMonth] = useState(currentMonth);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [detailEntry, setDetailEntry] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState("");

  function copyHoursReport() {
    const text = buildHoursReportText(entries, settings, month);
    navigator.clipboard.writeText(text).then(() => {
      setToast("✓ Copiado!");
      setTimeout(() => setToast(""), 2200);
    });
  }

  const monthEntries = entries
    .filter(e => e.date.slice(0, 7) === month)
    .sort((a, b) => b.date.localeCompare(a.date));

  const ascEntries = [...monthEntries].sort((a, b) => a.date.localeCompare(b.date));
  const calcsMap = {};
  calcMonthEntries(ascEntries, settings).forEach((c, i) => {
    calcsMap[ascEntries[i].id] = c;
  });

  const dayTypeBadge = {
    holiday: { color: "red", label: "Feriado" },
    saturday: { color: "yellow", label: "Sábado" },
    sunday: { color: "blue", label: "Domingo" },
    yukyu: { color: "green", label: "有給" },
  };

  return (
    <div className="space-y-2 pb-20">
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

      <div className="flex items-center gap-2">
        <div className="flex-1"><MonthPicker value={month} onChange={setMonth} /></div>
        <button
          onClick={copyHoursReport}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-base"
          style={{ background: "var(--bg-elevated)", color: "var(--text-sub)", border: "1px solid var(--border)" }}
          title="Copiar relatório de horas do mês (WhatsApp)"
        >
          📋
        </button>
      </div>

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
            const fullDate = new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
            return (
              <Card key={e.id}>
                {/* Top row: date + amount */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{fullDate}</span>
                  <span className="text-sm font-mono font-bold" style={{ color: "var(--positive)" }}>{YEN(c?.grossPay)}</span>
                </div>

                {/* Middle row: time + hours + badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {e.dayType !== "yukyu" ? (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{e.start} → {e.end}</span>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--positive)" }}>有給休暇</span>
                  )}
                  {e.dayType !== "yukyu" && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{formatMinutes(c?.totalMin)}</span>}
                  {badge && <Badge color={badge.color}>{badge.label}</Badge>}
                  {c?.overtimeHours > 0 && <Badge color="yellow">HE {formatMinutes(c.overtimeDailyMin)}</Badge>}
                  {c?.nightHours > 0 && <Badge color="purple">🌙 {formatMinutes(c.nightMin)}</Badge>}
                  {e.note && <span className="text-xs italic truncate" style={{ color: "var(--text-muted)" }}>{e.note}</span>}
                </div>

                {/* Delete confirm */}
                {deleteId === e.id && (
                  <div className="mb-2">
                    <ConfirmBar
                      message="Excluir este lançamento?"
                      onConfirm={() => { onDeleteEntry(e.id); setDeleteId(null); }}
                      onCancel={() => setDeleteId(null)}
                    />
                  </div>
                )}

                {/* Action links */}
                <div className="flex gap-3 text-xs border-t pt-2" style={{ borderColor: "var(--border)", color: "var(--cc)" }}>
                  <button onClick={() => setDetailEntry(e)} style={{ color: "var(--cc)" }}>Ver cálculo</button>
                  <span style={{ color: "var(--border-mid)" }}>|</span>
                  <button onClick={() => setEditEntry(e)} style={{ color: "var(--cc)" }}>Editar</button>
                  <span style={{ color: "var(--border-mid)" }}>|</span>
                  <button onClick={() => { onAddEntry({ ...e, id: Date.now().toString() }); }} style={{ color: "var(--cc)" }}>Duplicar</button>
                  <span style={{ color: "var(--border-mid)" }}>|</span>
                  <button onClick={() => setDeleteId(e.id)} style={{ color: "var(--negative)" }}>Excluir</button>
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

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-semibold z-50 pointer-events-none"
          style={{ background: "var(--positive)", color: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
