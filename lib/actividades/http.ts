import { NextResponse } from 'next/server';
import { ActividadError } from './store';

export function jsonError(err: unknown) {
  if (err instanceof ActividadError) {
    return NextResponse.json({ ok: false, message: err.message }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ ok: false, message: 'No se pudo completar la acción' }, { status: 500 });
}
