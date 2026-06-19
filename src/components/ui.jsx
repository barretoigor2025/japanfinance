// ── Design System ─────────────────────────────────────────────────────────────

export function Card({ children, className = "", style = {} }) {
  return (
    <div
      className={`rounded-xl p-2 ${className}`}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", ...style }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <div className="text-xs uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
      {children}
    </div>
  );
}

const BADGE_COLORS = {
  green:  { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",  text: "var(--positive)" },
  red:    { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  text: "var(--negative)" },
  yellow: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", text: "var(--warning)" },
  blue:   { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.3)", text: "var(--info)" },
  purple: { bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.3)", text: "var(--night)" },
  gray:   { bg: "var(--bg-elevated)",    border: "var(--border-mid)",     text: "var(--text-sub)" },
};

export function Badge({ color = "gray", children }) {
  const c = BADGE_COLORS[color] || BADGE_COLORS.gray;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      {children}
    </span>
  );
}

export function Input({ label, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</label>}
      <input
        className="rounded-lg px-3 py-2 text-sm focus:outline-none transition-all"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text)" }}
        {...props}
      />
    </div>
  );
}

export function Select({ label, children, className = "", ...props }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</label>}
      <select
        className="rounded-lg px-3 py-2 text-sm focus:outline-none transition-all"
        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text)" }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function Toggle({ checked, onChange, label, note }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className="relative shrink-0"
        style={{ width: 36, height: 20 }}
      >
        <div
          className="w-full h-full rounded-full transition-colors"
          style={{ background: checked ? "var(--positive)" : "var(--border-strong)" }}
        />
        <div
          className="absolute top-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? "translateX(16px)" : "translateX(2px)" }}
        />
      </div>
      {label && (
        <div className="flex flex-col">
          <span className="text-sm" style={{ color: "var(--text)" }}>{label}</span>
          {note && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{note}</span>}
        </div>
      )}
    </label>
  );
}

export function MonthPicker({ value, onChange }) {
  function prev() {
    const [y, m] = value.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  function next() {
    const [y, m] = value.split("-").map(Number);
    const d = new Date(y, m, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const label = new Date(value + "-01T12:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const cap = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div className="flex items-center gap-2">
      <button onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ background: "var(--bg-elevated)", color: "var(--text-sub)" }}>‹</button>
      <span className="text-sm font-medium flex-1 text-center" style={{ color: "var(--text)" }}>{cap}</span>
      <button onClick={next} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors" style={{ background: "var(--bg-elevated)", color: "var(--text-sub)" }}>›</button>
    </div>
  );
}

export function StatRow({ label, value, valueColor }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
      <span className="text-sm" style={{ color: "var(--text-sub)" }}>{label}</span>
      <span className="text-sm font-mono font-semibold" style={{ color: valueColor || "var(--text)" }}>{value}</span>
    </div>
  );
}

// BottomSheet — slides up from bottom for modals
export function BottomSheet({ onClose, children, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.7)" }} onClick={onClose}>
      <div
        className="w-full max-w-lg mx-auto rounded-t-2xl overflow-hidden max-h-[92dvh] flex flex-col"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{title}</span>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-lg" style={{ color: "var(--text-muted)" }}>×</button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// Pill button group
export function Pills({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
          style={value === o.value
            ? { background: "var(--text)", color: "var(--bg)" }
            : { background: "var(--bg-elevated)", color: "var(--text-sub)", border: "1px solid var(--border-mid)" }
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Inline confirm dialog
export function ConfirmBar({ message, onConfirm, onCancel }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
      <p className="text-xs mb-2" style={{ color: "var(--negative)" }}>{message}</p>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-1.5 rounded-lg text-xs" style={{ border: "1px solid var(--border-mid)", color: "var(--text-sub)" }}>Cancelar</button>
        <button onClick={onConfirm} className="flex-1 py-1.5 rounded-lg text-xs font-bold" style={{ background: "var(--negative)", color: "#fff" }}>Confirmar</button>
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--border-mid)", borderTopColor: "var(--text)" }} />
    </div>
  );
}
