// ═══════════════════════════════════════════════════════════════════════════
// Dados de Visto Permanente (永住許可申請) para cônjuge de Residente
// Permanente — fonte: Immigration Services Agency of Japan (moj.go.jp/isa).
// Pesquisado em jul/2026, incluindo a planilha oficial de autoavaliação e a
// lista de documentos "永住者の配偶者" (baixadas e lidas linha a linha).
// ═══════════════════════════════════════════════════════════════════════════

const BASE = "https://www.moj.go.jp";

// ── Autoavaliação oficial (adaptada da planilha do ISA) ────────────────────
// Fonte literal: /isa/content/001428358.xlsx — "永住許可申請セルフチェック
// シート【在留資格「日本人の配偶者等」、「永住者の配偶者等」の方】". O
// próprio documento avisa: "一つでも「いいえ」に該当した場合、永住許可申請は
// 「不許可」となる可能性が高くなります" — qualquer "Não" aumenta bastante a
// chance de indeferimento.
export const EIJU_AUTOCHECK = [
  {
    id: "casamento",
    texto: "Sua vida de casamento real (convivência) já dura 3 anos ou mais, E você mora no Japão continuamente há 1 ano ou mais?",
    ajuda: "Regra oficial: \"実体を伴った婚姻生活が３年以上継続し、かつ、引き続き１年以上本邦に在留していること\".",
    seNao: "Você precisa completar 3 anos de casamento (com convivência real, não só no papel) E 1 ano de residência contínua no Japão antes de poder pedir.",
  },
  {
    id: "juminzei",
    texto: "Você pagou o imposto residencial (住民税) sempre em dia, sem atraso, nos últimos 3 anos?",
    ajuda: "Se você é sustentado(a) por outra pessoa, considere a situação de quem te sustenta.",
    seNao: "Regularize os atrasos e volte a pedir só depois de ter 3 anos seguidos de pagamento em dia — atraso mesmo que já pago conta como \"Não\".",
  },
  {
    id: "kokuzei",
    texto: "Você não tem nenhum imposto nacional em aberto (imposto de renda, imposto de renda de reconstrução, consumo, herança ou doação)?",
    seNao: "Quite qualquer imposto nacional pendente antes de pedir — peça a certidão \"納税証明書（その３）\" na Receita para confirmar.",
  },
  {
    id: "nenkin",
    texto: "Você pagou a contribuição de pensão (国民年金 ou 厚生年金) sempre em dia nos últimos 2 anos?",
    seNao: "Regularize os atrasos junto ao escritório de pensões (年金事務所) — são necessários 2 anos seguidos de pagamento em dia.",
  },
  {
    id: "hoken",
    texto: "Você pagou o seguro de saúde (健康保険 ou 国民健康保険) sempre em dia nos últimos 2 anos?",
    seNao: "Regularize os atrasos na prefeitura ou com seu empregador — são necessários 2 anos seguidos de pagamento em dia.",
  },
  {
    id: "prazo",
    texto: "Seu visto atual tem prazo de 3 anos ou 5 anos concedido (não é de 1 ano)?",
    ajuda: "É o maior prazo previsto para o seu status — confira no seu cartão de residência.",
    seNao: "Primeiro consiga a renovação para 3 ou 5 anos — com visto de 1 ano, o pedido de permanente tende a ser recusado.",
  },
  {
    id: "conduta",
    texto: "Você nunca recebeu multa penal, prisão ou reclusão por violar a lei japonesa?",
    seNao: "Antecedentes criminais no Japão praticamente inviabilizam o pedido — procure um advogado ou gyoseishoshi para avaliar seu caso específico.",
  },
];

export const EIJU_AUTOCHECK_FONTE = BASE + "/isa/content/001428358.xlsx";

// ── Formulários e documentos de apoio ───────────────────────────────────────
export const EIJU_FORM = {
  pdf: BASE + "/isa/content/930002835.pdf",
  xlsx: BASE + "/isa/content/930002836.xls",
  sample: BASE + "/isa/content/001459537.pdf",
};
export const EIJU_GARANTIDOR = { pdf: BASE + "/isa/content/930002536.pdf", pdfEn: BASE + "/isa/content/930002537.pdf" };
export const EIJU_CONSENT = { pdf: BASE + "/isa/content/001355579.pdf" }; // 了解書, obrigatório desde 01/10/2021
export const EIJU_ROSTER = BASE + "/isa/content/001427085.pdf"; // 親族一覧表 (lista de parentes)
export const EIJU_CHECKLIST_OFICIAL = BASE + "/isa/content/001422065.xlsx"; // checklist completo oficial — cônjuge de Residente Permanente
export const EIJU_GUIDELINE = BASE + "/isa/applications/resources/nyukan_nyukan50.html"; // ガイドライン oficial
export const EIJU_FONTE_PAGINA = BASE + "/isa/applications/procedures/zairyu_eijyu01.html";

