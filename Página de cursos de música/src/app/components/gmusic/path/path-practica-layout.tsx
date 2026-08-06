import { createContext, useContext, type ReactNode } from "react";

export type PathPracticaLayoutMode = "inline" | "immersive";

const PathPracticaLayoutContext = createContext<PathPracticaLayoutMode>("inline");

export function PathPracticaLayoutProvider({
  mode,
  children,
}: {
  mode: PathPracticaLayoutMode;
  children: ReactNode;
}) {
  return (
    <PathPracticaLayoutContext.Provider value={mode}>{children}</PathPracticaLayoutContext.Provider>
  );
}

export function usePathPracticaLayout(): PathPracticaLayoutMode {
  return useContext(PathPracticaLayoutContext);
}
