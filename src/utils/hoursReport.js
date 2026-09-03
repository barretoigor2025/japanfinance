import { calcMonthEntries, getRules, estimateDeductions } from "./calc.js";
import { YEN, fmtDate } from "./fmt.js";

// Monta o texto do relatório de horas (estilo WhatsApp) para um mês
// específico — usado tanto na aba Jornada quanto em Relatórios, sempre
// com base no mês que está sendo visualizado na tela que chamou.
export function buildHoursReportText(entries, settings, month) {
  const rules = getRules(settings);

  const monthEntries = entries
    .filter(e => e.date.slice(0, 7) === month)
    .sort((a, b) => a.date.localeCompare(b.date));

  const calcs = calcMonthEntries(monthEntries, settings);

  const totalHours = calcs.reduce((a, c) => a + c.totalHours, 0);
  const otNormalHours = calcs.reduce((a, c) => a + (c.breakdown?.overtimeNormal || 0), 0);
  const otHighHours = calcs.reduce((a, c) => a + (c.breakdown?.overtimeHigh || 0), 0);
  const nightHours = calcs.reduce((a, c) => a + c.nightHours, 0);
  const normalHours = calcs.reduce((a, c) => a + c.normalHours, 0);
  const normalPaySum = calcs.reduce((a, c) => a + (c.normalPay || 0), 0);
  const overtimePaySum = calcs.reduce((a, c) => a + (c.overtimePay || 0), 0);
  const nightPaySum = calcs.reduce((a, c) => a + (c.nightPay || 0), 0);
  const holidayPaySum = calcs.reduce((a, c) => a + (c.holidayPay || 0), 0);
  const satSunPaySum = calcs.reduce((a, c) => a + (c.satSunPay || 0), 0);
  const grossSalary = calcs.reduce((a, c) => a + c.grossPay, 0);
  const totalTeate = (settings.teate || []).filter(t => t.active).reduce((a, t) => a + (t.amount || 0), 0);
  const grossWithTeate = grossSalary + totalTeate;
  const { netPay, totalDeductions } = estimateDeductions(grossWithTeate, settings);
  const yukyuDays = monthEntries.filter(e => e.dayType === "yukyu").length;
  const workedDays = monthEntries.filter(e => e.dayType !== "yukyu").length;

  const label = new Date(month + "-01T12:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const cap = label.charAt(0).toUpperCase() + label.slice(1);
  const lines = [];
  lines.push(`📊 *Relatório de Horas — ${cap}*`);
  lines.push("");
  lines.push(`Dias trabalhados: ${workedDays}${yukyuDays > 0 ? `  ·  有給: ${yukyuDays}` : ""}`);
  lines.push("");

  const otThreshold = rules.monthlyOvertimeThreshold || 60;
  const otRatePct = Math.round((rules.overtimeRate || 0) * 100);
  const otHighRatePct = Math.round((rules.overtimeHighRate || 0) * 100);
  const nightRatePct = Math.round((rules.nightRate || 0) * 100);
  const nightStart = rules.nightStart ?? 22;
  const nightEnd = rules.nightEnd ?? 5;

  lines.push("*Horas*");
  lines.push(`  Normais: ${normalHours.toFixed(1)}h`);
  lines.push(`  Extras (até ${otThreshold}h/mês, +${otRatePct}%): ${otNormalHours.toFixed(1)}h`);
  if (otHighHours > 0) lines.push(`  Extras (acima ${otThreshold}h/mês, +${otHighRatePct}%): ${otHighHours.toFixed(1)}h`);
  if (nightHours > 0) lines.push(`  Noturno (${nightStart}h–${nightEnd}h, +${nightRatePct}%): ${nightHours.toFixed(1)}h`);
  lines.push(`  *Total: ${totalHours.toFixed(1)}h*`);
  lines.push("");

  lines.push("*Pagamento (calculado pelo app)*");
  lines.push(`  Normal: ${YEN(normalPaySum)}`);
  lines.push(`  Hora extra: ${YEN(overtimePaySum)}`);
  if (nightPaySum > 0) lines.push(`  Noturno: ${YEN(nightPaySum)}`);
  if (holidayPaySum > 0) lines.push(`  Feriado: ${YEN(holidayPaySum)}`);
  if (satSunPaySum > 0) lines.push(`  Sáb/Dom: ${YEN(satSunPaySum)}`);
  lines.push(`  Salário (horas): ${YEN(grossSalary)}`);
  if (totalTeate > 0) lines.push(`  手当 (benefícios): +${YEN(totalTeate)}`);
  lines.push(`  Bruto total: ${YEN(grossWithTeate)}`);
  lines.push(`  Descontos (est.): -${YEN(totalDeductions)}`);
  lines.push(`  *Líquido (est.): ${YEN(netPay)}*`);
  lines.push("");

  // Dia a dia — inclui os dias sem lançamento ("não trabalhou") pra dar o
  // apanhado completo do mês, mas só até hoje se for o mês corrente (senão
  // os dias que ainda nem chegaram apareceriam como "não trabalhou").
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() + 1 === m;
  const lastDay = isCurrentMonth ? today.getDate() : daysInMonth;

  const entryByDate = {};
  monthEntries.forEach((e, i) => { entryByDate[e.date] = { e, c: calcs[i] }; });

  lines.push("*Diário*");
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${month}-${String(d).padStart(2, "0")}`;
    const dow = new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" });
    const dateLabel = fmtDate(dateStr, { day: "2-digit", month: "2-digit" });
    const found = entryByDate[dateStr];
    if (!found) {
      lines.push(`${dateLabel} (${dow}) não trabalhou`);
      continue;
    }
    const { e, c } = found;
    if (e.dayType === "yukyu") {
      lines.push(`${dateLabel} (${dow}) 有給休暇 (folga remunerada)`);
      continue;
    }
    const extras = [];
    if (c.overtimeHours > 0) extras.push(`HE ${c.overtimeHours.toFixed(1)}h`);
    if (c.nightHours > 0) extras.push(`Not ${c.nightHours.toFixed(1)}h`);
    const flag = e.dayType === "holiday" ? " [feriado]" : e.dayType === "saturday" ? " [sábado]" : e.dayType === "sunday" ? " [domingo]" : "";
    lines.push(`${dateLabel} (${dow}) trabalhou de ${e.start} às ${e.end} (${c.totalHours.toFixed(1)}h)${extras.length ? " — " + extras.join(", ") : ""}${flag}`);
  }

  return lines.join("\n");
}
