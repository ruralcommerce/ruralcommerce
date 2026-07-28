import { NextResponse } from 'next/server';
import { buildProjectEmailHtml, buildProjectEmailText } from '@/lib/project-email';
import { buildApprovalEmailContent, buildBroadcastEmailContent } from '@/lib/project-email-messages';

function verifyTeamPassword(password: string) {
  const expected = (process.env.PROJETO_TEAM_PASSWORD || '').trim();
  if (!expected) return { ok: false as const, message: 'Defina PROJETO_TEAM_PASSWORD no ambiente.' };
  if (password !== expected) return { ok: false as const, message: 'Senha da equipe inválida.' };
  return { ok: true as const };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password') || '';
  const auth = verifyTeamPassword(password);
  if (!auth.ok) {
    const status = auth.message.includes('inválida') ? 401 : 500;
    return NextResponse.json({ ok: false, message: auth.message }, { status });
  }

  const locale = searchParams.get('locale') || 'es';
  const type = searchParams.get('type') === 'broadcast' ? 'broadcast' : 'approval';

  if (type === 'broadcast') {
    const content = buildBroadcastEmailContent(
      'Nombre del participante',
      'Recordatorio: firma el convenio del proyecto',
      'Este es un mensaje de ejemplo del equipo. El texto que escribas en el panel aparecerá aquí, con el diseño del proyecto y un botón al enlace que indiques.',
      `https://ruralcommerceglobal.com/${locale === 'pt-BR' || locale === 'en' ? locale : 'es'}/projeto/convenio`,
      locale
    );
    return NextResponse.json({
      ok: true,
      type,
      subject: content.subject,
      text: buildProjectEmailText(content),
      html: buildProjectEmailHtml(content),
    });
  }

  const content = buildApprovalEmailContent('Nombre del participante', locale);
  return NextResponse.json({
    ok: true,
    type: 'approval',
    subject: content.subject,
    text: buildProjectEmailText(content),
    html: buildProjectEmailHtml(content),
  });
}
