import type { ReactNode } from "react";

interface PathShellProps {
  children: ReactNode;
  className?: string;
}

/** Contenedor centrado Mi Camino — alineado a DashboardShell (D-022A). */
export function PathShell({ children, className = "" }: PathShellProps) {
  return (
    <main className={`path-shell pt-5 md:pt-6 pb-10 md:pb-14 ${className}`.trim()}>
      {children}
    </main>
  );
}
