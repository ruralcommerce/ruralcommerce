export type IntranetRole = 'admin' | 'editor' | 'viewer';

export type IntranetPermission =
  | 'dashboard'
  | 'users.manage'
  | 'collaborators.manage'
  | 'permissions.manage'
  | 'tools.access'
  | 'tools.marca'
  | 'tools.sementes';

export type IntranetUser = {
  id: string;
  name: string;
  email: string;
  /** plain for bootstrap store; hash later */
  password: string;
  role: IntranetRole;
  permissions: IntranetPermission[];
  active: boolean;
  kind: 'user' | 'collaborator';
  createdAt: string;
  updatedAt: string;
};

export type IntranetSession = {
  userId: string;
  name: string;
  email: string;
  role: IntranetRole;
  permissions: IntranetPermission[];
};

export const ROLE_DEFAULT_PERMISSIONS: Record<IntranetRole, IntranetPermission[]> = {
  admin: [
    'dashboard',
    'users.manage',
    'collaborators.manage',
    'permissions.manage',
    'tools.access',
    'tools.marca',
    'tools.sementes',
  ],
  editor: ['dashboard', 'tools.access', 'tools.marca', 'tools.sementes'],
  viewer: ['dashboard', 'tools.access', 'tools.sementes'],
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
