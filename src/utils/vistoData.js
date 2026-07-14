// ═══════════════════════════════════════════════════════════════════════════
// Dados de renovação de visto — fonte: Immigration Services Agency of Japan
// (出入国在留管理庁 / ISA), domínio moj.go.jp/isa. Pesquisado em jul/2026.
// Cobre apenas os status "baseados em família/descendência" (身分系):
// Residente de Longo Prazo (定住者, inclui descendentes Nikkei), Cônjuge/Filho
// de Nacional Japonês (日本人の配偶者等) e Cônjuge/Filho de Residente
// Permanente (永住者の配偶者等) — os mesmos indicados pelo usuário.
// ═══════════════════════════════════════════════════════════════════════════

const BASE = "https://www.moj.go.jp";

// Formulário de renovação e carta de garantidor são os MESMOS arquivos para
// todos os status "baseados em família" cobertos aqui (confirmado em cada
// página oficial buscada).
export const FORM_COMUM = {
  pdf: BASE + "/isa/content/930004114.pdf",
  xlsx: BASE + "/isa/content/930004115.xlsx",
};
export const GARANTIDOR = {
  pdf: BASE + "/isa/content/001373949.pdf",
  pdfEn: BASE + "/isa/content/001373950.pdf",
};
export const QUESTIONARIO_PT = BASE + "/isa/content/930003540.pdf";

// ── Grupos e variantes ────────────────────────────────────────────────────
// Cada "variante" é uma folha com o link do checklist oficial completo
// específico daquele caso (todas as URLs abaixo foram verificadas ao vivo,
// retornando HTTP 200, antes de entrarem aqui).
export const VISTO_GRUPOS = [
  {
    id: "nikkei3",
    label: "Descendente Nikkei — 3ª geração",
    jp: "日系３世（定住者）",
    em: "🎌",
    fonte: BASE + "/isa/applications/status/longtermresident_01.html",
    temEtapa: true, // primeira renovação vs. renovações seguintes
    variantes: [
      { id: "primeira_empregado", etapa: "primeira", label: "1ª renovação — empregado(a)", checklistUrl: BASE + "/isa/content/001426567.pdf" },
      { id: "primeira_autonomo", etapa: "primeira", label: "1ª renovação — autônomo(a)/empresário(a)", checklistUrl: BASE + "/isa/content/001426568.pdf" },
      { id: "primeira_desempregado", etapa: "primeira", label: "1ª renovação — desempregado(a)", checklistUrl: BASE + "/isa/content/001426569.pdf" },
      { id: "primeira_dependente", etapa: "primeira", label: "1ª renovação — dependente dos pais", checklistUrl: BASE + "/isa/content/001426570.pdf" },
      { id: "seguinte_empregado", etapa: "seguinte", label: "Renovação seguinte — empregado(a)", checklistUrl: BASE + "/isa/content/001426572.pdf" },
      { id: "seguinte_autonomo", etapa: "seguinte", label: "Renovação seguinte — autônomo(a)/empresário(a)", checklistUrl: BASE + "/isa/content/001426573.pdf" },
      { id: "seguinte_desempregado", etapa: "seguinte", label: "Renovação seguinte — desempregado(a)", checklistUrl: BASE + "/isa/content/001426574.pdf" },
      { id: "seguinte_dependente", etapa: "seguinte", label: "Renovação seguinte — dependente dos pais", checklistUrl: BASE + "/isa/content/001426575.pdf" },
    ],
  },
  {
    id: "conjuge_nikkei2",
    label: "Cônjuge de descendente Nikkei — 2ª geração",
    jp: "日系２世の配偶者（定住者）",
    em: "💞",
    fonte: BASE + "/isa/applications/status/longtermresident01.html",
    variantes: [
      { id: "empregado", label: "Cônjuge Nikkei é empregado(a)", checklistUrl: BASE + "/isa/content/001426582.pdf" },
      { id: "autonomo", label: "Cônjuge Nikkei é autônomo(a)/empresário(a)", checklistUrl: BASE + "/isa/content/001426588.pdf" },
      { id: "desempregado", label: "Cônjuge Nikkei está desempregado(a)", checklistUrl: BASE + "/isa/content/001426601.pdf" },
    ],
  },
  {
    id: "conjuge_nikkei3",
    label: "Cônjuge de descendente Nikkei — 3ª geração",
    jp: "日系３世の配偶者（定住者）",
    em: "💞",
    fonte: BASE + "/isa/applications/status/logntermresident03.html",
    variantes: [
      { id: "empregado", label: "Cônjuge Nikkei é empregado(a)", checklistUrl: BASE + "/isa/content/001426606.pdf" },
      { id: "autonomo", label: "Cônjuge Nikkei é autônomo(a)/empresário(a)", checklistUrl: BASE + "/isa/content/001426612.pdf" },
      { id: "desempregado", label: "Cônjuge Nikkei está desempregado(a)", checklistUrl: BASE + "/isa/content/001426616.pdf" },
    ],
  },
  {
    id: "spousejapanese",
    label: "Casado(a) ou filho(a) de japonês(a)",
    jp: "日本人の配偶者等",
    em: "💍",
    fonte: BASE + "/isa/applications/status/spouseorchildofjapanese.html",
    variantes: [
      { id: "conjuge", label: "Sou cônjuge (marido/esposa) de japonês(a)", checklistUrl: BASE + "/isa/content/001426542.pdf" },
      { id: "filho", label: "Sou filho(a) ou adotivo(a) especial de japonês(a)", checklistUrl: BASE + "/isa/content/001426549.pdf" },
    ],
  },
  {
    id: "spousepr",
    label: "Casado(a) ou filho(a) de Residente Permanente",
    jp: "永住者の配偶者等",
    em: "💑",
    fonte: BASE + "/isa/applications/status/spouseorchildofpermanentresident.html",
    variantes: [
      { id: "unico", label: "Cônjuge ou filho(a) de Residente Permanente", checklistUrl: BASE + "/isa/content/001426555.pdf" },
    ],
  },
];

