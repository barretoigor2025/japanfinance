import { useState } from "react";
import { BottomSheet } from "./ui.jsx";
import { getYukyuEntitlement } from "../utils/yukyu.js";
import { YEN, fmtDate } from "../utils/fmt.js";
import { EntryForm } from "./EntryForm.jsx";

export function YukyuModal({ entries, settings, onAddEntry, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const yukyuEntries = entries.filter(e => e.dayType === "yukyu").sort((a, b) => b.date.localeCompare(a.date));
  const entitlement = getYukyuEntitlement(settings.hireDate);
  const usedDays = yukyuEntries.length;
  const availableDays = entitlement?.daysTotal || 0;
  const remainingDays = Math.max(0, availableDays - usedDays);

  return (
    <>
      <BottomSheet onClose={onClose} title="🌿 有給休暇">
        <div className="p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <div className="text-xs mb-0.5" style={{ color: "var(--positive)" }}>Disponíveis</div>
              <div className="text-xl font-bold font-mono" style={{ color: "var(--positive)" }}>{remainingDays}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>dias</div>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div className="text-xs mb-0.5" style={{ color: "var(--warning)" }}>Utilizados</div>
              <div className="text-xl font-bold font-mono" style={{ color: "var(--warning)" }}>{usedDays}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>dias</div>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)" }}>
              <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Total</div>
              <div className="text-xl font-bold font-mono" style={{ color: "var(--text)" }}>{availableDays}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>direito</div>
            </div>
          </div>

          {/* Grant batches */}
          {entitlement?.eligible && entitlement.availableGrants.map((g, i) => {
            const daysLeft = Math.ceil((new Date(g.expiry + "T12:00:00") - new Date()) / 86400000);
            const color = daysLeft <= 90 ? "var(--negative)" : daysLeft <= 180 ? "var(--warning)" : "var(--positive)";
            const bgColor = daysLeft <= 90 ? "rgba(239,68,68,0.06)" : daysLeft <= 180 ? "rgba(245,158,11,0.06)" : "rgba(34,197,94,0.06)";
            return (
              <div key={i} className="rounded-xl p-3" style={{ background: bgColor, border: `1px solid ${color}33` }}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{g.days} dias</span>
                  <span className="text-xs font-medium" style={{ color }}>
                    {daysLeft <= 90 ? `⚠️ Vence em ${daysLeft} dias` : `Válido por ${Math.floor(daysLeft / 30)} meses`}
                  </span>
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Vence em {fmtDate(g.expiry, { day: "2-digit", month: "long", year: "numeric" })}
                </div>
                <div className="h-1 mt-2 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                  <div className="h-1 rounded-full" style={{ width: `${Math.max(5, Math.min(100, (daysLeft / 730) * 100))}%`, background: color }} />
                </div>
              </div>
            );
          })}

          {/* Next grant */}
          {entitlement?.eligible && (
            <div className="rounded-xl p-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)" }}>
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Próxima concessão</div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium" style={{ color: "var(--text)" }}>+{entitlement.nextGrantDays} dias</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>{fmtDate(entitlement.nextGrantDate, { day: "2-digit", month: "long", year: "numeric" })}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono" style={{ color: "var(--warning)" }}>{entitlement.daysToNext}</div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>dias</div>
                </div>
              </div>
            </div>
          )}

          {!settings.hireDate && (
            <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>Configure a data de contratação em Config para ver seu saldo.</p>
          )}

          {/* History */}
          {yukyuEntries.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Histórico</div>
              {yukyuEntries.map(e => (
                <div key={e.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                      {fmtDate(e.date, { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                    {e.note && <div className="text-xs italic" style={{ color: "var(--text-muted)" }}>{e.note}</div>}
                  </div>
                  <div className="text-sm font-mono font-semibold" style={{ color: "var(--positive)" }}>{YEN(8 * settings.hourlyRate)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowForm(true)}
            disabled={!!settings.hireDate && remainingDays <= 0}
            className="w-full py-2.5 rounded-xl font-bold text-sm disabled:opacity-40"
            style={{ background: "var(--positive)", color: "#fff" }}
          >🌿 Lançar 有給休暇</button>
        </div>
      </BottomSheet>
      {showForm && (
        <EntryForm
          initial={{ date: new Date().toISOString().slice(0, 10), start: "09:00", end: "18:00", breakMinutes: 0, dayType: "yukyu", note: "" }}
          settings={settings}
          onSave={e => { onAddEntry(e); setShowForm(false); onClose(); }}
          onClose={() => setShowForm(false)}
          entries={entries}
        />
      )}
    </>
  );
}
