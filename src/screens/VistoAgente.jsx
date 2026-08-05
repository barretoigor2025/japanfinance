import { useState } from "react";
import { Card, SectionLabel } from "../components/ui.jsx";
import {
  EIJU_AUTOCHECK, EIJU_AUTOCHECK_FONTE, EIJU_CHECKLIST_OFICIAL,
  EIJU_GUIDELINE, EIJU_FONTE_PAGINA, EIJU_AVISO_RECENTE, EIJU_TAXA, EIJU_PRAZO_ANALISE,
  buildEijuChecklist,
} from "../utils/eijuData.js";
import { CHECKLIST_GRUPOS_LABEL, findVariante, buildChecklist } from "../utils/vistoData.js";

// ── Sub-tela: renovação (reaproveita os dados de cônjuge de Res. Permanente) ─
function RenovacaoResultado() {
  const { grupo, variante } = findVariante("spousepr", "unico");
  const itens = buildChecklist("spousepr", "unico");

  return (
    <div className="space-y-2">
      <Card>
        <p className="text-sm" style={{ color: "var(--text-sub)" }}>
          Como cônjuge de Residente Permanente, a renovação (1, 3 ou 5 anos) segue o mesmo
          checklist que já preparamos pra você na aba <b>📋 Checklist</b> — é só cadastrar a
          data de vencimento do seu visto lá que o painel de prazo e o checklist ficam prontos.
        </p>
      </Card>
      <Card>
        <SectionLabel>Documentos e formulário (mesma categoria)</SectionLabel>
        {itens.filter(i => i.dl).map(item => (
          <div key={item.id} className="rounded-lg p-2.5 mb-2 last:mb-0" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
            <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.label}</div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {item.dl.map(d => (
                <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: "var(--text)", color: "var(--bg)" }}>⬇ {d.label}</a>
              ))}
            </div>
          </div>
        ))}
        <a href={variante.checklistUrl} target="_blank" rel="noopener noreferrer" className="block text-center mt-1 py-2 rounded-lg text-xs font-bold" style={{ background: "var(--info)", color: "#fff" }}>⬇ Checklist oficial completo (PDF)</a>
      </Card>
      <div className="rounded-xl p-3 text-xs" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
        Fonte oficial: <a href={grupo.fonte} target="_blank" rel="noopener noreferrer" style={{ color: "var(--info)" }}>{grupo.fonte.replace("https://www.moj.go.jp", "moj.go.jp")}</a>
      </div>
    </div>
  );
}

