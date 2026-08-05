// ═══════════════════════════════════════════════════════════════════════════
// Preenchimento automático do 在留期間更新許可申請書 (formulário de renovação
// de visto) para a categoria 永住者の配偶者等 (cônjuge/filho de Residente
// Permanente) — a mesma categoria já coberta pelo checklist e pelo Agente.
//
// As coordenadas abaixo foram calibradas comparando o formulário em branco
// oficial (930004114.pdf) com um exemplo oficial já preenchido pela própria
// Imigração para esta categoria exata (001459559.pdf): cada posição de rótulo
// foi extraída com pdf.js e a posição de preenchimento foi derivada do
// deslocamento (rótulo → resposta) observado no exemplo preenchido.
//
// Página 2 do PDF é só uma tabela de referência (não é enviada) — por isso
// não tem campos aqui. Página 1 = dados pessoais, página 3 = "Modelo T"
// (dados específicos da categoria), página 4 = garantidor e assinatura.
// ═══════════════════════════════════════════════════════════════════════════

export const FORM_PDF_URL = `${import.meta.env.BASE_URL}forms/zairyu-koshin-shinsei.pdf`;
export const FONT_URL = `${import.meta.env.BASE_URL}vendor/NotoSansJP.ttf`;

// dx/dy médios entre o início do rótulo "年" (ano) / "月" (mês) / "日" (dia)
// de uma linha de data e a posição onde o número deve ser escrito.
function dateRow(page, y, yearX, monthX, dayX) {
  return { page, y, year: { x: yearX }, month: { x: monthX }, day: { x: dayX } };
}

