import { useState } from "react";
import { Card, MonthPicker, SectionLabel, Badge } from "../components/ui.jsx";
import { calcDay, estimateDeductions } from "../utils/calc.js";
import { YEN, formatMinutes, fmtDate, currentMonth } from "../utils/fmt.js";

function ReportsTab({ entries, settings }) {
  const [month, setMonth] = useState(currentMonth);

  const monthEntries = entries
    .filter(e => e.date.slice(0, 7) === month)
    .sort((a, b) => a.date.localeCompare(b.date));

  const calcs = monthEntries.reduce((acc, e) => {
    const c = calcDay(e, settings, acc.total);
    acc.total += c.overtimeHours;
    acc.list.push(c);
    return acc;
  }, { total: 0, list: [] }).list;

  const totalHours = calcs.reduce((a, c) => a + c.totalHours, 0);
  const otHours = calcs.reduce((a, c) => a + c.overtimeHours, 0);
  const nightHours = calcs.reduce((a, c) => a + c.nightHours, 0);
  const normalHours = calcs.reduce((a, c) => a + c.normalHours, 0);
  const grossSalary = calcs.reduce((a, c) => a + c.grossPay, 0);
  const totalTeate = (settings.teate || []).filter(t => t.active).reduce((a, t) => a + (t.amount || 0), 0);
  const grossWithTeate = grossSalary + totalTeate;
  const { netPay, totalDeductions, deductions } = estimateDeductions(grossWithTeate, settings);
  const yukyuDays = monthEntries.filter(e => e.dayType === "yukyu").length;
  const workedDays = monthEntries.filter(e => e.dayType !== "yukyu").length;

  function exportCSV() {
    const rows = [["Data", "Tipo", "Entrada", "Saída", "Break(m)", "Total(h)", "HE(h)", "Noturno(h)", "Bruto(¥)"]];
    monthEntries.forEach((e, i) => {
      const c = calcs[i];
      rows.push([e.date, e.dayType, e.start || "", e.end || "", e.breakMinutes, c.totalHours.toFixed(2), c.overtimeHours.toFixed(2), c.nightHours.toFixed(2), c.grossPay]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jst-${month}.csv`;
    a.click();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1"><MonthPicker value={month} onChange={setMonth} /></div>
        <button onClick={exportCSV} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ border: "1px solid var(--border-mid)", color: "var(--text-sub)" }}>CSV</button>
      </div>

      {/* Financial summary */}
      <Card>
        <SectionLabel>Resumo Financeiro</SectionLabel>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--text-sub)" }}>Salário (horas)</span>
            <span className="text-sm font-mono font-semibold" style={{ color: "var(--text)" }}>{YEN(grossSalary)}</span>
          </div>
          {totalTeate > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--text-sub)" }}>手当 (benefícios)</span>
              <span className="text-sm font-mono" style={{ color: "var(--info)" }}>+{YEN(totalTeate)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Bruto total</span>
            <span className="text-sm font-mono font-bold" style={{ color: "var(--positive)" }}>{YEN(grossWithTeate)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: "var(--text-sub)" }}>Descontos (est.)</span>
            <span className="text-sm font-mono" style={{ color: "var(--negative)" }}>-{YEN(totalDeductions)}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--text)" }}>Líquido (est.)</span>
            <span className="text-base font-mono font-bold" style={{ color: "var(--warning)" }}>{YEN(netPay)}</span>
          </div>
        </div>
      </Card>

      {/* Hours */}
      <Card>
        <SectionLabel>Horas do Mês</SectionLabel>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Total", value: totalHours.toFixed(1) + "h", color: "var(--text)" },
            { label: "Normal", value: normalHours.toFixed(1) + "h", color: "var(--text-sub)" },
            { label: "HE", value: otHours.toFixed(1) + "h", color: "var(--warning)" },
            { label: "Noturno", value: nightHours.toFixed(1) + "h", color: "var(--night)" },
          ].map(item => (
            <div key={item.label} className="rounded-lg p-2" style={{ background: "var(--bg-elevated)" }}>
              <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>{item.label}</div>
              <div className="text-sm font-mono font-bold" style={{ color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
          <span>{workedDays} dias trabalhados</span>
          {yukyuDays > 0 && <span>· {yukyuDays} 有給</span>}
          {otHours > 60 && <Badge color="red">⚠️ {otHours.toFixed(1)}h HE</Badge>}
        </div>
      </Card>

      {/* Deductions detail */}
      <Card>
        <SectionLabel>Descontos Detalhados</SectionLabel>
        <div className="space-y-1.5">
          {deductions.map(d => (
            <div key={d.name} className="flex justify-between items-center">
              <div>
                <span className="text-sm" style={{ color: "var(--text-sub)" }}>{d.name}</span>
                {d.rate && <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>({(d.rate * 100).toFixed(2)}%)</span>}
                <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>{d.label}</span>
              </div>
              <span className="text-sm font-mono" style={{ color: "var(--negative)" }}>-{YEN(d.amount)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          * Valores estimados. Taxas: Aichi-ken, cooperativa de caminhoneiros. Consulte seu holerite real.
        </p>
      </Card>

      {/* Daily table */}
      {monthEntries.length > 0 && (
        <Card className="overflow-hidden">
          <SectionLabel>Diário</SectionLabel>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  <th className="text-left py-1.5 pr-2">Data</th>
                  <th className="text-right py-1.5 pr-2">Horas</th>
                  <th className="text-right py-1.5 pr-2">HE</th>
                  <th className="text-right py-1.5 pr-2">Not.</th>
                  <th className="text-right py-1.5">Bruto</th>
                </tr>
              </thead>
              <tbody>
                {monthEntries.map((e, i) => {
                  const c = calcs[i];
                  return (
                    <tr key={e.id} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                      <td className="py-1.5 pr-2">
                        <div style={{ color: "var(--text)" }}>{fmtDate(e.date, { day: "2-digit", month: "2-digit" })}</div>
                        <div style={{ color: "var(--text-muted)" }}>{new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" })}</div>
                      </td>
                      <td className="text-right py-1.5 pr-2 font-mono" style={{ color: "var(--text-sub)" }}>{formatMinutes(c.totalMin)}</td>
                      <td className="text-right py-1.5 pr-2 font-mono" style={{ color: c.overtimeHours > 0 ? "var(--warning)" : "var(--text-muted)" }}>
                        {c.overtimeHours > 0 ? formatMinutes(c.overtimeDailyMin) : "—"}
                      </td>
                      <td className="text-right py-1.5 pr-2 font-mono" style={{ color: c.nightHours > 0 ? "var(--night)" : "var(--text-muted)" }}>
                        {c.nightHours > 0 ? formatMinutes(c.nightMin) : "—"}
                      </td>
                      <td className="text-right py-1.5 font-mono font-semibold" style={{ color: "var(--positive)" }}>{YEN(c.grossPay)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t" style={{ borderColor: "var(--border-strong)" }}>
                  <td className="py-1.5 pr-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Total</td>
                  <td className="text-right py-1.5 pr-2 font-mono text-xs font-semibold" style={{ color: "var(--text)" }}>{totalHours.toFixed(1)}h</td>
                  <td className="text-right py-1.5 pr-2 font-mono text-xs" style={{ color: "var(--warning)" }}>{otHours.toFixed(1)}h</td>
                  <td className="text-right py-1.5 pr-2 font-mono text-xs" style={{ color: "var(--night)" }}>{nightHours.toFixed(1)}h</td>
                  <td className="text-right py-1.5 font-mono text-xs font-bold" style={{ color: "var(--positive)" }}>{YEN(grossSalary)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function CompareTab({ entries, settings }) {
  const monthMap = {};
  entries.forEach(e => {
    const m = e.date.slice(0, 7);
    if (!monthMap[m]) monthMap[m] = [];
    monthMap[m].push(e);
  });
  const months = Object.keys(monthMap).sort();

  if (months.length === 0) {
    return (
      <Card>
        <div className="text-center py-10">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>Nenhum dado para comparar</div>
        </div>
      </Card>
    );
  }

  const monthlyData = months.map(month => {
    const mEntries = monthMap[month].sort((a, b) => a.date.localeCompare(b.date));
    let accOT = 0;
    const calcs = mEntries.map(e => { const c = calcDay(e, settings, accOT); accOT += c.overtimeHours; return c; });
    const totalHours = calcs.reduce((a, c) => a + c.totalHours, 0);
    const otHours = calcs.reduce((a, c) => a + c.overtimeHours, 0);
    const grossSalary = calcs.reduce((a, c) => a + c.grossPay, 0);
    const totalTeate = (settings.teate || []).filter(t => t.active).reduce((a, t) => a + (t.amount || 0), 0);
    const grossWithTeate = grossSalary + totalTeate;
    const { netPay, totalDeductions } = estimateDeductions(grossWithTeate, settings);
    const label = new Date(month + "-01T12:00:00").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
    const workedDays = mEntries.filter(e => e.dayType !== "yukyu").length;
    const yukyuDays = mEntries.filter(e => e.dayType === "yukyu").length;
    return { month, label, totalHours, otHours, grossWithTeate, netPay, totalDeductions, workedDays, yukyuDays };
  });

  const maxGross = Math.max(...monthlyData.map(d => d.grossWithTeate), 1);
  const avgGross = Math.round(monthlyData.reduce((a, d) => a + d.grossWithTeate, 0) / monthlyData.length);
  const avgNet = Math.round(monthlyData.reduce((a, d) => a + d.netPay, 0) / monthlyData.length);
  const avgOT = (monthlyData.reduce((a, d) => a + d.otHours, 0) / monthlyData.length).toFixed(1);
  const best = monthlyData.reduce((a, b) => a.grossWithTeate > b.grossWithTeate ? a : b);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Card>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Média bruto/mês</div>
          <div className="text-lg font-mono font-bold" style={{ color: "var(--positive)" }}>{YEN(avgGross)}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Média líquido/mês</div>
          <div className="text-lg font-mono font-bold" style={{ color: "var(--warning)" }}>{YEN(avgNet)}</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Média HE/mês</div>
          <div className="text-lg font-bold" style={{ color: "var(--text)" }}>{avgOT}h</div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Melhor mês</div>
          <div className="text-sm font-bold" style={{ color: "var(--warning)" }}>{best.label}</div>
          <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{YEN(best.grossWithTeate)}</div>
        </Card>
      </div>

      <Card>
        <SectionLabel>Bruto vs Líquido</SectionLabel>
        <div className="space-y-2.5">
          {monthlyData.map(d => (
            <div key={d.month}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium w-10" style={{ color: "var(--text)" }}>{d.label}</span>
                <div className="flex gap-2 text-xs font-mono">
                  <span style={{ color: "var(--positive)" }}>{YEN(d.grossWithTeate)}</span>
                  <span style={{ color: "var(--text-muted)" }}>→</span>
                  <span style={{ color: "var(--warning)" }}>{YEN(d.netPay)}</span>
                </div>
              </div>
              <div className="relative h-4 rounded-md overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                <div className="absolute inset-y-0 left-0 rounded-md" style={{ width: `${(d.grossWithTeate / maxGross) * 100}%`, background: "rgba(34,197,94,0.25)" }} />
                <div className="absolute inset-y-0 left-0 rounded-md" style={{ width: `${(d.netPay / maxGross) * 100}%`, background: "rgba(245,158,11,0.55)" }} />
                <div className="absolute inset-y-0 right-2 flex items-center">
                  <span className="text-xs font-mono" style={{ color: "var(--negative)" }}>-{YEN(d.totalDeductions)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
          <span><span className="inline-block w-3 h-2 rounded mr-1" style={{ background: "rgba(34,197,94,0.3)" }} />Bruto</span>
          <span><span className="inline-block w-3 h-2 rounded mr-1" style={{ background: "rgba(245,158,11,0.55)" }} />Líquido</span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <SectionLabel>Tabela Detalhada</SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                <th className="text-left py-1.5 pr-2">Mês</th>
                <th className="text-right py-1.5 pr-2">Horas</th>
                <th className="text-right py-1.5 pr-2">Bruto</th>
                <th className="text-right py-1.5 pr-2">Desc.</th>
                <th className="text-right py-1.5">Líquido</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((d, i) => {
                const prevNet = i > 0 ? monthlyData[i - 1].netPay : null;
                const diff = prevNet ? d.netPay - prevNet : null;
                return (
                  <tr key={d.month} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                    <td className="py-1.5 pr-2">
                      <div style={{ color: "var(--text)" }}>{d.label}</div>
                      <div style={{ color: "var(--text-muted)" }}>{d.workedDays}d{d.yukyuDays > 0 ? ` +${d.yukyuDays}有給` : ""}</div>
                    </td>
                    <td className="text-right py-1.5 pr-2 font-mono" style={{ color: "var(--text-muted)" }}>{d.totalHours.toFixed(0)}h</td>
                    <td className="text-right py-1.5 pr-2 font-mono" style={{ color: "var(--positive)" }}>{YEN(d.grossWithTeate)}</td>
                    <td className="text-right py-1.5 pr-2 font-mono" style={{ color: "var(--negative)" }}>-{YEN(d.totalDeductions)}</td>
                    <td className="text-right py-1.5">
                      <div className="font-mono font-bold" style={{ color: "var(--warning)" }}>{YEN(d.netPay)}</div>
                      {diff !== null && <div className="text-xs font-mono" style={{ color: diff >= 0 ? "var(--positive)" : "var(--negative)" }}>{diff >= 0 ? "▲" : "▼"}{YEN(Math.abs(diff))}</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function Reports({ entries, settings }) {
  const [tab, setTab] = useState("reports");

  return (
    <div className="space-y-3 pb-24">
      <div>
        <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Financeiro</div>
        <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>Relatórios</h1>
      </div>

      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
        {[{ id: "reports", label: "Mensal" }, { id: "compare", label: "Comparativo" }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 text-sm font-medium transition-colors"
            style={tab === t.id
              ? { background: "var(--text)", color: "var(--bg)" }
              : { background: "var(--bg-elevated)", color: "var(--text-sub)" }
            }
          >{t.label}</button>
        ))}
      </div>

      {tab === "reports" ? <ReportsTab entries={entries} settings={settings} /> : <CompareTab entries={entries} settings={settings} />}
    </div>
  );
}
