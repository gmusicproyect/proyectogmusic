import { apiPost } from "./client";
import { getApiBaseUrl } from "./config";

export type SignedMaterialUrlResponse = {
  signedUrl: string;
  expiresIn: number;
};

export async function fetchSignedMaterialUrl(
  materialUrl: string,
  options?: { signal?: AbortSignal }
): Promise<SignedMaterialUrlResponse> {
  const { data } = await apiPost<SignedMaterialUrlResponse>(
    `${getApiBaseUrl()}/me/media/signed-url`,
    { materialUrl },
    options
  );
  return data;
}