export const FIELD_SECTIONS = [
  {
    id: "pessoal",
    label: "Dados pessoais (página 1)",
    fields: [
      { id: "nationality", label: "Nacionalidade / região", jp: "国籍・地域", font: "lat", page: 0, x: 179.5, y: 648.1, placeholder: "Brasil" },
      { id: "birthDate", label: "Data de nascimento", jp: "生年月日", type: "date", font: "lat", ...dateRow(0, 647.8, 348.5, 422.6, 480.6) },
      { id: "familyName", label: "Sobrenome (como no passaporte)", jp: "氏", font: "lat", page: 0, x: 144, y: 622.8, placeholder: "SILVA" },
      { id: "givenName", label: "Nome (como no passaporte)", jp: "名", font: "lat", page: 0, x: 304, y: 622.8, placeholder: "JOAO" },
      {
        id: "sex", label: "Sexo", jp: "性別", type: "choice", page: 0,
        options: [{ value: "male", label: "Masculino", x: 105, y: 599 }, { value: "female", label: "Feminino", x: 131.6, y: 599 }],
      },
      {
        id: "maritalStatus", label: "Estado civil", jp: "配偶者の有無", type: "choice", page: 0,
        options: [{ value: "married", label: "Casado(a)", x: 378, y: 599 }, { value: "single", label: "Solteiro(a)", x: 405.6, y: 599 }],
      },
      { id: "occupation", label: "Profissão", jp: "職業", font: "jp", page: 0, x: 135.2, y: 567.2, placeholder: "会社員" },
      { id: "hometown", label: "Cidade/estado de origem (no seu país)", jp: "本国における居住地", font: "lat", page: 0, x: 394.9, y: 567.2, placeholder: "Brasil SP" },
      { id: "addressJapan", label: "Endereço no Japão", jp: "住居地", font: "jp", page: 0, x: 209.6, y: 544.1, placeholder: "東京都渋谷区1-2-3" },
      { id: "phone", label: "Telefone", jp: "電話番号", font: "lat", page: 0, x: 137.6, y: 520.5, placeholder: "03-1234-5678" },
      { id: "cellphone", label: "Celular", jp: "携帯電話番号", font: "lat", page: 0, x: 382.6, y: 520.5, placeholder: "090-1234-5678" },
      { id: "passportNumber", label: "Número do passaporte", jp: "旅券番号", font: "lat", page: 0, x: 172.4, y: 496.4, placeholder: "FZ1234567" },
      { id: "passportExpiry", label: "Validade do passaporte", jp: "旅券有効期限", type: "date", font: "lat", ...dateRow(0, 496.4, 361.8, 437.8, 495.9) },
      { id: "currentStatus", label: "Status de residência atual", jp: "現に有する在留資格", font: "jp", page: 0, x: 182.1, y: 472.4, placeholder: "永住者の配偶者等" },
      { id: "currentPeriod", label: "Período de permanência atual", jp: "在留期間", font: "jp", page: 0, x: 445.7, y: 472.4, placeholder: "3年" },
      { id: "currentExpiry", label: "Data de vencimento do visto atual", jp: "在留期間の満了日", type: "date", font: "lat", ...dateRow(0, 447.9, 162.0, 234.1, 286.4) },
      { id: "residenceCardNumber", label: "Número do cartão de residência", jp: "在留カード番号", font: "lat", page: 0, x: 186.8, y: 423.4, placeholder: "AB12345678CD" },
      { id: "desiredPeriod", label: "Período desejado após a renovação", jp: "希望する在留期間", font: "jp", page: 0, x: 200.5, y: 398.9, placeholder: "5年" },
      { id: "reason", label: "Motivo da renovação", jp: "更新の理由", font: "jp", page: 0, x: 259.4, y: 374.4, multiline: true, placeholder: "妻と今後も日本で生活するため。" },
      {
        id: "criminalRecord", label: "Já foi condenado(a) criminalmente (Japão ou exterior)?", jp: "犯罪を理由とする処分を受けたことの有無", type: "choice", page: 0,
        options: [{ value: "yes", label: "Sim", x: 78.46, y: 337 }, { value: "no", label: "Não", x: 515, y: 337 }],
      },
      {
        id: "familyInJapan", label: "Tem familiares morando no Japão?", jp: "在日親族及び同居者", type: "choice", page: 0,
        options: [{ value: "yes", label: "Sim", x: 78, y: 290 }, { value: "no", label: "Não", x: 412.5, y: 290 }],
      },
    ],
  },
  {
    id: "conjuge",
    label: "Casamento e trabalho do cônjuge (página 3)",
    fields: [
      { id: "marriageRegPlaceJp", label: "Onde registrou o casamento no Japão (se registrou)", jp: "(1)日本国届出先", font: "jp", page: 2, x: 212.2, y: 495.6, placeholder: "なし (se não registrou no Japão)" },
      { id: "marriageRegPlaceForeign", label: "Onde registrou o casamento no exterior", jp: "(2)本国等届出先", font: "lat", page: 2, x: 201.4, y: 473.9, placeholder: "Brasil SP" },
      { id: "marriageRegDate", label: "Data de registro do casamento", jp: "届出年月日", type: "date", font: "lat", ...dateRow(2, 475.7, 364.5, 434.1, 481.8) },
      { id: "employerName", label: "Nome da empresa (cônjuge)", jp: "(1)名称", font: "jp", page: 2, x: 156.6, y: 411.3, placeholder: "株式会社サンプル" },
      { id: "employerBranch", label: "Filial / departamento", jp: "支店・事業所名", font: "jp", page: 2, x: 403.7, y: 411.3, placeholder: "東京支店" },
      { id: "employerAddress", label: "Endereço da empresa", jp: "(2)所在地", font: "jp", page: 2, x: 181.2, y: 389.7, placeholder: "東京都渋谷区1-2-3" },
      { id: "employerPhone", label: "Telefone da empresa", jp: "電話番号", font: "lat", page: 2, x: 407.9, y: 389.7, placeholder: "03-1234-5678" },
      { id: "annualIncome", label: "Renda anual do cônjuge (¥)", jp: "(3)年収", font: "lat", page: 2, x: 141.5, y: 368.1, placeholder: "4000000" },
      { id: "monthlySupport", label: "Valor médio mensal de sustento (¥)", jp: "月平均支弁額", font: "lat", page: 2, x: 204.7, y: 327.1, placeholder: "150000", mark: { x: 83.6, y: 330.2 } },
    ],
  },
  {
    id: "garantidor",
    label: "Garantidor e assinatura (página 4)",
    fields: [
      { id: "guarantorName", label: "Nome do garantidor", jp: "(1)氏名", font: "lat", page: 3, x: 148.4, y: 504.0, placeholder: "YAMADA HANAKO" },
      { id: "guarantorOccupation", label: "Profissão do garantidor", jp: "(2)職業", font: "jp", page: 3, x: 408.9, y: 504.0, placeholder: "会社員" },
      { id: "guarantorAddress", label: "Endereço do garantidor", jp: "(3)住所", font: "jp", page: 3, x: 207.2, y: 480.2, placeholder: "東京都渋谷区1-2-3" },
      { id: "guarantorPhone", label: "Telefone do garantidor", jp: "電話番号", font: "lat", page: 3, x: 144.8, y: 457.0, placeholder: "03-1234-5678" },
      { id: "guarantorCellphone", label: "Celular do garantidor", jp: "携帯電話番号", font: "lat", page: 3, x: 380.2, y: 457.0, placeholder: "090-1234-5678" },
      { id: "signatureName", label: "Assinatura (seu nome completo digitado)", jp: "申請人の署名", font: "lat", page: 3, x: 70, y: 310.0, placeholder: "SILVA JOAO" },
      { id: "signDate", label: "Data de preenchimento", jp: "申請書作成年月日", type: "date", font: "lat", ...dateRow(3, 310.0, 353.5, 424.8, 477.2) },
    ],
  },
];