// ── Checklist prático de documentos ─────────────────────────────────────────
// Baseado na planilha oficial "永住許可申請に係る提出書類一覧表（永住者又は
// 特別永住者の配偶者の方）" (20 itens, lida linha a linha) — agrupada aqui
// para ficar navegável; a planilha oficial completa (link acima) é sempre a
// fonte definitiva para conferência final.
export function buildEijuChecklist() {
  return [
    {
      id: "formulario",
      grupo: "formulario",
      label: "Formulário de pedido de Visto Permanente (永住許可申請書)",
      desc: "1 via, com todos os campos preenchidos.",
      dl: [{ label: "PDF", url: EIJU_FORM.pdf }, { label: "Excel", url: EIJU_FORM.xlsx }, { label: "Exemplo preenchido", url: EIJU_FORM.sample }],
    },
    {
      id: "foto",
      grupo: "outros",
      label: "1 foto 4cm × 3cm",
      desc: "Tirada nos últimos 6 meses, fundo neutro. Dispensada apenas para menores de 1 ano.",
    },
    {
      id: "certidao_casamento",
      grupo: "outros",
      label: "Certidão de casamento (ou documento equivalente)",
      desc: "Prova a relação conjugal com a pessoa Residente Permanente.",
    },
    {
      id: "juminhyo",
      grupo: "prefeitura",
      label: "Comprovante de residência de toda a família (住民票)",
      desc: "Peça um com TODOS os moradores do domicílio — sem o número de Mynumber.",
    },
    {
      id: "trabalho",
      grupo: "outros",
      label: "Comprovante de ocupação",
      desc: "Empregado: declaração de emprego (在職証明書). Autônomo: cópia da declaração de IR + alvará. Outro caso: carta explicando a situação (mesmo se desempregado).",
    },
    {
      id: "juminzei_doc",
      grupo: "prefeitura",
      label: "Certidão de imposto residencial dos últimos 3 anos (課税・納税証明書)",
      desc: "Emitida pela prefeitura — precisa mostrar renda total e situação de pagamento de cada ano. Sem atraso.",
    },
    {
      id: "juminzei_comprovante",
      grupo: "outros",
      label: "Comprovante de pagamento do imposto residencial em dia (extrato bancário, recibos)",
      desc: "Só é necessário para os períodos em que o imposto NÃO foi descontado direto do salário.",
    },
    {
      id: "kokuzei",
      grupo: "outros",
      label: "Certidão de quitação de tributos nacionais (納税証明書「その３」)",
      desc: "Emitida pela Receita Federal japonesa (税務署) — cobre imposto de renda, consumo, herança e doação, todos de uma vez.",
    },
    {
      id: "nenkin",
      grupo: "outros",
      label: "Histórico de pagamento da pensão (被保険者記録照会回答票 ou ねんきん定期便)",
      desc: "Peça no escritório de pensões (年金事務所) — precisa cobrir os últimos 2 anos completos, sem atraso.",
    },
    {
      id: "hoken",
      grupo: "outros",
      label: "Comprovantes de seguro de saúde (cartão + certidão de pagamento dos últimos 2 anos)",
      desc: "Cópia da carteirinha de toda a família + certidão de pagamento em dia (prefeitura ou empresa).",
    },
    {
      id: "parentes",
      grupo: "formulario",
      label: "Lista de parentes (親族一覧表)",
      desc: "Formulário próprio listando familiares no Japão e no exterior.",
      dl: [{ label: "PDF", url: EIJU_ROSTER }],
    },
    {
      id: "garantidor",
      grupo: "formulario",
      label: "Carta de garantidor (身元保証書) + documento de identidade do garantidor",
      desc: "Geralmente o cônjuge Residente Permanente — leve também cópia da carteira de motorista ou cartão de residência dele(a).",
      dl: [{ label: "PDF (japonês)", url: EIJU_GARANTIDOR.pdf }, { label: "PDF (inglês)", url: EIJU_GARANTIDOR.pdfEn }],
    },
    {
      id: "consentimento",
      grupo: "formulario",
      label: "Termo de consentimento (了解書)",
      desc: "Obrigatório desde 01/10/2021 — autoriza a Imigração a consultar seus dados em outros órgãos.",
      dl: [{ label: "PDF (japonês)", url: EIJU_CONSENT.pdf }],
    },
    {
      id: "passaporte",
      grupo: "apresentar",
      label: "Passaporte",
      desc: "Só para apresentar no balcão.",
    },
    {
      id: "zairyu",
      grupo: "apresentar",
      label: "Cartão de residência (在留カード)",
      desc: "Só para apresentar no balcão (ou cópia, conforme orientação local).",
    },
  ];
}

// Nota sobre mudança recente: a partir de 14/06/2026 a exigência de foto
// passou a valer a partir de 1 ano de idade (antes era a partir de 16 anos).
export const EIJU_AVISO_RECENTE =
  "📸 Mudança recente (a partir de 14/06/2026): a exigência de foto no pedido passou a valer para crianças a partir de 1 ano de idade — antes, só era exigida a partir de 16 anos.";

export const EIJU_TAXA = "¥10.000 (desde 01/04/2025), pagos apenas se o pedido for aprovado.";
export const EIJU_PRAZO_ANALISE = "Normalmente 4 a 6 meses.";
