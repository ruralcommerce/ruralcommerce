import type { Activity, ActivityParticipant } from './types';

export function publicActivity(activity: Activity) {
  return {
    kind: activity.kind,
    title: activity.title,
    projectLabel: activity.projectLabel,
    place: activity.place,
    startsAt: activity.startsAt,
    status: activity.status,
    inviteOpen: activity.kind === 'capacitacion' && activity.status === 'abierta',
  };
}

export function publicParticipant(participant: ActivityParticipant, includeToken = false) {
  return {
    name: participant.name,
    organization: participant.organization,
    state: participant.state,
    confirmedAt: participant.confirmedAt || null,
    geoStatus: participant.geoStatus || null,
    confirmToken: includeToken ? participant.confirmToken : undefined,
  };
}
