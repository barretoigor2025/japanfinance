import { useState } from "react";
import { Card, MonthPicker } from "../components/ui.jsx";
import { calcDay, calcMonthEntries, estimateDeductions } from "../utils/calc.js";
import { getYukyuEntitlement } from "../utils/yukyu.js";
import { YEN, formatMinutes, fmtDate, currentMonth } from "../utils/fmt.js";
import { EntryForm } from "../components/EntryForm.jsx";
import { YukyuModal } from "../components/YukyuModal.jsx";

export function Dashboard({ entries, settings, onAddEntry }) {
  const [month, setMonth] = useState(currentMonth);
  const [showForm, setShowForm] = useState(false);
  const [showYukyu, setShowYukyu] = useState(false);

  const monthEntries = entries
    .filter(e => e.date.slice(0, 7) === month)
    .sort((a, b) => a.date.localeCompare(b.date));

  const calcs = calcMonthEntries(entries, settings, month);

  const totalHours = calcs.reduce((a, c) => a + c.totalHours, 0);
  const otHours = calcs.reduce((a, c) => a + c.overtimeHours, 0);
  const otHoursHigh = calcs.reduce((a, c) => a + (c.breakdown?.overtimeHigh || 0), 0);
  const grossSalary = calcs.reduce((a, c) => a + c.grossPay, 0);
  const activeTeate = (settings.teate || []).filter(t => t.active);
  const totalTeate = activeTeate.reduce((a, t) => a + (t.amount || 0), 0);
  const taxableTeate = activeTeate.filter(t => t.taxable).reduce((a, t) => a + (t.amount || 0), 0);
  const nonTaxableTeate = totalTeate - taxableTeate;
  const { netPay: salaryNetPay, totalDeductions: salaryDeductions } = estimateDeductions(grossSalary, settings);
  const { totalDeductions: payoutDeductions } = estimateDeductions(grossSalary + taxableTeate, settings);
  const additionalTeateDeductions = Math.max(0, payoutDeductions - salaryDeductions);
  const projectedPay = Math.max(0, salaryNetPay + totalTeate - additionalTeateDeductions);

  const workedDays = monthEntries.filter(e => e.dayType !== "yukyu").length;
  const yukyuDays = monthEntries.filter(e => e.dayType === "yukyu").length;
  const grossPerWorkday = workedDays ? Math.round(grossSalary / workedDays) : 0;
  const netPerWorkday = workedDays ? Math.round(salaryNetPay / workedDays) : 0;

  const entitlement = getYukyuEntitlement(settings.hireDate);
  const yukyuUsed = entries.filter(e => e.dayType === "yukyu").length;
  const yukyuBalance = Math.max(0, (entitlement?.daysTotal || 0) - yukyuUsed);
  const lastEntry = [...entries].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="space-y-2 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Início</div>
          <h1 className="text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>
            {settings.name ? `Olá, ${settings.name.split(" ")[0]}` : "Dashboard"}
          </h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--text)", color: "var(--bg)" }}
        >
          + Lançar
        </button>
      </div>

      <MonthPicker value={month} onChange={setMonth} />

      {/* Key metrics — 2×2 grid with moderate sizing */}
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>Bruto</div>
          <div className="text-lg font-mono font-bold" style={{ color: "var(--positive)" }}>{YEN(grossSalary)}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Média: {YEN(grossPerWorkday)}/dia trabalhado</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>Líquido (est.)</div>
          <div className="text-lg font-mono font-bold" style={{ color: "var(--warning)" }}>{YEN(salaryNetPay)}</div>
          <div className="text-xs" style={{ color: "var(--negative)" }}>-{YEN(salaryDeductions)} em descontos est.</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>Média: {YEN(netPerWorkday)}/dia trabalhado</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>Horas</div>
          <div className="text-lg font-mono font-bold" style={{ color: "var(--text)" }}>{totalHours.toFixed(1)}h</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{workedDays} dias{yukyuDays > 0 ? ` +${yukyuDays}有給` : ""}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>Hora Extra</div>
          <div className="text-lg font-mono font-bold" style={{ color: otHours > 60 ? "var(--negative)" : otHours > 0 ? "var(--warning)" : "var(--text)" }}>{otHours.toFixed(1)}h</div>
          {otHours > 60 && <div className="text-xs" style={{ color: "var(--negative)" }}>⚠️ acima de 60h</div>}
          {otHours > 0 && otHours <= 60 && <div className="text-xs" style={{ color: "var(--text-muted)" }}>{((otHours / 60) * 100).toFixed(0)}% do limite</div>}
        </Card>
      </div>

      {activeTeate.length > 0 && (
        <Card>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>手当 — Adicionais separados</div>
          <div className="space-y-1.5">
            {activeTeate.map((t, i) => (
              <div key={t.id || i} className="flex justify-between items-center gap-3">
                <div>
                  <span className="text-sm" style={{ color: "var(--text-sub)" }}>{t.label || t.name}</span>
                  <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>{t.taxable ? "tributável" : "não tributável"}</span>
                </div>
                <span className="text-sm font-mono" style={{ color: "var(--info)" }}>{YEN(t.amount || 0)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center border-t pt-1.5" style={{ borderColor: "var(--border)" }}>
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Total 手当</span>
              <span className="text-sm font-mono font-bold" style={{ color: "var(--info)" }}>{YEN(totalTeate)}</span>
            </div>
          </div>
          <div className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>Valores conforme cadastrados em Config; a gasolina ainda usa o valor informado lá.</div>
        </Card>
      )}

      {/* OT bar */}
      {otHours > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Hora Extra acumulada</div>
            <div className="text-sm font-mono font-bold" style={{ color: otHours > 60 ? "var(--negative)" : "var(--warning)" }}>
              {otHours.toFixed(1)}h <span className="font-normal text-xs" style={{ color: "var(--text-muted)" }}>/ 60h</span>
            </div>
          </div>

          <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "var(--bg-elevated)" }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, (otHours / 60) * 100)}%`, background: otHours > 60 ? "var(--negative)" : "var(--warning)" }}
            />
          </div>

          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Até 60h/mês: <span style={{ color: "var(--warning)" }}>+25%</span> · Acima de 60h: <span style={{ color: "var(--negative)" }}>+50%</span> — lei trabalhista japonesa
          </div>

          {otHoursHigh > 0 && (
            <div className="mt-1.5 flex items-center justify-between rounded-lg px-2.5 py-1.5" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div>
                <div className="text-xs font-semibold" style={{ color: "var(--negative)" }}>⚡ Taxa elevada atingida</div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>{otHoursHigh.toFixed(1)}h a 50% em vez de 25%</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold" style={{ color: "var(--negative)" }}>
                  +{YEN(Math.round(otHoursHigh * (settings.hourlyRate || 0) * 0.25))}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>bônus vs 25%</div>
              </div>
            </div>
          )}

          {otHours > 0 && otHours < 60 && (
            <div className="mt-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              Faltam <span style={{ color: "var(--warning)" }}>{(60 - otHours).toFixed(1)}h</span> para a taxa elevada
              {settings.hourlyRate > 0 && (
                <span> · potencial +{YEN(Math.round((60 - otHours) * (settings.hourlyRate || 0) * 0.25))} além desse limite</span>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Yukyu */}
      {entitlement?.eligible && (
        <button onClick={() => setShowYukyu(true)} className="w-full text-left" style={{ borderRadius: 12 }}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>有給休暇</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold font-mono" style={{ color: "var(--positive)" }}>{yukyuBalance}</span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>dias · {yukyuUsed} usados</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-semibold" style={{ color: "var(--positive)" }}>{YEN(8 * (settings.hourlyRate || 0))}/dia</div>
                <div style={{ color: "var(--text-muted)" }}>›</div>
              </div>
            </div>
            {entitlement.expiringAlerts?.length > 0 && (
              <div className="mt-2 text-xs" style={{ color: "var(--negative)" }}>
                ⚠️ {entitlement.expiringAlerts[0].days} dias vencem em {entitlement.expiringAlerts[0].daysLeft} dias
              </div>
            )}
          </Card>
        </button>
      )}

      {/* Last entry */}
      {lastEntry && (
        <Card>
          <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Último Lançamento</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {fmtDate(lastEntry.date, { weekday: "short", day: "2-digit", month: "short" })}
              </div>
              {lastEntry.dayType !== "yukyu" && (
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{lastEntry.start} → {lastEntry.end}</div>
              )}
            </div>
            <div className="text-right">
              {(() => {
                const c = calcDay(lastEntry, settings);
                return (
                  <>
                    <div className="text-sm font-mono font-bold" style={{ color: "var(--positive)" }}>{YEN(c.grossPay)}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{formatMinutes(c.totalMin)}</div>
                  </>
                );
              })()}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Previsão total a receber no mês</div>
        <div className="text-xl font-mono font-bold mb-2" style={{ color: "var(--positive)" }}>{YEN(projectedPay)}</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span style={{ color: "var(--text-sub)" }}>Salário líquido estimado</span>
            <span className="font-mono" style={{ color: "var(--text)" }}>{YEN(salaryNetPay)}</span>
          </div>
          {taxableTeate > 0 && <div className="flex justify-between">
            <span style={{ color: "var(--text-sub)" }}>+ 手当 tributáveis</span>
            <span className="font-mono" style={{ color: "var(--info)" }}>{YEN(taxableTeate)}</span>
          </div>}
          {nonTaxableTeate > 0 && <div className="flex justify-between">
            <span style={{ color: "var(--text-sub)" }}>+ 手当 não tributáveis</span>
            <span className="font-mono" style={{ color: "var(--info)" }}>{YEN(nonTaxableTeate)}</span>
          </div>}
          {additionalTeateDeductions > 0 && <div className="flex justify-between">
            <span style={{ color: "var(--text-sub)" }}>− descontos estimados sobre 手当 tributáveis</span>
            <span className="font-mono" style={{ color: "var(--negative)" }}>-{YEN(additionalTeateDeductions)}</span>
          </div>}
        </div>
      </Card>

      {monthEntries.length === 0 && (
        <Card>
          <div className="text-center py-6">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>Nenhum lançamento este mês</div>
            <button onClick={() => setShowForm(true)} className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--text)", color: "var(--bg)" }}>
              + Lançar agora
            </button>
          </div>
        </Card>
      )}

      {showForm && (
        <EntryForm
          settings={settings}
          entries={entries}
          onSave={e => { onAddEntry(e); setShowForm(false); }}
          onClose={() => setShowForm(false)}
        />
      )}
      {showYukyu && (
        <YukyuModal
          entries={entries}
          settings={settings}
          onAddEntry={e => { onAddEntry(e); }}
          onClose={() => setShowYukyu(false)}
        />
      )}
    </div>
  );
}
