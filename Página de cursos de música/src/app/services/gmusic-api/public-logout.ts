import { logoutAccount } from "./auth";
import { GmusicApiError } from "./client";
import { postDevLogout } from "./dev-logout";

/**
 * Cierra sesión pública: JWT vía /auth/logout (Render y local).
 * En dev, intenta además /dev/logout para cookie de activación semestral local (ignora 404 en Render).
 */
export async function performPublicLogout(): Promise<void> {
  await logoutAccount();

  if (import.meta.env?.DEV !== true) return;

  try {
    await postDevLogout();
  } catch (error) {
    if (error instanceof GmusicApiError && error.status === 404) return;
    throw error;
  }
}

export function shouldAcceptLogoutSubmission(processing: boolean): boolean {
  return !processing;
}
