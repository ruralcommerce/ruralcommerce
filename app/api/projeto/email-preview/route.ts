import { NextResponse } from 'next/server';
import { buildProjectEmailHtml, buildProjectEmailText } from '@/lib/project-email';
import { buildApprovalEmailContent, buildBroadcastEmailContent } from '@/lib/project-email-messages';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password') || '';
  const auth = verifyTeamAccess(request, password);
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