// ── Sub-tela: pedido de Visto Permanente ────────────────────────────────────
function PermanenteFluxo() {
  const [passo, setPasso] = useState(0); // 0..EIJU_AUTOCHECK.length-1, depois "resultado"
  const [respostas, setRespostas] = useState({});
  const terminado = passo >= EIJU_AUTOCHECK.length;

  function responder(valor) {
    const pergunta = EIJU_AUTOCHECK[passo];
    setRespostas(r => ({ ...r, [pergunta.id]: valor }));
    setPasso(p => p + 1);
  }

  if (!terminado) {
    const pergunta = EIJU_AUTOCHECK[passo];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Pergunta {passo + 1} de {EIJU_AUTOCHECK.length}</span>
          {passo > 0 && (
            <button onClick={() => setPasso(p => p - 1)} className="text-xs" style={{ color: "var(--text-muted)" }}>← voltar</button>
          )}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${(passo / EIJU_AUTOCHECK.length) * 100}%`, background: "var(--info)" }} />
        </div>
        <Card>
          <p className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>{pergunta.texto}</p>
          {pergunta.ajuda && <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>{pergunta.ajuda}</p>}
          <div className="flex gap-2 mt-2">
            <button onClick={() => responder(true)} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: "var(--positive)", color: "#fff" }}>Sim</button>
            <button onClick={() => responder(false)} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: "var(--negative)", color: "#fff" }}>Não</button>
          </div>
        </Card>
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          Baseado na autoavaliação oficial da Imigração (planilha em{" "}
          <a href={EIJU_AUTOCHECK_FONTE} target="_blank" rel="noopener noreferrer" style={{ color: "var(--info)" }}>moj.go.jp/isa</a>).
        </p>
      </div>
    );
  }

  const falhas = EIJU_AUTOCHECK.filter(p => respostas[p.id] === false);
  const elegivel = falhas.length === 0;
  const itens = buildEijuChecklist();
  const gruposOrdem = ["formulario", "prefeitura", "apresentar", "outros"];

  return (
    <div className="space-y-2">
      <Card style={{ borderColor: elegivel ? "var(--positive)" : "var(--warning)", borderWidth: 1.5 }}>
        <div className="text-sm font-bold mb-1" style={{ color: elegivel ? "var(--positive)" : "var(--warning)" }}>
          {elegivel ? "✅ Você atende aos requisitos básicos" : `⚠️ ${falhas.length} pendência(s) encontrada(s)`}
        </div>
        <p className="text-xs" style={{ color: "var(--text-sub)" }}>
          {elegivel
            ? "Segundo a própria autoavaliação da Imigração, você passa nos requisitos básicos. Isso não garante aprovação — a decisão final é sempre da Imigração — mas é um bom sinal pra seguir com o pedido."
            : "A Imigração avisa: qualquer resposta \"Não\" aumenta bastante a chance de indeferimento. Veja abaixo o que precisa resolver antes de pedir:"}
        </p>
        {!elegivel && (
          <div className="mt-2 space-y-1.5">
            {falhas.map(f => (
              <div key={f.id} className="rounded-lg p-2 text-xs" style={{ background: "rgba(180,83,9,0.08)", border: "1px solid rgba(180,83,9,0.25)", color: "var(--text-sub)" }}>
                <b style={{ color: "var(--warning)" }}>{f.texto}</b>
                <div className="mt-1">{f.seNao}</div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => { setPasso(0); setRespostas({}); }} className="w-full mt-3 py-2 rounded-lg text-xs font-semibold" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text-sub)" }}>
          ↺ Refazer o questionário
        </button>
      </Card>

      <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.2)", color: "var(--text-sub)" }}>
        {EIJU_AVISO_RECENTE}
      </div>

      <Card>
        <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-muted)" }}>
          <span>💴 Taxa: {EIJU_TAXA}</span>
        </div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>⏱ Prazo de análise: {EIJU_PRAZO_ANALISE}</div>
      </Card>

      <Card>
        <SectionLabel>Documentos para reunir</SectionLabel>
        {gruposOrdem.map(gKey => {
          const doGrupo = itens.filter(i => i.grupo === gKey);
          if (!doGrupo.length) return null;
          return (
            <div key={gKey} className="mb-3 last:mb-0">
              <div className="text-xs font-semibold mb-1.5" style={{ color: CHECKLIST_GRUPOS_LABEL[gKey].cor }}>{CHECKLIST_GRUPOS_LABEL[gKey].label}</div>
              <div className="space-y-1.5">
                {doGrupo.map(item => (
                  <div key={item.id} className="rounded-lg p-2.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                    <div className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.desc}</div>
                    {item.dl && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.dl.map(d => (
                          <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: "var(--text)", color: "var(--bg)" }}>⬇ {d.label}</a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <a href={EIJU_CHECKLIST_OFICIAL} target="_blank" rel="noopener noreferrer" className="block text-center mt-2 py-2 rounded-lg text-xs font-bold" style={{ background: "var(--info)", color: "#fff" }}>⬇ Checklist oficial completo (Excel)</a>
      </Card>

      <div className="rounded-xl p-3 text-xs" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
        Fontes oficiais:{" "}
        <a href={EIJU_FONTE_PAGINA} target="_blank" rel="noopener noreferrer" style={{ color: "var(--info)" }}>documentos exigidos</a>
        {" · "}
        <a href={EIJU_GUIDELINE} target="_blank" rel="noopener noreferrer" style={{ color: "var(--info)" }}>diretrizes de elegibilidade</a>
        . Este questionário reproduz os mesmos 7 critérios da autoavaliação oficial da Imigração — não substitui análise de advogado ou gyoseishoshi.
      </div>
    </div>
  );
}

// ── Tela principal do Agente ────────────────────────────────────────────────
export function VistoAgente() {
  const [objetivo, setObjetivo] = useState(null); // null | "renovacao" | "permanente"

  if (!objetivo) {
    return (
      <div className="space-y-2">
        <Card>
          <SectionLabel>Quem você é</SectionLabel>
          <div className="rounded-xl p-2.5" style={{ background: "rgba(96,165,250,0.1)", border: "1.5px solid var(--info)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>💑 Casado(a) com uma pessoa que tem visto de Residente Permanente (永住者)</span>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Por enquanto o agente cobre só esse caso — mais categorias chegam depois.
          </p>
        </Card>

        <Card>
          <SectionLabel>O que você quer fazer?</SectionLabel>
          <div className="space-y-1.5">
            <button onClick={() => setObjetivo("renovacao")} className="w-full text-left p-3 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-mid)" }}>
              <span className="block text-sm font-semibold" style={{ color: "var(--text)" }}>🔄 Renovar meu visto atual</span>
              <span className="block text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Prazo de 1, 3 ou 5 anos — continuar como cônjuge de Residente Permanente</span>
            </button>
            <button onClick={() => setObjetivo("permanente")} className="w-full text-left p-3 rounded-xl" style={{ background: "var(--bg-elevated)", border: "1.5px solid var(--border-mid)" }}>
              <span className="block text-sm font-semibold" style={{ color: "var(--text)" }}>🏅 Pedir meu próprio Visto Permanente (永住)</span>
              <span className="block text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Deixar de depender do visto do seu cônjuge</span>
            </button>
          </div>
        </Card>

        <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.2)", color: "var(--text-sub)" }}>
          🔒 As respostas ficam só no seu navegador. Fontes: Immigration Services Agency of Japan (moj.go.jp/isa) — sem achismo, tudo com link pra fonte oficial.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button onClick={() => setObjetivo(null)} className="text-xs" style={{ color: "var(--text-muted)" }}>← Trocar objetivo</button>
      {objetivo === "renovacao" ? <RenovacaoResultado /> : <PermanenteFluxo />}
    </div>
  );
}
