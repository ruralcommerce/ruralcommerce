import type { ProjectSex } from '@/lib/project-sex';

export type ActivityKind = 'capacitacion' | 'visita';
export type ActivityStatus = 'abierta' | 'cerrada';
export type ParticipantState = 'invitado' | 'inscrito' | 'presente' | 'ausente';
export type ParticipantSource = 'impulsa' | 'convite' | 'manual';
export type GeoStatus = 'ok' | 'sin_gps' | 'lejos';

export type GeoFix = {
  lat: number;
  lng: number;
  accuracy: number | null;
  capturedAt: string;
};

export type ActivityActor = {
  userId: string;
  name: string;
  email: string;
};

export type ActivityParticipant = {
  id: string;
  source: ParticipantSource;
  inscriptionId?: string;
  name: string;
  phone: string;
  email: string;
  /** Sex / gender for disaggregation — same codes as Impulsa CR. */
  sex: ProjectSex | null;
  age: number | null;
  locality: string;
  organization: string;
  companyName: string;
  documentId: string;
  state: ParticipantState;
  confirmToken: string;
  invitedAt?: string;
  enrolledAt?: string;
  confirmedAt?: string;
  confirmGeo?: GeoFix | null;
  confirmDeviceId?: string;
  geoStatus?: GeoStatus;
  sameDevice?: boolean;
};

export type ActivityAudit = {
  at: string;
  actor: string;
  action: string;
  detail?: string;
};

export type Activity = {
  id: string;
  kind: ActivityKind;
  title: string;
  projectLabel: string;
  place: string;
  startsAt: string;
  notes: string;
  photoLinks: string[];
  status: ActivityStatus;
  inviteCode: string;
  openedAt: string;
  updatedAt: string;
  closedAt?: string;
  openedBy: ActivityActor;
  closedBy?: ActivityActor;
  sessionGeo?: GeoFix | null;
  sessionDeviceId?: string;
  participants: ActivityParticipant[];
  audit: ActivityAudit[];
};

export type ImpulsaPerson = {
  id: string;
  name: string;
  phone: string;
  email: string;
  organization: string;
  locality: string;
  sex: ProjectSex | null;
  status: string;
};
