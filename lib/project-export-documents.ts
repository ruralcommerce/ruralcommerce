import {
  PROJECT_EXECUTOR,
  PROJECT_LOGO_PATH,
  PROJECT_NAME,
  RURAL_COMMERCE_LOGO_WHITE_PATH,
  absoluteProjectAsset,
  projectSiteBaseUrl,
} from '@/lib/project-brand';
import type { ProjectLocaleKey } from '@/lib/project-locale';

export type ExportLocale = ProjectLocaleKey;

export type BeneficiaryExportRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  city: string;
  status: string;
  tag: string;
  convenio: string;
  diagnosis: string;
  createdAt: string;
  interest: string;
};

export type DiagnosisExportDoc = {
  id: string;
  name: string;
  email: string;
  organization?: string;
  submittedAt?: string;
  rows: Array<[string, string]>;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeCsv(value: string) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

const copy: Record<
  ExportLocale,
  {
    official: string;
    listTitle: string;
    listSubtitle: string;
    generatedAt: string;
    filtersApplied: string;
    total: string;
    diagnosisTitle: string;
    participant: string;
    email: string;
    organization: string;
    submittedAt: string;
    question: string;
    answer: string;
    columns: {
      name: string;
      email: string;
      phone: string;
      organization: string;
      city: string;
      status: string;
      tag: string;
      convenio: string;
      diagnosis: string;
      createdAt: string;
      interest: string;
    };
  }
> = {
  es: {
    official: 'Documento oficial',
    listTitle: 'Lista de beneficiarios',
    listSubtitle: 'Participantes del proyecto según los filtros aplicados en la intranet.',
    generatedAt: 'Generado el',
    filtersApplied: 'Filtros aplicados',
    total: 'Total de registros',
    diagnosisTitle: 'Diagnóstico completo',
    participant: 'Participante',
    email: 'Correo',
    organization: 'Organización',
    submittedAt: 'Enviado el',
    question: 'Pregunta',
    answer: 'Respuesta',
    columns: {
      name: 'Nombre',
      email: 'Correo',
      phone: 'Teléfono',
      organization: 'Organización',
      city: 'Ciudad / ubicación',
      status: 'Estado',
      tag: 'Etiqueta',
      convenio: 'Convenio',
      diagnosis: 'Diagnóstico',
      createdAt: 'Fecha de inscripción',
      interest: 'Interés',
    },
  },
  'pt-BR': {
    official: 'Documento oficial',
    listTitle: 'Lista de beneficiários',
    listSubtitle: 'Participantes do projeto conforme os filtros aplicados na intranet.',
    generatedAt: 'Gerado em',
    filtersApplied: 'Filtros aplicados',
    total: 'Total de registros',
    diagnosisTitle: 'Diagnóstico completo',
    participant: 'Participante',
    email: 'E-mail',
    organization: 'Organização',
    submittedAt: 'Enviado em',
    question: 'Pergunta',
    answer: 'Resposta',
    columns: {
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefone',
      organization: 'Organização',
      city: 'Cidade / localização',
      status: 'Status',
      tag: 'Etiqueta',
      convenio: 'Convênio',
      diagnosis: 'Diagnóstico',
      createdAt: 'Data de inscrição',
      interest: 'Interesse',
    },
  },
  en: {
    official: 'Official document',
    listTitle: 'Beneficiary list',
    listSubtitle: 'Project participants according to the filters applied in the intranet.',
    generatedAt: 'Generated on',
    filtersApplied: 'Filters applied',
    total: 'Total records',
    diagnosisTitle: 'Full diagnosis',
    participant: 'Participant',
    email: 'Email',
    organization: 'Organization',
    submittedAt: 'Submitted on',
    question: 'Question',
    answer: 'Answer',
    columns: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      organization: 'Organization',
      city: 'City / location',
      status: 'Status',
      tag: 'Tag',
      convenio: 'Agreement',
      diagnosis: 'Diagnosis',
      createdAt: 'Registration date',
      interest: 'Interest',
    },
  },
};

