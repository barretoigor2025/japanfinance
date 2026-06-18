import { useState, useMemo } from "react";
import { Card, Input, Toggle, SectionLabel } from "../components/ui.jsx";
import { calcDay, estimateDeductions, defaultSettings } from "../utils/calc.js";
import { getYukyuEntitlement } from "../utils/yukyu.js";
import { YEN, fmtDate, currentMonth } from "../utils/fmt.js";
import { TeateSection } from "../components/TeateSection.jsx";

export function Settings({ settings, setSettings, entries, auditHistory, setAuditHistory }) {
  const [form, setForm] = useState(settings);
  const [auditMonth, setAuditMonth] = useState(currentMonth);
  const [auditBruto, setAuditBruto] = useState("");
  const [auditLiquido, setAuditLiquido] = useState("");
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setCustom = (k, v) => setForm(f => ({ ...f, customRules: { ...f.customRules, [k]: v } }));

  const entitlement = getYukyuEntitlement(form.hireDate);

  // Audit calc for selected month
  const { appBruto, appLiquido } = useMemo(() => {
    const monthEntries = entries.filter(e => e.date.slice(0, 7) === auditMonth).sort((a, b) => a.date.localeCompare(b.date));
    if (monthEntries.length === 0) return { appBruto: 0, appLiquido: 0 };
    let accOT = 0;
    let gross = 0;
    monthEntries.forEach(e => {
      const c = calcDay(e, settings, accOT);
      accOT += c.overtimeHours;
      gross += c.grossPay;
    });
    const teate = (settings.teate || []).filter(t => t.active).reduce((a, t) => a + (t.amount || 0), 0);
    const grossWithTeate = gross + teate;
    const { netPay } = estimateDeductions(grossWithTeate, settings);
    return { appBruto: grossWithTeate, appLiquido: netPay };
  }, [auditMonth, entries, settings]);

  function saveSettings() {
    setSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function saveAudit() {
    if (!auditBruto && !auditLiquido) return;
    const realBruto = parseFloat(auditBruto) || 0;
    const realLiquido = parseFloat(auditLiquido) || 0;
    const brutoAcc = realBruto > 0 ? Math.max(0, 100 - Math.abs(appBruto - realBruto) / realBruto * 100) : 0;
    const liquidoAcc = realLiquido > 0 ? Math.max(0, 100 - Math.abs(appLiquido - realLiquido) / realLiquido * 100) : 0;
    const record = { month: auditMonth, appBruto, appLiquido, realBruto, realLiquido, brutoAcc, liquidoAcc, savedAt: new Date().toISOString() };
    setAuditHistory(prev => [...prev.filter(a => a.month !== auditMonth), record].sort((a, b) => b.month.localeCompare(a.month)));
    setAuditBruto("");
    setAuditLiquido("");
  }

  const avgBrutoAcc = auditHistory.length > 0 ? auditHistory.reduce((a, r) => a + r.brutoAcc, 0) / auditHistory.length : null;
  const avgLiqAcc = auditHistory.length > 0 ? auditHistory.reduce((a, r) => a + r.liquidoAcc, 0) / auditHistory.length : null;

  function accColor(v) {
    if (v === null) return "var(--text-muted)";
    return v >= 95 ? "var(--positive)" : v >= 85 ? "var(--warning)" : "var(--negative)";
  }

  const serviceYears = entitlement?.yearsService ?? 0;
  const serviceMonths = entitlement?.monthsRemainder ?? 0;

  return (
    <div className="space-y-4 pb-24">
      <div>
        <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Configurações</div>
        <h1 className="text-lg font-bold" style={{ color: "var(--text)" }}>Config</h1>
      </div>

      {/* Worker profile */}
      <Card>
        <SectionLabel>Trabalhador</SectionLabel>
        <div className="space-y-3">
          <Input label="Nome" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Seu nome completo" />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Valor/hora (¥)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>¥</span>
                <input
                  type="number" min="0"
                  value={form.hourlyRate}
                  onChange={e => set("hourlyRate", parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text)" }}
                />
              </div>
            </div>
            <Input label="Idade" type="number" min="18" max="80" value={form.age} onChange={e => set("age", parseInt(e.target.value) || 0)} />
          </div>
          <Input label="Prefeitura" value={form.prefecture} onChange={e => set("prefecture", e.target.value)} placeholder="ex: Aichi" />
          <Input label="Data de contratação" type="date" value={form.hireDate} onChange={e => set("hireDate", e.target.value)} />
        </div>
      </Card>

      {/* Service time + Yukyu */}
      {form.hireDate && (
        <Card>
          <SectionLabel>Tempo de Serviço & 有給</SectionLabel>
          {entitlement && !entitlement.eligible ? (
            <div className="space-y-2">
              <div className="text-sm" style={{ color: "var(--text-sub)" }}>
                Ainda não elegível para 有給. Faltam <span className="font-bold" style={{ color: "var(--warning)" }}>{entitlement.monthsToFirst} meses</span>.
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                <div className="h-1.5 rounded-full" style={{ width: `${((6 - entitlement.monthsToFirst) / 6) * 100}%`, background: "var(--warning)" }} />
              </div>
            </div>
          ) : entitlement ? (
            <div className="space-y-3">
              <div className="text-sm" style={{ color: "var(--text-sub)" }}>
                {serviceYears > 0 ? `${serviceYears} ano${serviceYears > 1 ? "s" : ""}` : ""}{serviceMonths > 0 ? ` e ${serviceMonths} meses` : ""} de empresa
              </div>
              {entitlement.availableGrants.map((g, i) => {
                const daysLeft = Math.ceil((new Date(g.expiry + "T12:00:00") - new Date()) / 86400000);
                const c = daysLeft <= 90 ? "var(--negative)" : daysLeft <= 180 ? "var(--warning)" : "var(--positive)";
                return (
                  <div key={i} className="rounded-lg p-2.5" style={{ background: "var(--bg-elevated)", border: `1px solid ${c}33` }}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{g.days} dias</span>
                      <span className="text-xs" style={{ color: c }}>
                        {daysLeft <= 90 ? `⚠️ Vence em ${daysLeft} dias` : `${Math.floor(daysLeft / 30)} meses restantes`}
                      </span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Vence: {fmtDate(g.expiry, { day: "2-digit", month: "long", year: "numeric" })}</div>
                    <div className="h-1 mt-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-card)" }}>
                      <div className="h-1 rounded-full" style={{ width: `${Math.max(5, Math.min(100, (daysLeft / 730) * 100))}%`, background: c }} />
                    </div>
                  </div>
                );
              })}
              <div className="rounded-lg p-2.5" style={{ background: "var(--bg-elevated)" }}>
                <div className="flex justify-between">
                  <span className="text-sm" style={{ color: "var(--text-sub)" }}>Saldo disponível</span>
                  <span className="text-sm font-bold font-mono" style={{ color: "var(--positive)" }}>{entitlement.daysTotal} dias</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-sm" style={{ color: "var(--text-sub)" }}>Próxima concessão ({entitlement.nextGrantDays} dias)</span>
                  <span className="text-xs font-mono" style={{ color: "var(--warning)" }}>{entitlement.daysToNext} dias</span>
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      )}

      {/* Calc mode */}
      <Card>
        <SectionLabel>Modo de Cálculo</SectionLabel>
        <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
          {[{ v: "japan", label: "🇯🇵 Padrão Japão" }, { v: "custom", label: "⚙️ Personalizado" }].map(opt => (
            <button key={opt.v} onClick={() => set("mode", opt.v)} className="flex-1 py-2 text-sm font-medium transition-colors"
              style={form.mode === opt.v
                ? { background: "var(--text)", color: "var(--bg)" }
                : { background: "var(--bg-elevated)", color: "var(--text-sub)" }
              }
            >{opt.label}</button>
          ))}
        </div>
        {form.mode === "japan" && (
          <div className="mt-3 rounded-lg p-2.5 text-xs space-y-1" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            <div>8h/dia · 40h/semana · HE +25% (60h+: +50%)</div>
            <div>Noturno 22h–05h: +25% · Feriado: +35%</div>
            <div>Sábado (LSA Art.37): todas horas como HE</div>
          </div>
        )}
        {form.mode === "custom" && (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input label="Horas/dia" type="number" value={form.customRules?.dailyHours || 8} onChange={e => setCustom("dailyHours", parseFloat(e.target.value))} />
              <Input label="Horas/semana" type="number" value={form.customRules?.weeklyHours || 40} onChange={e => setCustom("weeklyHours", parseFloat(e.target.value))} />
              <Input label="HE % (normal)" type="number" step="5" value={(form.customRules?.overtimeRate || 0.25) * 100} onChange={e => setCustom("overtimeRate", parseFloat(e.target.value) / 100)} />
              <Input label="HE % (60h+)" type="number" step="5" value={(form.customRules?.overtimeHighRate || 0.50) * 100} onChange={e => setCustom("overtimeHighRate", parseFloat(e.target.value) / 100)} />
              <Input label="Sábado %" type="number" step="5" value={(form.customRules?.saturdayRate || 0) * 100} onChange={e => setCustom("saturdayRate", parseFloat(e.target.value) / 100)} />
              <Input label="Domingo %" type="number" step="5" value={(form.customRules?.sundayRate || 0) * 100} onChange={e => setCustom("sundayRate", parseFloat(e.target.value) / 100)} />
            </div>
          </div>
        )}
      </Card>

      {/* Deductions */}
      <Card>
        <SectionLabel>Descontos & Seguros</SectionLabel>
        <div className="space-y-3">
          <Toggle label="Kousei Nenkin 厚生年金" note="Pensão — aprox. 9.15%" checked={form.pension !== false} onChange={v => set("pension", v)} />
          <Toggle label="Kenkou Hoken 健康保険" note="Saúde — aprox. 5.25% (Aichi-ken)" checked={form.healthInsurance !== false} onChange={v => set("healthInsurance", v)} />
          <Toggle label="Koyou Hoken 雇用保険" note="Seguro-desemprego — aprox. 0.6%" checked={form.employmentInsurance !== false} onChange={v => set("employmentInsurance", v)} />
          <Toggle label="Juumin Zei 住民税" note="Imposto municipal — aprox. 10%/ano" checked={form.municipalTax !== false} onChange={v => set("municipalTax", v)} />
          {form.age >= 40 && (
            <div className="rounded-lg p-2.5 text-xs" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)", color: "var(--info)" }}>
              介護保険 (Kaigo Hoken) aplicado automaticamente — idade ≥40 · 0.82%
            </div>
          )}
          <div className="rounded-lg p-2.5 text-xs space-y-1" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            <div className="font-semibold" style={{ color: "var(--text-sub)" }}>Aichi-ken (cooperativa caminhoneiros)</div>
            <div>健康保険 10.5% total · 厚生年金 18.3% total · 介護 1.64% (40+)</div>
          </div>
        </div>
      </Card>

      {/* Break default */}
      <Card>
        <SectionLabel>Padrão de Jornada</SectionLabel>
        <Input label="Break padrão (minutos)" type="number" min="0" max="120" value={form.defaultBreak || 60} onChange={e => set("defaultBreak", parseInt(e.target.value) || 0)} />
      </Card>

      {/* Teate */}
      <Card>
        <SectionLabel>手当 — Benefícios Fixos</SectionLabel>
        <TeateSection teate={form.teate || []} onChange={v => set("teate", v)} />
      </Card>

      {/* Audit */}
      <Card>
        <SectionLabel>🎯 Auditoria de Acertividade</SectionLabel>
        <div className="space-y-3">
          {auditHistory.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg p-2.5 text-center" style={{ background: "var(--bg-elevated)" }}>
                <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Média Bruto</div>
                <div className="text-base font-bold font-mono" style={{ color: accColor(avgBrutoAcc) }}>{avgBrutoAcc?.toFixed(1)}%</div>
              </div>
              <div className="rounded-lg p-2.5 text-center" style={{ background: "var(--bg-elevated)" }}>
                <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Média Líquido</div>
                <div className="text-base font-bold font-mono" style={{ color: accColor(avgLiqAcc) }}>{avgLiqAcc?.toFixed(1)}%</div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input type="month" value={auditMonth} onChange={e => setAuditMonth(e.target.value)}
                className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text)" }}
              />
            </div>
            <div className="rounded-lg p-2.5 text-xs" style={{ background: "var(--bg-elevated)" }}>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>App calcula (bruto)</span>
                <span className="font-mono" style={{ color: "var(--text)" }}>{YEN(appBruto)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ color: "var(--text-muted)" }}>App calcula (líquido)</span>
                <span className="font-mono" style={{ color: "var(--text)" }}>{YEN(appLiquido)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>Holerite bruto (¥)</label>
                <input type="number" value={auditBruto} onChange={e => setAuditBruto(e.target.value)}
                  className="rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text)" }}
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>Holerite líquido (¥)</label>
                <input type="number" value={auditLiquido} onChange={e => setAuditLiquido(e.target.value)}
                  className="rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text)" }}
                  placeholder="0"
                />
              </div>
            </div>
            <button onClick={saveAudit} className="w-full py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--info)", color: "#fff" }}>
              Registrar Holerite Real
            </button>
          </div>

          {auditHistory.length > 0 && (
            <div className="space-y-1.5 border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <div className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Histórico</div>
              {auditHistory.map(r => (
                <div key={r.month} className="rounded-lg p-2.5" style={{ background: "var(--bg-elevated)" }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium" style={{ color: "var(--text)" }}>{r.month}</span>
                    <div className="flex gap-2">
                      <span className="text-xs font-mono" style={{ color: accColor(r.brutoAcc) }}>B:{r.brutoAcc.toFixed(0)}%</span>
                      <span className="text-xs font-mono" style={{ color: accColor(r.liquidoAcc) }}>L:{r.liquidoAcc.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    <span>App: {YEN(r.appBruto)} / {YEN(r.appLiquido)}</span>
                    <span>Real: {YEN(r.realBruto)} / {YEN(r.realLiquido)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <button
        onClick={saveSettings}
        className="w-full py-3 rounded-xl font-bold text-sm transition-all"
        style={{ background: saved ? "var(--positive)" : "var(--text)", color: saved ? "#fff" : "var(--bg)" }}
      >
        {saved ? "✓ Salvo!" : "Salvar Configurações"}
      </button>
    </div>
  );
}
