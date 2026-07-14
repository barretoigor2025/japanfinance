import { useState } from "react";
import { Card, SectionLabel, Badge } from "../components/ui.jsx";
import {
  VISTO_GRUPOS, findVariante, buildChecklist, CHECKLIST_GRUPOS_LABEL,
  calcStatus, DIAS_JANELA_RENOVACAO,
} from "../utils/vistoData.js";

export function VistoJapones({ visto, setVisto }) {
  const [wizGrupo, setWizGrupo] = useState(null);
  const [wizVariante, setWizVariante] = useState(null);
  const [wizData, setWizData] = useState("");
  const [editing, setEditing] = useState(false);

  const registrado = !!(visto?.grupoId && visto?.validade) && !editing;

  // ── Assistente de cadastro ─────────────────────────────────────────────
  if (!registrado) {
    const grupo = VISTO_GRUPOS.find(g => g.id === wizGrupo);

    function iniciarEdicao() {
      setWizGrupo(visto?.grupoId || null);
      setWizVariante(visto?.varianteId || null);
      setWizData(visto?.validade || "");
    }

    function confirmarCadastro() {
      if (!wizGrupo || !wizVariante || !wizData) return;
      setVisto({ grupoId: wizGrupo, varianteId: wizVariante, validade: wizData, checklist: editing && visto?.grupoId === wizGrupo && visto?.varianteId === wizVariante ? visto.checklist : {} });
      setEditing(false);
      setWizGrupo(null); setWizVariante(null); setWizData("");
    }

    return (
      <div className="space-y-2 pb-20">
        <div>
          <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Visto Japonês</div>
          <h1 className="text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>Cadastrar seu visto</h1>
        </div>

        {visto?.grupoId && !editing && (
          <Card>
            <p className="text-sm mb-2" style={{ color: "var(--text-sub)" }}>Você já tem um visto cadastrado.</p>
            <button onClick={iniciarEdicao} className="w-full py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text)" }}>
              ✎ Editar cadastro atual
            </button>
          </Card>
        )}

        <Card>
          <SectionLabel>1. Qual é o seu tipo de visto?</SectionLabel>
          <div className="space-y-1.5">
            {VISTO_GRUPOS.map(g => (
              <button
                key={g.id}
                onClick={() => { setWizGrupo(g.id); setWizVariante(null); }}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-colors"
                style={wizGrupo === g.id
                  ? { background: "rgba(96,165,250,0.1)", border: "1.5px solid var(--info)" }
                  : { background: "var(--bg-elevated)", border: "1.5px solid var(--border-mid)" }}
              >
                <span className="text-lg shrink-0">{g.em}</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold" style={{ color: "var(--text)" }}>{g.label}</span>
                  <span className="block text-xs" style={{ color: "var(--text-muted)" }}>{g.jp}</span>
                </span>
              </button>
            ))}
          </div>
        </Card>

        {grupo && (
          <Card>
            <SectionLabel>2. Qual é a sua situação exata?</SectionLabel>
            <div className="space-y-1.5">
              {grupo.variantes.map(v => (
                <button
                  key={v.id}
                  onClick={() => setWizVariante(v.id)}
                  className="w-full text-left p-2.5 rounded-xl text-sm transition-colors"
                  style={wizVariante === v.id
                    ? { background: "rgba(96,165,250,0.1)", border: "1.5px solid var(--info)", color: "var(--text)" }
                    : { background: "var(--bg-elevated)", border: "1.5px solid var(--border-mid)", color: "var(--text-sub)" }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </Card>
        )}

        {wizVariante && (
          <Card>
            <SectionLabel>3. Quando vence seu visto atual?</SectionLabel>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>A data está no seu cartão de residência (在留カード), campo "在留期間（満了日）".</p>
            <input
              type="date"
              value={wizData}
              onChange={e => setWizData(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-mid)", color: "var(--text)" }}
            />
          </Card>
        )}

        {wizGrupo && wizVariante && wizData && (
          <button onClick={confirmarCadastro} className="w-full py-3 rounded-xl font-bold text-sm" style={{ background: "var(--info)", color: "#fff" }}>
            ✓ Salvar e ver meu checklist
          </button>
        )}

        {editing && (
          <button onClick={() => { setEditing(false); setWizGrupo(null); setWizVariante(null); setWizData(""); }} className="w-full py-2 rounded-xl text-xs" style={{ color: "var(--text-muted)" }}>
            Cancelar edição
          </button>
        )}

        <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.2)", color: "var(--text-sub)" }}>
          🔒 Fica só no seu aparelho. Cobrimos aqui os status baseados em família (定住者/Nikkei, cônjuge ou filho de japonês, cônjuge ou filho de Residente Permanente) — fonte oficial: Immigration Services Agency of Japan (moj.go.jp/isa).
        </div>
      </div>
    );
  }

  // ── Painel / checklist ──────────────────────────────────────────────────
  const { grupo, variante } = findVariante(visto.grupoId, visto.varianteId);
  const status = calcStatus(visto.validade);
  const itens = buildChecklist(visto.grupoId, visto.varianteId);
  const feitos = itens.filter(i => visto.checklist?.[i.id]).length;

  function toggleItem(id) {
    setVisto(v => ({ ...v, checklist: { ...v.checklist, [id]: !v.checklist?.[id] } }));
  }

  const gruposOrdem = ["formulario", "prefeitura", "apresentar", "outros"];

  return (
    <div className="space-y-2 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Visto Japonês</div>
          <h1 className="text-lg font-bold leading-tight" style={{ color: "var(--text)" }}>{grupo.label}</h1>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-sm"
          style={{ background: "var(--bg-elevated)", color: "var(--text-sub)", border: "1px solid var(--border-mid)" }}
          title="Editar cadastro"
        >
          ✎
        </button>
      </div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{variante.label}</p>

      {/* status card */}
      <Card style={{ borderColor: status.cor, borderWidth: 1.5 }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold" style={{ color: status.cor }}>{status.titulo}</span>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>vence {new Date(visto.validade + "T00:00:00").toLocaleDateString("pt-BR")}</span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-sub)" }}>{status.msg}</p>
        <div className="h-1.5 rounded-full overflow-hidden mt-2.5" style={{ background: "var(--bg-elevated)" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.max(4, Math.min(100, 100 - (status.diasRestantes / (DIAS_JANELA_RENOVACAO * 4)) * 100))}%`,
              background: status.cor,
            }}
          />
        </div>
      </Card>

      {/* checklist oficial completo */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>Checklist oficial completo</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Lista definitiva da Imigração para o seu caso exato</div>
          </div>
          <a href={variante.checklistUrl} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold shrink-0" style={{ background: "var(--text)", color: "var(--bg)" }}>
            ⬇ PDF
          </a>
        </div>
      </Card>

      {/* checklist interativo */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <SectionLabel>Meu checklist ({feitos}/{itens.length})</SectionLabel>
          <Badge color={feitos === itens.length ? "green" : "gray"}>{feitos === itens.length ? "completo ✓" : `${itens.length - feitos} faltando`}</Badge>
        </div>
        {gruposOrdem.map(gKey => {
          const doGrupo = itens.filter(i => i.grupo === gKey);
          if (!doGrupo.length) return null;
          return (
            <div key={gKey} className="mb-3 last:mb-0">
              <div className="text-xs font-semibold mb-1.5" style={{ color: CHECKLIST_GRUPOS_LABEL[gKey].cor }}>{CHECKLIST_GRUPOS_LABEL[gKey].label}</div>
              <div className="space-y-1.5">
                {doGrupo.map(item => {
                  const done = !!visto.checklist?.[item.id];
                  return (
                    <div key={item.id} className="rounded-lg p-2.5" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={done} onChange={() => toggleItem(item.id)} className="mt-0.5 shrink-0" style={{ width: 16, height: 16 }} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium" style={{ color: done ? "var(--positive)" : "var(--text)", textDecoration: done ? "line-through" : "none" }}>{item.label}</span>
                          <span className="block text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.desc}</span>
                        </span>
                      </label>
                      {item.dl && (
                        <div className="flex flex-wrap gap-1.5 mt-2 ml-[26px]">
                          {item.dl.map(d => (
                            <a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-md text-xs font-bold" style={{ background: "var(--text)", color: "var(--bg)" }}>
                              ⬇ {d.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </Card>

      <div className="rounded-xl p-3 text-xs" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
        Fonte oficial desta categoria:{" "}
        <a href={grupo.fonte} target="_blank" rel="noopener noreferrer" style={{ color: "var(--info)" }}>{grupo.fonte.replace("https://www.moj.go.jp", "moj.go.jp")}</a>
        . Regras mudam com frequência — confira sempre o checklist oficial antes de reunir os documentos.
      </div>
    </div>
  );
}
