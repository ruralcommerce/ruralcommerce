import { NextResponse } from 'next/server';
import { verifyTeamAccess } from '@/lib/project-team-auth-request';
import { readTeamMembers, toPublicTeamMember } from '@/lib/project-team-members';

export async function GET(request: Request) {
  const auth = verifyTeamAccess(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.message.includes('inválida') ? 401 : 500 });
  }

  if (auth.session.role !== 'master') {
    return NextResponse.json({ ok: false, message: 'Apenas o usuário master pode ver a equipe.' }, { status: 403 });
  }

  const members = await readTeamMembers();
  return NextResponse.json({
    ok: true,
    members: members.map(toPublicTeamMember),
  });
}
