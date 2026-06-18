import { YEN } from "../utils/fmt.js";

export function TeateSection({ teate = [], onChange }) {
  function update(id, field, value) {
    onChange(teate.map(t => t.id === id ? { ...t, [field]: value } : t));
  }
  function add() {
    onChange([...teate, { id: "t" + Date.now(), name: "新手当", label: "Novo benefício", amount: 0, taxable: true, active: true }]);
  }
  function remove(id) {
    onChange(teate.filter(t => t.id !== id));
  }

  const totalActive = teate.filter(t => t.active).reduce((a, t) => a + (t.amount || 0), 0);
  const totalTaxable = teate.filter(t => t.active && t.taxable).reduce((a, t) => a + (t.amount || 0), 0);
  const totalNonTaxable = teate.filter(t => t.active && !t.taxable).reduce((a, t) => a + (t.amount || 0), 0);

  return (
    <div className="space-y-2">
      {teate.map(t => (
        <div key={t.id} className="rounded-xl p-3 space-y-2 transition-all"
          style={{
            border: `1px solid ${t.active ? "var(--border-mid)" : "var(--border)"}`,
            background: t.active ? "var(--bg-elevated)" : "var(--bg-card)",
            opacity: t.active ? 1 : 0.5,
          }}>
          <div className="flex items-center gap-2">
            <div
              onClick={() => update(t.id, "active", !t.active)}
              className="shrink-0 cursor-pointer rounded-full transition-colors"
              style={{ width: 32, height: 18, background: t.active ? "var(--positive)" : "var(--border-strong)", position: "relative" }}
            >
              <div className="absolute top-0.5 h-3.5 w-3.5 bg-white rounded-full shadow transition-transform" style={{ transform: t.active ? "translateX(14px)" : "translateX(2px)" }} />
            </div>
            <input
              value={t.label}
              onChange={e => update(t.id, "label", e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
              style={{ color: "var(--text)" }}
              placeholder="Nome do benefício"
            />
            <button onClick={() => remove(t.id)} className="text-xs px-1" style={{ color: "var(--text-muted)" }}>✕</button>
          </div>
          <div className="flex gap-2 items-center">
            <input
              value={t.name}
              onChange={e => update(t.id, "name", e.target.value)}
              className="flex-1 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-mid)", color: "var(--text-muted)" }}
              placeholder="Nome japonês (opcional)"
            />
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-muted)" }}>¥</span>
              <input
                type="number" min="0"
                value={t.amount}
                onChange={e => update(t.id, "amount", parseInt(e.target.value) || 0)}
                className="w-28 rounded-lg pl-5 pr-2 py-1.5 text-xs font-mono focus:outline-none"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-mid)", color: "var(--text)" }}
              />
            </div>
            <button
              onClick={() => update(t.id, "taxable", !t.taxable)}
              className="text-xs px-2 py-1.5 rounded-lg border transition-all whitespace-nowrap"
              style={t.taxable
                ? { border: "1px solid rgba(245,158,11,0.4)", color: "var(--warning)", background: "rgba(245,158,11,0.08)" }
                : { border: "1px solid var(--border-mid)", color: "var(--text-sub)", background: "var(--bg-elevated)" }
              }
            >{t.taxable ? "tributável" : "não trib."}</button>
          </div>
        </div>
      ))}
      <button onClick={add} className="w-full py-2 rounded-xl border border-dashed text-xs" style={{ borderColor: "var(--border-mid)", color: "var(--text-muted)" }}>
        + Adicionar benefício
      </button>
      {teate.some(t => t.active) && (
        <div className="rounded-xl p-2.5 space-y-1" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--text-muted)" }}>Tributáveis</span>
            <span className="font-mono" style={{ color: "var(--warning)" }}>{YEN(totalTaxable)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: "var(--text-muted)" }}>Não tributáveis</span>
            <span className="font-mono" style={{ color: "var(--info)" }}>{YEN(totalNonTaxable)}</span>
          </div>
          <div className="flex justify-between text-xs border-t pt-1.5" style={{ borderColor: "var(--border)" }}>
            <span className="font-medium" style={{ color: "var(--text)" }}>Total 手当</span>
            <span className="font-mono font-bold" style={{ color: "var(--positive)" }}>{YEN(totalActive)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
