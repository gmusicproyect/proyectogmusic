import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { loadRenderSecretFile } from "../lib/loadRenderSecretFile.js";

describe("loadRenderSecretFile", () => {
  const tempFiles: string[] = [];

  afterEach(() => {
    for (const file of tempFiles.splice(0)) {
      fs.unlinkSync(file);
    }
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("ignora archivos inexistentes", () => {
    assert.doesNotThrow(() => loadRenderSecretFile("/tmp/does-not-exist-supabase.env"));
  });

  it("carga pares KEY=VALUE sin pisar env existente", () => {
    process.env.SUPABASE_URL = "https://existing.supabase.co";
    const file = path.join(os.tmpdir(), `supabase-${Date.now()}.env`);
    tempFiles.push(file);
    fs.writeFileSync(
      file,
      [
        "SUPABASE_URL=https://from-file.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY=service-from-file",
      ].join("\n")
    );

    loadRenderSecretFile(file);

    assert.equal(process.env.SUPABASE_URL, "https://existing.supabase.co");
    assert.equal(process.env.SUPABASE_SERVICE_ROLE_KEY, "service-from-file");
  });

  it("ignora comentarios y líneas vacías", () => {
    const file = path.join(os.tmpdir(), `supabase-${Date.now()}.env`);
    tempFiles.push(file);
    fs.writeFileSync(file, "# comment\n\nSUPABASE_URL=https://parsed.supabase.co\n");

    loadRenderSecretFile(file);

    assert.equal(process.env.SUPABASE_URL, "https://parsed.supabase.co");
  });
});
