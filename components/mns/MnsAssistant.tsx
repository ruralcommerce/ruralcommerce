'use client';

import type { MnsFieldHelp } from '@/lib/mns/types';

export function MnsAssistantPanel({
  title,
  help,
  onClose,
}: {
  title: string;
  help: MnsFieldHelp;
  onClose: () => void;
}) {
  return (
    <aside className="mns-assistant" role="dialog" aria-label="Asistente de la dinámica">
      <div className="mns-assistant-head">
        <div>
          <div style={{ fontSize: '0.68rem', opacity: 0.75, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Asistente MNS
          </div>
          <strong>{title}</strong>
        </div>
        <button type="button" className="mns-btn mns-btn-ghost" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }} onClick={onClose}>
          Cerrar
        </button>
      </div>
      <div className="mns-assistant-body">
        <h4>Para qué sirve</h4>
        <p>{help.paraQue}</p>
        <h4>Cómo completarlo</h4>
        <p>{help.como}</p>
        <h4>Ejemplo</h4>
        <p>{help.ejemplo}</p>
        {help.alerta ? <div className="mns-assistant-alert">{help.alerta}</div> : null}
      </div>
    </aside>
  );
}

export function MnsFab({ onClick, open }: { onClick: () => void; open: boolean }) {
  if (open) return null;
  return (
    <button type="button" className="mns-fab" onClick={onClick} aria-label="Abrir asistente">
      <span>?</span>
    </button>
  );
}