function brandedShell(options: {
  locale: ExportLocale;
  title: string;
  subtitle?: string;
  metaLines?: string[];
  bodyHtml: string;
}) {
  const t = copy[options.locale];
  const ruralLogo = absoluteProjectAsset(RURAL_COMMERCE_LOGO_WHITE_PATH);
  const projectLogo = absoluteProjectAsset(PROJECT_LOGO_PATH);
  const siteUrl = projectSiteBaseUrl();
  const meta = (options.metaLines || [])
    .map((line) => `<p style="margin:0 0 6px;font-size:13px;line-height:1.45;color:#4b5563;">${escapeHtml(line)}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="${options.locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(options.title)}</title>
  <style>
    @page { margin: 16mm; }
    body { margin: 0; padding: 0; background: #f4f7f8; color: #061f5b; font-family: Arial, Helvetica, sans-serif; }
    .page { max-width: 960px; margin: 0 auto; background: #ffffff; }
    table.data { width: 100%; border-collapse: collapse; font-size: 12px; }
    table.data th { background: #effafa; color: #061f5b; text-align: left; border: 1px solid #d9e3ec; padding: 8px; font-weight: 700; }
    table.data td { border: 1px solid #d9e3ec; padding: 8px; vertical-align: top; color: #333333; }
    .qa td:first-child { width: 48%; font-weight: 700; color: #061f5b; }
    .break { page-break-before: always; }
    @media print {
      body { background: #ffffff; }
      .page { max-width: none; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div style="background:#061f5b;padding:28px 32px 30px;color:#ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="left" style="vertical-align:middle;">
            <a href="${escapeHtml(siteUrl)}" style="text-decoration:none;">
              <img src="${escapeHtml(ruralLogo)}" alt="${escapeHtml(PROJECT_EXECUTOR)}" width="150" style="display:block;border:0;max-width:150px;height:auto;" />
            </a>
          </td>
          <td align="right" style="vertical-align:middle;font-size:14px;color:#ffffff;">
            ${escapeHtml(t.official)}
          </td>
        </tr>
      </table>
      <div style="height:1px;background:rgba(255,255,255,0.35);margin:18px 0 22px;"></div>
      <h1 style="margin:0;font-size:28px;line-height:1.15;font-weight:800;color:#ffffff;">${escapeHtml(options.title)}</h1>
      ${
        options.subtitle
          ? `<p style="margin:12px 0 0;max-width:640px;font-size:15px;line-height:1.45;color:#ffffff;">${escapeHtml(options.subtitle)}</p>`
          : ''
      }
      <p style="margin:16px 0 0;font-size:15px;line-height:1.45;color:#ffffff;">
        ${escapeHtml(PROJECT_NAME)}
        <span style="color:#23b8b5;font-weight:700;"> · ${escapeHtml(PROJECT_EXECUTOR)}</span>
      </p>
    </div>

    <div style="padding:28px 32px 12px;background:#ffffff;">
      <div style="width:34px;height:2px;background:#23b8b5;margin:0 0 18px;"></div>
      ${meta}
      ${options.bodyHtml}
    </div>

    <div style="padding:22px 32px;background:#effafa;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="left" style="vertical-align:middle;">
            <img src="${escapeHtml(projectLogo)}" alt="${escapeHtml(PROJECT_NAME)}" width="120" style="display:block;border:0;max-width:120px;height:auto;" />
          </td>
          <td align="right" style="vertical-align:middle;font-size:12px;color:#1d6359;">
            ${escapeHtml(PROJECT_EXECUTOR)} · ${escapeHtml(projectSiteBaseUrl().replace(/^https?:\/\//, ''))}
          </td>
        </tr>
      </table>
    </div>
  </div>
</body>
</html>`;
}

export function buildBeneficiaryListPrintHtml(options: {
  locale: ExportLocale;
  rows: BeneficiaryExportRow[];
  filterSummary: string;
  generatedAtLabel: string;
}) {
  const t = copy[options.locale];
  const cols = t.columns;
  const bodyRows = options.rows
    .map(
      (row) => `<tr>
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.email)}</td>
      <td>${escapeHtml(row.phone)}</td>
      <td>${escapeHtml(row.organization)}</td>
      <td>${escapeHtml(row.city)}</td>
      <td>${escapeHtml(row.status)}</td>
      <td>${escapeHtml(row.tag)}</td>
      <td>${escapeHtml(row.convenio)}</td>
      <td>${escapeHtml(row.diagnosis)}</td>
      <td>${escapeHtml(row.createdAt)}</td>
    </tr>`
    )
    .join('');

  const bodyHtml = `
    <table class="data">
      <thead>
        <tr>
          <th>${escapeHtml(cols.name)}</th>
          <th>${escapeHtml(cols.email)}</th>
          <th>${escapeHtml(cols.phone)}</th>
          <th>${escapeHtml(cols.organization)}</th>
          <th>${escapeHtml(cols.city)}</th>
          <th>${escapeHtml(cols.status)}</th>
          <th>${escapeHtml(cols.tag)}</th>
          <th>${escapeHtml(cols.convenio)}</th>
          <th>${escapeHtml(cols.diagnosis)}</th>
          <th>${escapeHtml(cols.createdAt)}</th>
        </tr>
      </thead>
      <tbody>${bodyRows || `<tr><td colspan="10">—</td></tr>`}</tbody>
    </table>`;

  return brandedShell({
    locale: options.locale,
    title: t.listTitle,
    subtitle: t.listSubtitle,
    metaLines: [
      `${t.generatedAt}: ${options.generatedAtLabel}`,
      `${t.filtersApplied}: ${options.filterSummary}`,
      `${t.total}: ${options.rows.length}`,
    ],
    bodyHtml,
  });
}

export function buildDiagnosisPrintHtml(options: {
  locale: ExportLocale;
  docs: DiagnosisExportDoc[];
  generatedAtLabel: string;
}) {
  const t = copy[options.locale];
  const sections = options.docs
    .map((doc, index) => {
      const rows = doc.rows
        .map(
          ([question, answer]) =>
            `<tr><td>${escapeHtml(question)}</td><td>${escapeHtml(answer)}</td></tr>`
        )
        .join('');

      return `
      <section class="${index > 0 ? 'break' : ''}" style="margin:0 0 28px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#061f5b;">${escapeHtml(doc.name || t.participant)}</h2>
        <p style="margin:0 0 4px;font-size:13px;color:#4b5563;"><strong>${escapeHtml(t.email)}:</strong> ${escapeHtml(doc.email)}</p>
        ${
          doc.organization
            ? `<p style="margin:0 0 4px;font-size:13px;color:#4b5563;"><strong>${escapeHtml(t.organization)}:</strong> ${escapeHtml(doc.organization)}</p>`
            : ''
        }
        ${
          doc.submittedAt
            ? `<p style="margin:0 0 14px;font-size:13px;color:#4b5563;"><strong>${escapeHtml(t.submittedAt)}:</strong> ${escapeHtml(doc.submittedAt)}</p>`
            : '<div style="height:10px;"></div>'
        }
        <table class="data qa">
          <thead>
            <tr>
              <th>${escapeHtml(t.question)}</th>
              <th>${escapeHtml(t.answer)}</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="2">—</td></tr>`}</tbody>
        </table>
      </section>`;
    })
    .join('');

  return brandedShell({
    locale: options.locale,
    title: t.diagnosisTitle,
    subtitle: PROJECT_NAME,
    metaLines: [`${t.generatedAt}: ${options.generatedAtLabel}`, `${t.total}: ${options.docs.length}`],
    bodyHtml: sections || '<p>—</p>',
  });
}

export function buildBeneficiaryListCsv(options: {
  locale: ExportLocale;
  rows: BeneficiaryExportRow[];
}) {
  const cols = copy[options.locale].columns;
  const header = [
    cols.name,
    cols.email,
    cols.phone,
    cols.organization,
    cols.city,
    cols.status,
    cols.tag,
    cols.convenio,
    cols.diagnosis,
    cols.createdAt,
    cols.interest,
  ]
    .map(escapeCsv)
    .join(',');

  const lines = options.rows.map((row) =>
    [
      row.name,
      row.email,
      row.phone,
      row.organization,
      row.city,
      row.status,
      row.tag,
      row.convenio,
      row.diagnosis,
      row.createdAt,
      row.interest,
    ]
      .map(escapeCsv)
      .join(',')
  );

  return `\uFEFF${[header, ...lines].join('\n')}`;
}

export function buildBeneficiaryListExcelHtml(options: {
  locale: ExportLocale;
  rows: BeneficiaryExportRow[];
  filterSummary: string;
  generatedAtLabel: string;
}) {
  const t = copy[options.locale];
  const cols = t.columns;
  const headerCells = [
    cols.name,
    cols.email,
    cols.phone,
    cols.organization,
    cols.city,
    cols.status,
    cols.tag,
    cols.convenio,
    cols.diagnosis,
    cols.createdAt,
    cols.interest,
  ]
    .map((label) => `<th style="background:#effafa;border:1px solid #d9e3ec;padding:8px;text-align:left;color:#061f5b;">${escapeHtml(label)}</th>`)
    .join('');

  const body = options.rows
    .map(
      (row) => `<tr>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.name)}</td>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.email)}</td>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.phone)}</td>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.organization)}</td>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.city)}</td>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.status)}</td>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.tag)}</td>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.convenio)}</td>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.diagnosis)}</td>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.createdAt)}</td>
      <td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(row.interest)}</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>
