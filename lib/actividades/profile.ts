import { normalizeProjectSex, type ProjectSex } from '@/lib/project-sex';
import { normalizePhone } from '@/lib/project-phone';
import type { ActivityParticipant } from './types';

export type EnrollmentProfileInput = {
  name?: string;
  phone?: string;
  email?: string;
  sex?: string | null;
  age?: string | number | null;
  locality?: string;
  organization?: string;
  companyName?: string;
  documentId?: string;
};

export type EnrollmentProfile = {
  name: string;
  phone: string;
  email: string;
  sex: ProjectSex | null;
  age: number | null;
  locality: string;
  organization: string;
  companyName: string;
  documentId: string;
};

export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function clean(value: unknown, max: number) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001F]/g, '').trim().slice(0, max);
}

function phoneKey(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return '';
  return digits.slice(-8);
}

function isEmail(value: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseAge(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) return null;
  const age = Math.round(n);
  if (age < 10 || age > 120) return null;
  return age;
}

/** Soft parse for Impulsa / manual partial rows. */
export function parseEnrollmentProfile(input: EnrollmentProfileInput): EnrollmentProfile {
  const phoneRaw = clean(input.phone, 40);
  return {
    name: clean(input.name, 160),
    phone: normalizePhone(phoneRaw) || phoneRaw,
    email: clean(input.email, 254),
    sex: normalizeProjectSex(input.sex),
    age: parseAge(input.age),
    locality: clean(input.locality, 120),
    organization: clean(input.organization, 200),
    companyName: clean(input.companyName, 200),
    documentId: clean(input.documentId, 40).replace(/\s+/g, ''),
  };
}

/** Strict validation for public course enrollment. */
export function requireEnrollmentProfile(input: EnrollmentProfileInput): EnrollmentProfile {
  const profile = parseEnrollmentProfile(input);
  if (profile.name.length < 2) throw new ProfileError('Escribe tu nombre completo');
  if (!phoneKey(profile.phone)) throw new ProfileError('Escribe un teléfono / WhatsApp válido');
  if (!isEmail(profile.email)) throw new ProfileError('Correo inválido');
  if (!profile.sex) throw new ProfileError('Indica el sexo / género');
  if (profile.age == null) throw new ProfileError('Indica tu edad (número entre 10 y 120)');
  if (profile.locality.length < 2) throw new ProfileError('Indica tu localidad o cantón');
  if (profile.documentId.length < 5) throw new ProfileError('Indica el número de documento');
  return profile;
}

/** Manual add from staff: name required; extra fields optional but validated if present. */
export function requireStaffProfile(input: EnrollmentProfileInput): EnrollmentProfile {
  const profile = parseEnrollmentProfile(input);
  if (profile.name.length < 2) throw new ProfileError('Escribe el nombre');
  if (profile.email && !isEmail(profile.email)) throw new ProfileError('Correo inválido');
  if (input.age != null && String(input.age).trim() !== '' && profile.age == null) {
    throw new ProfileError('Edad inválida');
  }
  if (input.sex && !profile.sex) throw new ProfileError('Sexo / género inválido');
  return profile;
}

export function applyProfile(person: ActivityParticipant, profile: EnrollmentProfile) {
  person.name = profile.name;
  person.phone = profile.phone;
  person.email = profile.email;
  person.sex = profile.sex;
  person.age = profile.age;
  person.locality = profile.locality;
  person.organization = profile.organization;
  person.companyName = profile.companyName;
  person.documentId = profile.documentId;
}

export function emptyEnrollmentForm() {
  return {
    name: '',
    phone: '',
    email: '',
    sex: '' as '' | ProjectSex,
    age: '',
    locality: '',
    organization: '',
    companyName: '',
    documentId: '',
  };
}

export type EnrollmentFormState = ReturnType<typeof emptyEnrollmentForm>;
