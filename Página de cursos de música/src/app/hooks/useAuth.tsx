import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  loginAccount,
  registerAccount,
  type AuthUser,
  type LoginInput,
  type RegisterInput,
} from "../services/gmusic-api/auth";
import { performPublicLogout } from "../services/gmusic-api/public-logout";
import { assertAuthSessionEstablished } from "../services/gmusic-api/assert-auth-session";
import {
  usePublicStudentSession,
  type PublicStudentSessionState,
} from "./usePublicStudentSession";
import type { PublicStudentSessionOutcome } from "../services/gmusic-api/public-student-session";

export interface AuthContextValue {
  session: PublicStudentSessionState;
  isLoggedIn: boolean;
  refresh: () => Promise<PublicStudentSessionOutcome>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  login: (input: LoginInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const publicSession = usePublicStudentSession();

  const isLoggedIn =
    publicSession.status === "registered_no_sub" ||
    publicSession.status === "authenticated";

  const register = useCallback(async (input: RegisterInput) => {
    const user = await registerAccount(input);
    const outcome = await publicSession.refresh();
    assertAuthSessionEstablished(outcome);
    return user;
  }, [publicSession]);

  const login = useCallback(async (input: LoginInput) => {
    const user = await loginAccount(input);
    const outcome = await publicSession.refresh();
    assertAuthSessionEstablished(outcome);
    return user;
  }, [publicSession]);

  const logout = useCallback(async () => {
    await performPublicLogout();
    await publicSession.refresh();
  }, [publicSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: publicSession,
      isLoggedIn,
      refresh: publicSession.refresh,
      register,
      login,
      logout,
    }),
    [publicSession, isLoggedIn, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider.");
  }
  return context;
}
