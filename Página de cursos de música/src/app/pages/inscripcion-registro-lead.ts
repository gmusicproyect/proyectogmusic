export interface InscripcionLeadFormValues {
  nombre: string;
  email: string;
  whatsapp: string;
  tipoDoc: "boleta" | "factura";
  rut: string;
  razonSocial: string;
  direccion: string;
}

export function parseLeadFromFormData(
  get: (name: string) => FormDataEntryValue | null
): InscripcionLeadFormValues {
  const tipoDocRaw = get("tipoDoc");
  return {
    nombre: String(get("nombre") ?? "").trim(),
    email: String(get("email") ?? "").trim().toLowerCase(),
    whatsapp: String(get("whatsapp") ?? "").trim(),
    tipoDoc: tipoDocRaw === "factura" ? "factura" : "boleta",
    rut: String(get("rut") ?? "").trim(),
    razonSocial: String(get("razonSocial") ?? "").trim(),
    direccion: String(get("direccion") ?? "").trim(),
  };
}

export function readLeadFromForm(form: HTMLFormElement): InscripcionLeadFormValues {
  const fd = new FormData(form);
  return parseLeadFromFormData((name) => fd.get(name));
}

export function buildWhatsappMessage(
  tierName: string,
  periodLabel: string,
  nombre: string,
  email: string,
  wsp: string,
  tipoDoc: "boleta" | "factura",
  rut?: string,
  razonSocial?: string,
  direccion?: string
): string {
  let msg = `Hola, quiero inscribirme en Gmusic Estudio.`;
  msg += `\nCompleté las 5 clases gratuitas y quiero el camino completo.`;
  msg += `\nPlan elegido: ${tierName} (${periodLabel.toLowerCase()})`;
  msg += `\n\nMis datos:`;
  if (nombre.trim()) msg += `\nNombre: ${nombre.trim()}`;
  if (email.trim()) msg += `\nEmail: ${email.trim()}`;
  if (wsp.trim()) msg += `\nWhatsApp: ${wsp.trim()}`;
  if (tipoDoc === "boleta") {
    msg += `\nDocumento: Boleta`;
  } else {
    msg += `\nDocumento: Factura`;
    if (rut?.trim()) msg += `\nRUT: ${rut.trim()}`;
    if (razonSocial?.trim()) msg += `\nRazón social: ${razonSocial.trim()}`;
    if (direccion?.trim()) msg += `\nDirección: ${direccion.trim()}`;
  }
  return msg;
}

export function buildWhatsappUrl(
  whatsappNumber: string,
  tierName: string,
  periodLabel: string,
  nombre = "",
  email = "",
  wsp = "",
  tipoDoc: "boleta" | "factura" = "boleta",
  rut = "",
  razonSocial = "",
  direccion = ""
): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    buildWhatsappMessage(
      tierName,
      periodLabel,
      nombre,
      email,
      wsp,
      tipoDoc,
      rut,
      razonSocial,
      direccion
    )
  )}`;
}
