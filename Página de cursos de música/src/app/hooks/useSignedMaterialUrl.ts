import { useEffect, useState } from "react";
import { GmusicApiError } from "../services/gmusic-api/client";
import { fetchSignedMaterialUrl } from "../services/gmusic-api/signed-material-url";
import { isPrivateSupabaseStorageMaterialUrl } from "../utils/supabase-storage";

export function useSignedMaterialUrl(materialUrl: string | null | undefined) {
  const needsSigning = isPrivateSupabaseStorageMaterialUrl(materialUrl);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(needsSigning);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!materialUrl?.trim() || !needsSigning) {
      setSignedUrl(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void fetchSignedMaterialUrl(materialUrl, { signal: controller.signal })
      .then((response) => {
        setSignedUrl(response.signedUrl);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setSignedUrl(null);
        setError(
          err instanceof GmusicApiError
            ? err.message
            : "No pudimos abrir el material protegido."
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [materialUrl, needsSigning]);

  return {
    resolvedUrl: needsSigning ? signedUrl : materialUrl ?? null,
    loading: needsSigning && loading,
    error: needsSigning ? error : null,
    needsSigning,
  };
}
