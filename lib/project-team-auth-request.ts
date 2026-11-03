import { getSessionFromRequest, sessionHas } from '@/lib/intranet/auth';
import { readTeamSessionFromRequest } from '@/lib/project-team-session';

export function verifyTeamAccess(request: Request, password?: string) {
  const session = readTeamSessionFromRequest(request);
  if (session) {
    return { ok: true as const, session };
  }

  // Unified intranet cookie (equipe_projeto / staff with projeto perms)
  const intranet = getSessionFromRequest(request);
  if (intranet && sessionHas(intranet, 'projeto.access')) {
    return {
      ok: true as const,
      session: {
        memberId: intranet.userId,
        name: intranet.name,
        email: intranet.email,
        role: (intranet.scope?.memberRole ||
          (intranet.profile === 'staff_interno' ? 'admin' : 'technician')) as
          | 'master'
          | 'technician'
          | 'admin'
          | 'legacy',
        exp: Date.now() + 60 * 60 * 1000,
      },
      intranet,
    };
  }

  const expected = (process.env.PROJETO_TEAM_PASSWORD || '').trim();
  if (!expected) {
    return { ok: false as const, message: 'Equipe não configurada no ambiente.' };
  }

  if (!password || password !== expected) {
    return { ok: false as const, message: 'Senha da equipe inválida.' };
  }

  return {
    ok: true as const,
    session: {
      memberId: 'team-legacy',
      name: 'Equipe',
      email: 'team@legacy',
      role: 'legacy' as const,
      exp: Date.now() + 60 * 60 * 1000,
    },
  };
}
