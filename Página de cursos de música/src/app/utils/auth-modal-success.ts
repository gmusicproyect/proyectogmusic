import type { UserData } from "../types/music-app";

export interface AuthModalFormValues {
  name: string;
  email: string;
  phone: string;
}

export function buildAuthModalSuccessPayload(
  formData: AuthModalFormValues
): UserData {
  const email = formData.email.trim();
  const name = formData.name.trim() || email.split("@")[0] || "";
  const payload: UserData = { name, email };

  if (formData.phone.trim()) {
    payload.phone = formData.phone.trim();
  }

  return payload;
}
