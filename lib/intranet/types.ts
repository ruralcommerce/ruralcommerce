export type IntranetRole = 'admin' | 'editor' | 'viewer';

export type IntranetProfile = 'staff_interno' | 'equipe_projeto' | 'beneficiario';

export type IntranetPermission =
  | 'dashboard'
  | 'users.manage'
  | 'collaborators.manage'
  | 'permissions.manage'
  | 'tools.access'
  | 'tools.marca'
  | 'tools.sementes'
  | 'tools.actividades'
  | 'tools.mns'
  | 'projeto.access'
  | 'projeto.inscripciones'
  | 'projeto.diagnostico'
  | 'projeto.inversiones'
  | 'projeto.broadcast'
  | 'projeto.members'
  | 'benef.access'
  | 'benef.diagnostico'
  | 'benef.inversiones'
  | 'benef.convenio';

export type IntranetScope = {
  projectIds?: string[];
  inscriptionId?: string;
  memberRole?: 'master' | 'technician' | 'admin';
  assignedOnly?: boolean;
};

export type IntranetUser = {
  id: string;
  name: string;
  email: string;
  /** scrypt hash `salt:hash`; legacy plain accepted until re-hash on login */
  password: string;
  /** true when password is already scrypt-hashed */
  passwordHashed?: boolean;
  role: IntranetRole;
  profile: IntranetProfile;
  permissions: IntranetPermission[];
  scope: IntranetScope;
  active: boolean;
  kind: 'user' | 'collaborator';
  /** origin ids for migration / linking */
  linkedTeamMemberId?: string;
  linkedInscriptionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type IntranetSession = {
  userId: string;
  name: string;
  email: string;
  role: IntranetRole;
  profile: IntranetProfile;
  permissions: IntranetPermission[];
  scope: IntranetScope;
};

export const ALL_PERMISSIONS: IntranetPermission[] = [
  'dashboard',
  'users.manage',
  'collaborators.manage',
  'permissions.manage',
  'tools.access',
  'tools.marca',
  'tools.sementes',
  'tools.actividades',
  'tools.mns',
  'projeto.access',
  'projeto.inscripciones',
  'projeto.diagnostico',
  'projeto.inversiones',
  'projeto.broadcast',
  'projeto.members',
  'benef.access',
  'benef.diagnostico',
  'benef.inversiones',
  'benef.convenio',
];

export const ROLE_DEFAULT_PERMISSIONS: Record<IntranetRole, IntranetPermission[]> = {
  admin: [...ALL_PERMISSIONS],
  editor: [
    'dashboard',
    'tools.access',
    'tools.marca',
    'tools.sementes',
    'tools.actividades',
    'tools.mns',
    'projeto.access',
    'projeto.inscripciones',
    'projeto.diagnostico',
    'projeto.inversiones',
  ],
  viewer: ['dashboard', 'tools.access', 'tools.sementes'],
};

export const PROFILE_DEFAULT_PERMISSIONS: Record<IntranetProfile, IntranetPermission[]> = {
  staff_interno: [
    'dashboard',
    'tools.access',
    'tools.marca',
    'tools.sementes',
    'tools.actividades',
    'tools.mns',
  ],
  equipe_projeto: [
    'projeto.access',
    'projeto.inscripciones',
    'projeto.diagnostico',
    'projeto.inversiones',
  ],
  beneficiario: ['benef.access', 'benef.diagnostico', 'benef.inversiones', 'benef.convenio'],
};

export const TEAM_ROLE_PERMISSIONS: Record<'master' | 'technician' | 'admin', IntranetPermission[]> = {
  master: [
    'projeto.access',
    'projeto.inscripciones',
    'projeto.diagnostico',
    'projeto.inversiones',
    'projeto.broadcast',
    'projeto.members',
  ],
  admin: [
    'projeto.access',
    'projeto.inscripciones',
    'projeto.diagnostico',
    'projeto.inversiones',
    'projeto.broadcast',
    'projeto.members',
  ],
  technician: ['projeto.access', 'projeto.inscripciones', 'projeto.diagnostico'],
};

export type IntranetTool = {
  id: string;
  title: string;
  description: string;
  href: string;
  permission: IntranetPermission;
  image: string;
  accent: string;
};

export function defaultPermissionsFor(
  profile: IntranetProfile,
  role: IntranetRole,
  memberRole?: IntranetScope['memberRole']
): IntranetPermission[] {
  if (profile === 'staff_interno') {
    if (role === 'admin') return [...ROLE_DEFAULT_PERMISSIONS.admin];
    if (role === 'editor') return [...ROLE_DEFAULT_PERMISSIONS.editor];
    return [...ROLE_DEFAULT_PERMISSIONS.viewer];
  }
  if (profile === 'equipe_projeto') {
    const key = memberRole || 'technician';
    return [...TEAM_ROLE_PERMISSIONS[key]];
  }
  return [...PROFILE_DEFAULT_PERMISSIONS.beneficiario];
}

export function sessionToPublic(user: IntranetUser): IntranetSession {
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
    permissions: user.permissions,
    scope: user.scope || {},
  };
}