export function findVariante(grupoId, varianteId) {
  const grupo = VISTO_GRUPOS.find(g => g.id === grupoId);
  if (!grupo) return null;
  const variante = grupo.variantes.find(v => v.id === varianteId) || grupo.variantes[0];
  return { grupo, variante };
}

// ── Checklist "comum" ──────────────────────────────────────────────────────
// Itens que se repetem, com pequenas variações, em praticamente todas as
// páginas oficiais buscadas para estes status "baseados em família". Cada
// grupo/variante liga aqui os itens que fazem sentido pro seu caso — mas o
// checklist OFICIAL completo (link acima) é sempre a fonte definitiva.
export function buildChecklist(grupoId, varianteId) {
  const found = findVariante(grupoId, varianteId);
  if (!found) return [];
  const { variante } = found;
  const isNikkeiDireto = grupoId === "nikkei3";
  const isConjugeNikkei = grupoId === "conjuge_nikkei2" || grupoId === "conjuge_nikkei3";
  const isFamiliaBase = grupoId === "spousejapanese" || grupoId === "spousepr" || isConjugeNikkei;

  const items = [
    {
      id: "formulario",
      grupo: "formulario",
      label: "Formulário de renovação (在留期間更新許可申請書)",
      desc: "1 via, preenchida e assinada.",
      dl: [{ label: "PDF", url: FORM_COMUM.pdf }, { label: "Excel", url: FORM_COMUM.xlsx }],
    },
    {
      id: "foto",
      grupo: "outros",
      label: "1 foto 4cm × 3cm",
      desc: "Tirada nos últimos 6 meses, fundo neutro, sem óculos escuros/chapéu.",
    },
    {
      id: "passaporte",
      grupo: "apresentar",
      label: "Passaporte",
      desc: "Só para apresentar no balcão — não precisa entregar cópia.",
    },
    {
      id: "zairyu",
      grupo: "apresentar",
      label: "Cartão de residência (在留カード)",
      desc: "Só para apresentar no balcão — não precisa entregar cópia.",
    },
    {
      id: "garantidor",
      grupo: "formulario",
      label: "Carta de garantidor (身元保証書)",
      desc: "Preenchida e assinada por um garantidor no Japão (geralmente o cônjuge ou familiar).",
      dl: [{ label: "PDF (japonês)", url: GARANTIDOR.pdf }, { label: "PDF (inglês)", url: GARANTIDOR.pdfEn }],
    },
    {
      id: "juminhyo",
      grupo: "prefeitura",
      label: "Comprovante de residência (住民票)",
      desc: "Emitido pela prefeitura da sua cidade — peça um com todos os moradores do domicílio.",
    },
    {
      id: "kazei",
      grupo: "prefeitura",
      label: "Certidão de imposto residencial e comprovante de pagamento (課税・納税証明書)",
      desc: "Do ano fiscal mais recente — emitida pela prefeitura.",
    },
  ];

  if (isFamiliaBase) {
    items.push({
      id: "questionario",
      grupo: "formulario",
      label: "Questionário (質問書)",
      desc: "Só é exigido em alguns casos — confira no checklist oficial da sua variante.",
      dl: [{ label: "PDF (português)", url: QUESTIONARIO_PT }],
    });
  }

  if (isNikkeiDireto || isConjugeNikkei) {
    items.push({
      id: "koseki",
      grupo: "prefeitura",
      label: "Certidão de registro familiar do(a) avô/avó japonês(a) (戸籍謄本)",
      desc: "Comprova a linhagem japonesa — emitida no Japão (prefeitura) ou solicitada ao consulado, conforme o caso.",
    });
  }

  if (variante.etapa === "primeira" || (isFamiliaBase && !isConjugeNikkei)) {
    items.push({
      id: "antecedentes",
      grupo: "outros",
      label: "Certidão de antecedentes criminais do país de origem",
      desc: "Só é exigida se você nunca enviou uma antes à Imigração.",
    });
  }

  if (isNikkeiDireto || isConjugeNikkei) {
    const situacao = variante.id.includes("autonomo")
      ? { label: "Cópia da declaração de imposto de renda (confirmação) e do alvará/licença do negócio", desc: "Comprovando a atividade autônoma/empresarial." }
      : variante.id.includes("desempregado")
      ? { label: "Extrato bancário recente", desc: "Comprovando meios de subsistência enquanto desempregado(a)." }
      : variante.id.includes("dependente")
      ? { label: "Comprovante de emprego/renda de quem sustenta você", desc: "Do pai, mãe ou responsável." }
      : { label: "Declaração de emprego (在職証明書)", desc: "Emitida pelo empregador atual." };
    items.push({ id: "trabalho", grupo: "outros", ...situacao });
  }

  if (grupoId === "nikkei3" && variante.id.startsWith("seguinte")) {
    items.push({
      id: "japones",
      grupo: "outros",
      label: "Comprovante de nível de japonês (se for pedir 5 anos de visto)",
      desc: "Ex.: certificado JLPT N3 (104+ pontos) ou N2 — só necessário se estiver solicitando o prazo máximo de 5 anos.",
    });
  }

  return items;
}

