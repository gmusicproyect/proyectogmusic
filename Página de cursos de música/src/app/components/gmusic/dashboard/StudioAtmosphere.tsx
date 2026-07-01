import type { ReactNode } from "react";

interface StudioAtmosphereProps {
  children: ReactNode;
  className?: string;
}

/** Shell Obsidian & Gold para Mi Estudio — ambiente full-bleed, contenido contenido. */
export function StudioAtmosphere({ children, className }: StudioAtmosphereProps) {
  return (
    <div className={`studio-atmosphere min-h-screen${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
