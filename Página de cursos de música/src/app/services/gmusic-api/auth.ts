import { apiPost } from "./client";
import { getApiBaseUrl } from "./config";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function registerAccount(input: RegisterInput): Promise<AuthUser> {
  const { data } = await apiPost<{ user: AuthUser }>(
    `${getApiBaseUrl()}/auth/register`,
    input
  );
  return data.user;
}

export async function loginAccount(input: LoginInput): Promise<AuthUser> {
  const { data } = await apiPost<{ user: AuthUser }>(`${getApiBaseUrl()}/auth/login`, input);
  return data.user;
}

export async function logoutAccount(): Promise<void> {
  await fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
