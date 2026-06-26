import { ApiError } from "./errors.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 32;

export interface RegisterInput {
  name: string;
  email: string;
  phone: string | null;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s+/g, "");
}

export function parseRegisterBody(body: unknown): RegisterInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Datos de registro inválidos.");
  }

  const record = body as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email = typeof record.email === "string" ? normalizeEmail(record.email) : "";
  const phoneRaw = typeof record.phone === "string" ? normalizePhone(record.phone) : "";
  const phone = phoneRaw.length > 0 ? phoneRaw : null;
  const password = typeof record.password === "string" ? record.password : "";

  if (!name || name.length > MAX_NAME_LENGTH) {
    throw new ApiError(400, "VALIDATION_ERROR", "Nombre inválido.");
  }
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_RE.test(email)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Correo inválido.");
  }
  if (phone !== null && phone.length > MAX_PHONE_LENGTH) {
    throw new ApiError(400, "VALIDATION_ERROR", "Celular inválido.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new ApiError(422, "WEAK_PASSWORD", "La contraseña debe tener al menos 8 caracteres.");
  }

  return { name, email, phone, password };
}

export function parseLoginBody(body: unknown): LoginInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Datos de inicio de sesión inválidos.");
  }

  const record = body as Record<string, unknown>;
  const email = typeof record.email === "string" ? normalizeEmail(record.email) : "";
  const password = typeof record.password === "string" ? record.password : "";

  if (!email || !EMAIL_RE.test(email)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Correo inválido.");
  }
  if (!password) {
    throw new ApiError(400, "VALIDATION_ERROR", "Contraseña requerida.");
  }

  return { email, password };
}

export function toPublicAuthUser(user: { id: string; name: string; email: string }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
