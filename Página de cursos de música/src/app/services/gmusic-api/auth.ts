import { apiPost, GmusicApiError, runFetch } from "./client";
import { getApiBaseUrl } from "./config";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AdminResetPasswordInput {
  email: string;
  recoveryKey: string;
  newPassword: string;
}

export async function registerAccount(input: RegisterInput): Promise<AuthUser> {
  const { data } = await apiPost<{ user: AuthUser }>(
    `${getApiBaseUrl()}/auth/register`,
    {
      name: input.name,
      email: input.email,
      password: input.password,
      ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
    }
  );
  return data.user;
}

export async function loginAccount(input: LoginInput): Promise<AuthUser> {
  const { data } = await apiPost<{ user: AuthUser }>(`${getApiBaseUrl()}/auth/login`, input);
  return data.user;
}

export async function resetAdminPassword(input: AdminResetPasswordInput): Promise<void> {
  const response = await runFetch(`${getApiBaseUrl()}/auth/admin/reset-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = "No pudimos restablecer la contraseña.";

    try {
      const body = (await response.json()) as { error?: { code?: string; message?: string } };
      if (body.error?.code) code = body.error.code;
      if (body.error?.message) message = body.error.message;
    } catch {
      // Respuesta no JSON; mantener mensaje genérico.
    }

    throw new GmusicApiError(message, response.status, code);
  }

  if (response.status !== 204) {
    throw new GmusicApiError(
      "La respuesta de recuperación no es válida.",
      response.status,
      "INVALID_RESPONSE"
    );
  }
}

export async function logoutAccount(): Promise<void> {
  const response = await runFetch(`${getApiBaseUrl()}/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = `Error ${response.status} al cerrar sesión.`;

    try {
      const body = (await response.json()) as { error?: { code?: string; message?: string } };
      if (body.error?.code) code = body.error.code;
      if (body.error?.message) message = body.error.message;
    } catch {
      // Respuesta no JSON; mantener mensaje genérico.
    }

    throw new GmusicApiError(message, response.status, code);
  }

  if (response.status !== 204) {
    throw new GmusicApiError(
      "La respuesta de cierre de sesión no es válida.",
      response.status,
      "INVALID_RESPONSE"
    );
  }
}
