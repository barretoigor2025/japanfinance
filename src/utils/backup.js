export function exportBackup(entries, settings, gastos, carro, auditHistory) {
  const data = {
    version: 4,
    exportedAt: new Date().toISOString(),
    entries: entries || [],
    settings: settings || {},
    gastos: gastos || null,
    carro: carro || null,
    auditHistory: auditHistory || [],
  };
  const json = JSON.stringify(data, null, 2);
  try {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jst-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {}
  return json;
}

export function parseBackup(jsonText) {
  const data = JSON.parse(jsonText);
  if (!data.entries || !Array.isArray(data.entries)) {
    throw new Error("Arquivo inválido");
  }
  return data;
}