export const CHECKLIST_GRUPOS_LABEL = {
  formulario: { label: "📝 Formulários para baixar e preencher", cor: "var(--accent)" },
  prefeitura: { label: "🏢 Buscar na prefeitura", cor: "var(--info)" },
  apresentar: { label: "🪪 Só apresentar (não precisa cópia)", cor: "var(--text-muted)" },
  outros: { label: "📎 Outros documentos", cor: "var(--warning)" },
};

// ── Regra oficial de quando pode pedir renovação ───────────────────────────
// Fonte literal (ISA, 16-3.html): "在留期間の満了する日以前（６か月以上の在留
// 期間を有する者にあっては在留期間の満了する概ね３か月前から）" — ou seja,
// para quem tem prazo de estadia de 6 meses ou mais (todos os status cobertos
// aqui têm), o pedido é aceito a partir de aproximadamente 3 meses antes do
// vencimento.
export const DIAS_JANELA_RENOVACAO = 90;

export function calcStatus(validade) {
  if (!validade) return null;
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const venc = new Date(validade + "T00:00:00");
  const diffMs = venc - hoje;
  const diasRestantes = Math.round(diffMs / 86400000);

  if (diasRestantes < 0) {
    return { nivel: "vencido", diasRestantes, cor: "var(--negative)", titulo: "⚠️ Visto vencido", msg: `Venceu há ${Math.abs(diasRestantes)} dia(s). Procure a Imigração o quanto antes.` };
  }
  if (diasRestantes === 0) {
    return { nivel: "vence_hoje", diasRestantes, cor: "var(--negative)", titulo: "🚨 Vence hoje!", msg: "Último dia — vá à Imigração hoje se ainda não deu entrada." };
  }
  if (diasRestantes <= DIAS_JANELA_RENOVACAO) {
    const urgente = diasRestantes <= 14;
    return {
      nivel: urgente ? "urgente" : "pode_renovar",
      diasRestantes,
      cor: urgente ? "var(--negative)" : "var(--positive)",
      titulo: urgente ? "🚨 Faltam poucos dias!" : "✅ Já pode pedir a renovação",
      msg: `Vence em ${diasRestantes} dia(s). Você já está dentro da janela oficial de ${DIAS_JANELA_RENOVACAO} dias — pode dar entrada na renovação agora.`,
    };
  }
  const diasAteJanela = diasRestantes - DIAS_JANELA_RENOVACAO;
  return {
    nivel: "aguardando",
    diasRestantes,
    cor: "var(--info)",
    titulo: "🕐 Ainda não é possível renovar",
    msg: `Vence em ${diasRestantes} dia(s). A janela de renovação abre em ${diasAteJanela} dia(s) (${DIAS_JANELA_RENOVACAO} dias antes do vencimento).`,
  };
}