// Marca fixa: caixa "配偶者" na linha "永住者・特別永住者" (página 3) —
// sempre marcada nesta ferramenta porque ela é exclusiva da categoria
// cônjuge de Residente Permanente.
const RELATIONSHIP_MARK = { page: 2, x: 171, y: 654.8, size: 8 };

function allFields() {
  return FIELD_SECTIONS.flatMap(s => s.fields);
}

export function emptyFormValues() {
  const values = {};
  for (const f of allFields()) values[f.id] = "";
  values.maritalStatus = "married";
  values.criminalRecord = "no";
  values.familyInJapan = "yes";
  return values;
}

function splitDateIso(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { year: String(y), month: String(m), day: String(d) };
}

export async function fillSpousePrPdf(values) {
  const [{ PDFDocument, rgb, StandardFonts }, fontkitMod, formBytes, fontBytes] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit"),
    fetch(FORM_PDF_URL).then(r => r.arrayBuffer()),
    fetch(FONT_URL).then(r => r.arrayBuffer()),
  ]);
  const fontkit = fontkitMod.default || fontkitMod;

  const doc = await PDFDocument.load(formBytes);
  doc.registerFontkit(fontkit);
  const jpFont = await doc.embedFont(fontBytes, { subset: false });
  const latFont = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const black = rgb(0, 0, 0);
  const SIZE = 10;

  function drawText(page, x, y, str, font, size = SIZE) {
    if (!str) return;
    pages[page].drawText(str, { x, y, size, font, color: black });
  }
  function drawCircle(page, cx, cy) {
    pages[page].drawEllipse({ x: cx, y: cy, xScale: 13, yScale: 9, borderColor: rgb(0.8, 0, 0), borderWidth: 1.2 });
  }
  function drawBox(page, x, y, size = 8) {
    pages[page].drawRectangle({ x: x - 1, y: y - 1, width: size, height: size, color: black });
  }

  for (const field of allFields()) {
    const value = values[field.id];
    if (field.type === "date") {
      const parts = splitDateIso(value);
      if (!parts) continue;
      const font = field.font === "jp" ? jpFont : latFont;
      drawText(field.page, field.year.x, field.y, parts.year, font);
      drawText(field.page, field.month.x, field.y, parts.month, font);
      drawText(field.page, field.day.x, field.y, parts.day, font);
    } else if (field.type === "choice") {
      const opt = field.options.find(o => o.value === value);
      if (opt) drawCircle(field.page, opt.x, opt.y);
    } else {
      if (field.mark && value) drawBox(field.page, field.mark.x, field.mark.y);
      const font = field.font === "jp" ? jpFont : latFont;
      drawText(field.page, field.x, field.y, value, font);
    }
  }

  drawBox(RELATIONSHIP_MARK.page, RELATIONSHIP_MARK.x, RELATIONSHIP_MARK.y, RELATIONSHIP_MARK.size);

  return doc.save();
}
