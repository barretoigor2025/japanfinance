export function YEN(v) {
  if (v == null || isNaN(v)) return "¥0";
  return "¥" + Math.round(v).toLocaleString("ja-JP");
}

export function formatMinutes(mins) {
  if (!mins || mins <= 0) return "0h";
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export function parseTime(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fmtDate(dateStr, opts) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", opts);
}

export function fmtMonth(ym) {
  if (!ym) return "";
  const d = new Date(ym + "-01T12:00:00");
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function prevMonth(ym) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function nextMonth(ym) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
