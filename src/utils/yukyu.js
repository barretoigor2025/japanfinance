const YUKYU_TABLE = [
  { minMonths: 78, days: 20 },
  { minMonths: 66, days: 18 },
  { minMonths: 54, days: 16 },
  { minMonths: 42, days: 14 },
  { minMonths: 30, days: 12 },
  { minMonths: 18, days: 11 },
  { minMonths: 6,  days: 10 },
];

function getDays(months) {
  for (const row of YUKYU_TABLE) {
    if (months >= row.minMonths) return row.days;
  }
  return 0;
}

function getMonthsDiff(from, to) {
  const f = new Date(from + "T12:00:00");
  const t = new Date(to + "T12:00:00");
  return (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth());
}

function addMonths(dateStr, n) {
  const d = new Date(dateStr + "T12:00:00");
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}

export function getYukyuEntitlement(hireDate) {
  if (!hireDate) return null;
  const today = new Date().toISOString().slice(0, 10);
  const totalMonths = getMonthsDiff(hireDate, today);

  if (totalMonths < 6) {
    return {
      eligible: false,
      monthsToFirst: 6 - totalMonths,
      daysTotal: 0,
      grants: [],
      availableGrants: [],
    };
  }

  const grants = [];
  let grantDate = addMonths(hireDate, 6);
  let cycleMonths = 6;

  while (grantDate <= today) {
    const days = getDays(cycleMonths);
    const expiry = addMonths(grantDate, 24);
    grants.push({
      date: grantDate,
      days,
      expiry,
      expired: expiry < today,
      monthsService: cycleMonths,
    });
    grantDate = addMonths(grantDate, 12);
    cycleMonths += 12;
  }

  const availableGrants = grants.filter(g => !g.expired);
  const daysTotal = availableGrants.reduce((a, g) => a + g.days, 0);

  const nextGrantDate = grantDate;
  const nextGrantDays = getDays(cycleMonths);
  const daysToNext = Math.ceil((new Date(nextGrantDate + "T12:00:00") - new Date()) / 86400000);

  const expiringAlerts = availableGrants
    .map(g => ({ ...g, daysLeft: Math.ceil((new Date(g.expiry + "T12:00:00") - new Date()) / 86400000) }))
    .filter(g => g.daysLeft <= 90 && g.daysLeft > 0);

  return {
    eligible: true,
    daysTotal,
    grants,
    availableGrants,
    nextGrantDate,
    nextGrantDays,
    daysToNext,
    expiringAlerts,
    totalMonths,
    yearsService: Math.floor(totalMonths / 12),
    monthsRemainder: totalMonths % 12,
  };
}

export function getYukyuUsed(entries) {
  return (entries || []).filter(e => e.dayType === "yukyu");
}
