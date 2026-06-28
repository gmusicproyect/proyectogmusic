import type { ReactNode } from "react";

interface StudioAtmosphereProps {
  children: ReactNode;
}

/** Shell Obsidian & Gold para Mi Estudio — ambiente full-bleed, contenido contenido. */
export function StudioAtmosphere({ children }: StudioAtmosphereProps) {
  return <div className="studio-atmosphere min-h-screen">{children}</div>;
}