<body>
  <h2 style="color:#061f5b;font-family:Arial,sans-serif;">${escapeHtml(t.listTitle)}</h2>
  <p style="font-family:Arial,sans-serif;color:#333;">${escapeHtml(PROJECT_NAME)} · ${escapeHtml(PROJECT_EXECUTOR)}</p>
  <p style="font-family:Arial,sans-serif;color:#4b5563;">${escapeHtml(t.generatedAt)}: ${escapeHtml(options.generatedAtLabel)}</p>
  <p style="font-family:Arial,sans-serif;color:#4b5563;">${escapeHtml(t.filtersApplied)}: ${escapeHtml(options.filterSummary)}</p>
  <p style="font-family:Arial,sans-serif;color:#4b5563;">${escapeHtml(t.total)}: ${options.rows.length}</p>
  <table>
    <thead><tr>${headerCells}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</body>
</html>`;
}

export function buildDiagnosisExcelHtml(options: {
  locale: ExportLocale;
  docs: DiagnosisExportDoc[];
}) {
  const t = copy[options.locale];
  const blocks = options.docs
    .map((doc) => {
      const rows = doc.rows
        .map(
          ([question, answer]) =>
            `<tr><td style="border:1px solid #d9e3ec;padding:8px;font-weight:700;color:#061f5b;">${escapeHtml(question)}</td><td style="border:1px solid #d9e3ec;padding:8px;">${escapeHtml(answer)}</td></tr>`
        )
        .join('');
      return `
      <h3 style="color:#061f5b;font-family:Arial,sans-serif;">${escapeHtml(doc.name)}</h3>
      <p style="font-family:Arial,sans-serif;color:#4b5563;">${escapeHtml(doc.email)}</p>
      <table>
        <thead>
          <tr>
            <th style="background:#effafa;border:1px solid #d9e3ec;padding:8px;text-align:left;">${escapeHtml(t.question)}</th>
            <th style="background:#effafa;border:1px solid #d9e3ec;padding:8px;text-align:left;">${escapeHtml(t.answer)}</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
    })
    .join('<br/>');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body>
  <h2 style="color:#061f5b;font-family:Arial,sans-serif;">${escapeHtml(t.diagnosisTitle)}</h2>
  <p style="font-family:Arial,sans-serif;color:#333;">${escapeHtml(PROJECT_NAME)} · ${escapeHtml(PROJECT_EXECUTOR)}</p>
  ${blocks}
</body>
</html>`;
}

export function buildDiagnosisCsv(options: {
  locale: ExportLocale;
  docs: DiagnosisExportDoc[];
}) {
  const t = copy[options.locale];
  const header = [t.participant, t.email, t.question, t.answer].map(escapeCsv).join(',');
  const lines: string[] = [];
  for (const doc of options.docs) {
    for (const [question, answer] of doc.rows) {
      lines.push([doc.name, doc.email, question, answer].map(escapeCsv).join(','));
    }
  }
  return `\uFEFF${[header, ...lines].join('\n')}`;
}

export function openPrintDocument(html: string, title: string) {
  if (typeof window === 'undefined') return;
  const popup = window.open('', '_blank', 'width=1100,height=800');
  if (!popup) return;
  popup.document.open();
  popup.document.write(html);
  popup.document.title = title;
  popup.document.close();
  popup.focus();
  window.setTimeout(() => {
    popup.print();
  }, 350);
}

export function triggerBrowserDownload(content: string, fileName: string, mimeType: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
