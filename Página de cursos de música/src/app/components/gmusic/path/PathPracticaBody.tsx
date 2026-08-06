import { usePathPracticaLayout } from "./path-practica-layout";
import type { ReactNode } from "react";

export function PathPracticaBody({ children }: { children: ReactNode }) {
  const mode = usePathPracticaLayout();
  if (mode === "immersive") {
    return <div className="path-practica-immersive-body">{children}</div>;
  }
  return <div className="w-full">{children}</div>;
}

export function PathPracticaImmersiveActions({ children }: { children: ReactNode }) {
  const mode = usePathPracticaLayout();
  if (mode === "immersive") {
    return <div className="path-practica-immersive-actions">{children}</div>;
  }
  return <>{children}</>;
}
