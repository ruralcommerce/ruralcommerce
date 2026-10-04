import { jsPDF } from 'jspdf';
import {
  PROJECT_EXECUTOR,
  PROJECT_LOGO_PATH,
  PROJECT_NAME,
  RURAL_COMMERCE_LOGO_WHITE_PATH,
  RURAL_COMMERCE_TAGLINE,
} from '@/lib/project-brand';

export const PROJECT_PDF_COLORS = {
  navy: [6, 31, 91] as [number, number, number],
  teal: [35, 184, 181] as [number, number, number],
  text: [51, 51, 51] as [number, number, number],
  muted: [102, 102, 102] as [number, number, number],
  panel: [239, 250, 250] as [number, number, number],
  footer: [32, 32, 32] as [number, number, number],
};

export type ProjectPdfLogos = {
  rcLogo?: string;
  projectLogo?: string;
};

async function loadImageDataUrl(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('logo-load-failed');
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

let logosPromise: Promise<ProjectPdfLogos> | null = null;

export async function loadProjectPdfLogos(): Promise<ProjectPdfLogos> {
  if (!logosPromise) {
    logosPromise = Promise.allSettled([
      loadImageDataUrl(RURAL_COMMERCE_LOGO_WHITE_PATH),
      loadImageDataUrl(PROJECT_LOGO_PATH),
    ]).then(([rc, project]) => ({
      rcLogo: rc.status === 'fulfilled' ? rc.value : undefined,
      projectLogo: project.status === 'fulfilled' ? project.value : undefined,
    }));
  }
  return logosPromise;
}

export async function yieldToUi() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

export function drawProjectPdfCover(
  doc: jsPDF,
  options: {
    officialNotice: string;
    title: string;
    subtitle?: string;
    lines: string[];
    logos: ProjectPdfLogos;
  }
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const { logos } = options;

  doc.setFillColor(...PROJECT_PDF_COLORS.navy);
  doc.rect(0, 0, pageWidth, 52, 'F');
  if (logos.rcLogo) {
    doc.addImage(logos.rcLogo, 'PNG', 16, 12, 34, 10);
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(options.officialNotice.toUpperCase(), 16, 32);
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(options.title, pageWidth - 32);
  doc.text(titleLines, 16, 42);

  let y = 70;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...PROJECT_PDF_COLORS.navy);
  doc.text(PROJECT_NAME, 16, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...PROJECT_PDF_COLORS.teal);
  doc.text(PROJECT_EXECUTOR, 16, y);
  y += 10;

  if (options.subtitle) {
    doc.setTextColor(...PROJECT_PDF_COLORS.text);
    const subLines = doc.splitTextToSize(options.subtitle, pageWidth - 32);
    doc.text(subLines, 16, y);
    y += subLines.length * 5 + 6;
  }

  doc.setFillColor(...PROJECT_PDF_COLORS.panel);
  doc.roundedRect(14, y, pageWidth - 28, Math.max(28, options.lines.length * 6 + 12), 3, 3, 'F');
  doc.setDrawColor(...PROJECT_PDF_COLORS.teal);
  doc.setLineWidth(0.6);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...PROJECT_PDF_COLORS.text);
  for (const line of options.lines) {
    const wrapped = doc.splitTextToSize(line, pageWidth - 40);
    doc.text(wrapped, 20, y);
    y += wrapped.length * 5 + 2;
  }

  if (logos.projectLogo) {
    doc.addImage(logos.projectLogo, 'PNG', 16, pageHeight - 36, 22, 22);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...PROJECT_PDF_COLORS.muted);
  doc.text(RURAL_COMMERCE_TAGLINE, 42, pageHeight - 22);
}

export function triggerPdfBlobDownload(blob: Blob, fileName: string) {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
