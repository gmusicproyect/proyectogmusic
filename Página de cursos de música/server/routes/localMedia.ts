import { Router } from "express";
import { ApiError } from "../lib/errors.js";
import { localObjectPath, resolveLocalStorageConfig, verifyStorageSignature } from "../lib/localStorage.js";
import { storageDriver } from "../lib/storage.js";

export const localMediaRouter = Router();

// Signed bearer URL: authorization occurs at /me/media/signed-url; no cookies
// required here so video/PDF range requests work. Never mount express.static.
localMediaRouter.get<{ bucket: string; 0: string }>("/:bucket/*", async (req, res, next) => {
  try {
    if (storageDriver() !== "local") throw new ApiError(404, "RESOURCE_NOT_FOUND", "Material no encontrado.");
    const config = resolveLocalStorageConfig();
    const objectPath = req.params[0];
    if (!verifyStorageSignature(req.params.bucket, objectPath, req.query.expires, req.query.signature, config.secret)) {
      throw new ApiError(403, "FORBIDDEN", "Enlace inválido o expirado.");
    }
    const filename = await localObjectPath(config.root, req.params.bucket, objectPath);
    res.set({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox", "Referrer-Policy": "no-referrer" });
    res.sendFile(filename, { cacheControl: false, dotfiles: "deny" }, error => {
      if (error && !res.headersSent) {
        const status = (error as { status?: number }).status;
        if (status === 404) next(new ApiError(404, "RESOURCE_NOT_FOUND", "Material no encontrado."));
        else if (status === 416) res.status(416).end();
        else next(error);
      }
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") next(new ApiError(404, "RESOURCE_NOT_FOUND", "Material no encontrado."));
    else next(error);
  }
});
