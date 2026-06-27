const DEMO_STORAGE_KEY = "gmusic:demo_v1";

export type DemoUserState =
  | "subscribed"
  | "demo_completed"
  | "demo_started"
  | "anonymous";

export interface DemoCtaConfig {
  state: DemoUserState;
  label: string;
  destination: string;
}

export function readDemoCompletedLessons(): number[] {
  return readCompletedLessons();
}

export function hasDemoProgress(): boolean {
  return readCompletedLessons().length > 0;
}

export function isDemoFullyCompleted(): boolean {
  return readCompletedLessons().length >= 5;
}

function readCompletedLessons(): number[] {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "completed" in parsed &&
      Array.isArray((parsed as { completed: unknown }).completed)
    ) {
      return (parsed as { completed: number[] }).completed.filter(
        (n) => typeof n === "number"
      );
    }
    return [];
  } catch {
    return [];
  }
}

export function getDemoUserState(
  sessionStatus:
    | "loading"
    | "authenticated"
    | "registered_no_sub"
    | "anonymous"
    | "error"
): DemoCtaConfig {
  if (sessionStatus === "authenticated") {
    return {
      state: "subscribed",
      label: "Entrar a mi academia",
      destination: "mi-estudio",
    };
  }

  const completed = readCompletedLessons();

  if (sessionStatus === "registered_no_sub") {
    if (completed.length >= 5) {
      return {
        state: "demo_completed",
        label: "Inscribirme para continuar",
        destination: "inscripcion-gate",
      };
    }
    if (completed.length > 0) {
      return {
        state: "demo_started",
        label: "Continuar clase gratuita",
        destination: "mi-camino-demo",
      };
    }
    return {
      state: "demo_started",
      label: "Iniciar mis clases gratis",
      destination: "mi-camino-demo",
    };
  }

  if (completed.length >= 5) {
    return {
      state: "demo_completed",
      label: "Inscribirme para continuar",
      destination: "inscripcion-gate",
    };
  }

  if (completed.length > 0) {
    return {
      state: "demo_started",
      label: "Continuar clase gratuita",
      destination: "mi-camino-demo",
    };
  }

  return {
    state: "anonymous",
    label: "Probar mis 5 clases gratis",
    destination: "registro-cuenta",
  };
}

export function useDemoUserState(
  sessionStatus:
    | "loading"
    | "authenticated"
    | "registered_no_sub"
    | "anonymous"
    | "error"
): DemoCtaConfig {
  return getDemoUserState(sessionStatus);
}
