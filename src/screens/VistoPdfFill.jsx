import { useState } from "react";
import { Card, SectionLabel, Input, Pills, Spinner } from "../components/ui.jsx";
import { FIELD_SECTIONS, emptyFormValues, fillSpousePrPdf } from "../utils/pdfSpousePrFill.js";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Field({ field, value, onChange }) {
  if (field.type === "choice") {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{field.label} <span className="normal-case">({field.jp})</span></label>
        <Pills options={field.options} value={value} onChange={onChange} />
      </div>
    );
  }
  if (field.type === "date") {
    return (
      <Input
        label={`${field.label} (${field.jp})`}
        type="date"
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      />
    );
  }
  if (field.multiline) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{field.label} <span className="normal-case">({field.jp})</span></label>
        <textarea
          rows={2}
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="rounded-lg px-3 py-2 text-sm focus:outline-none transition-all resize-none"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text)" }}
        />
      </div>
    );
  }
  return (
    <Input
      label={`${field.label} (${field.jp})`}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder}
    />
  );
}

export function VistoPdfFill({ visto, setVisto }) {
  const scoped = visto?.grupoId === "spousepr";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const dados = { ...emptyFormValues(), ...(visto?.pdfDados || {}) };
  if (!dados.currentExpiry && visto?.validade) dados.currentExpiry = visto.validade;

  function setField(id, val) {
    setVisto(v => ({ ...v, pdfDados: { ...(v.pdfDados || {}), [id]: val } }));
  }

  async function gerar() {
    if (!dados.relationship) {
      setError("Selecione se você é cônjuge ou filho(a) do Residente Permanente (seção \"Casamento e trabalho do cônjuge\") antes de gerar o PDF.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const bytes = await fillSpousePrPdf({ ...dados, signDate: dados.signDate || todayIso() });
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "zairyu-koshin-shinsei-preenchido.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      setError("Não foi possível gerar o PDF. Confira sua conexão e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  if (!scoped) {
    return (
      <div className="space-y-2">
        <Card>
          <p className="text-sm" style={{ color: "var(--text-sub)" }}>
            O preenchimento automático do PDF está disponível, por enquanto, só para quem é{" "}
            <b>cônjuge ou filho(a) de Residente Permanente</b> (永住者の配偶者等) — a mesma categoria
            já coberta pelo Checklist e pelo Agente.
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Cadastre esse tipo de visto na aba 📋 Checklist para liberar esta ferramenta.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Card>
        <p className="text-sm" style={{ color: "var(--text-sub)" }}>
          Preencha os campos abaixo (ficam salvos só no seu aparelho) e gere o{" "}
          <b>在留期間更新許可申請書</b> (formulário de renovação) já pronto para imprimir e assinar —
          com os dados posicionados nos lugares certos do PDF oficial.
        </p>
      </Card>

      {FIELD_SECTIONS.map(section => (
        <Card key={section.id}>
          <SectionLabel>{section.label}</SectionLabel>
          <div className="space-y-2.5">
            {section.fields.map(field => (
              <Field key={field.id} field={field} value={dados[field.id]} onChange={val => setField(field.id, val)} />
            ))}
          </div>
        </Card>
      ))}

      {error && (
        <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "var(--negative)" }}>
          {error}
        </div>
      )}

      <button
        onClick={gerar}
        disabled={busy}
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        style={{ background: "var(--info)", color: "#fff", opacity: busy ? 0.7 : 1 }}
      >
        {busy ? <><Spinner /> Gerando PDF…</> : "📄 Gerar PDF preenchido"}
      </button>

      <div className="rounded-xl p-3 text-xs" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
        🔒 Os dados ficam só no seu aparelho — nada é enviado para nenhum servidor. Confira sempre o
        PDF gerado antes de assinar; em caso de dúvida, o formulário em branco continua disponível na
        aba 📋 Checklist.
      </div>
    </div>
  );
}
