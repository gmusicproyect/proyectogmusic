import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { formatAuthFormError } from "../services/gmusic-api/client";
import { useAuth } from "../hooks/useAuth";
import {
  AuthFormShell,
  authInputStyle,
  authPrimaryButtonStyle,
} from "../components/gmusic/DemoAuthGuard";
import { GM_GOLD, GM_GOLD_GLOW, GM_TEXT_SEC } from "../components/gmusic/tokens";
import type { PublicStudentSessionState } from "../hooks/usePublicStudentSession";

interface RegistroCuentaPageProps {
  setPage: (page: string) => void;
}

// PENDIENTE (requiere migración Prisma): campo username / artistName aparte de `name`.

export function RegistroCuentaPage({ setPage }: RegistroCuentaPageProps) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        phone: phone.trim() || undefined,
        password,
      });
      setPage("registro-exito");
    } catch (err) {
      setError(
        formatAuthFormError(err, "No pudimos crear tu cuenta. Inténtalo de nuevo.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormShell
      title="Crea tu cuenta"
      subtitle="Regístrate para acceder a tus 5 clases de regalo."
    >
      <form onSubmit={(event) => void onSubmit(event)}>
        <label htmlFor="registro-name">Nombre</label>
        <input
          id="registro-name"
          style={authInputStyle}
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
        />

        <label htmlFor="registro-email">Correo</label>
        <input
          id="registro-email"
          type="email"
          style={authInputStyle}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />

        <label htmlFor="registro-password">Contraseña</label>
        <input
          id="registro-password"
          type="password"
          style={authInputStyle}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />

        <label htmlFor="registro-password-confirm">Confirmar contraseña</label>
        <input
          id="registro-password-confirm"
          type="password"
          style={authInputStyle}
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />

        <label htmlFor="registro-phone">Celular / WhatsApp (opcional)</label>
        <input
          id="registro-phone"
          type="tel"
          style={authInputStyle}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          autoComplete="tel"
        />

        {error ? (
          <p style={{ color: "#f87171", fontSize: "13px", marginTop: "12px" }} role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" style={authPrimaryButtonStyle} disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <button
          type="button"
          style={{ ...authPrimaryButtonStyle, background: "transparent", color: "#F5F5F7", border: "1px solid #222" }}
          onClick={() => setPage("login-cuenta")}
        >
          Ya tengo cuenta
        </button>
      </form>
    </AuthFormShell>
  );
}

interface LoginCuentaPageProps {
  setPage: (page: string) => void;
}

export function LoginCuentaPage({ setPage }: LoginCuentaPageProps) {
  const { login, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      const outcome = await refresh();
      setPage(outcome.type === "authenticated" ? "mi-camino" : "mi-camino-demo");
    } catch (err) {
      setError(
        formatAuthFormError(err, "No pudimos iniciar sesión. Revisa tus datos.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormShell title="Inicia sesión" subtitle="Accede a tus clases de regalo.">
      <form onSubmit={(event) => void onSubmit(event)}>
        <label htmlFor="login-email">Correo</label>
        <input
          id="login-email"
          type="email"
          style={authInputStyle}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
        />

        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          type="password"
          style={authInputStyle}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoComplete="current-password"
        />

        {error ? (
          <p style={{ color: "#f87171", fontSize: "13px", marginTop: "12px" }} role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" style={authPrimaryButtonStyle} disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>

        <button
          type="button"
          style={{ ...authPrimaryButtonStyle, background: "transparent", color: "#F5F5F7", border: "1px solid #222" }}
          onClick={() => setPage("registro-cuenta")}
        >
          Crear cuenta
        </button>
      </form>
    </AuthFormShell>
  );
}

const REGISTRO_EXITO_NEXT_PAGE = "onboarding-quiz";
export const REGISTRO_EXITO_REDIRECT_SECONDS = 7;

function registroExitoFirstName(session: PublicStudentSessionState): string | null {
  if (session.status !== "registered_no_sub" && session.status !== "authenticated") {
    return null;
  }
  const first = session.user.name.trim().split(/\s+/)[0];
  return first || session.user.name;
}

export function RegistroExitoPage({ setPage }: { setPage: (page: string) => void }) {
  const { isLoggedIn, session } = useAuth();
  const [secondsRemaining, setSecondsRemaining] = useState(REGISTRO_EXITO_REDIRECT_SECONDS);
  const advancedRef = useRef(false);
  const timersRef = useRef<{ interval?: number; timeout?: number }>({});

  const firstName = registroExitoFirstName(session);
  const title = firstName ? `¡Felicitaciones, ${firstName}!` : "¡Felicitaciones!";

  const advance = useCallback(() => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    if (timersRef.current.interval !== undefined) {
      window.clearInterval(timersRef.current.interval);
    }
    if (timersRef.current.timeout !== undefined) {
      window.clearTimeout(timersRef.current.timeout);
    }
    setPage(REGISTRO_EXITO_NEXT_PAGE);
  }, [setPage]);

  useEffect(() => {
    if (session.status === "loading" || !isLoggedIn) {
      return;
    }

    setSecondsRemaining(REGISTRO_EXITO_REDIRECT_SECONDS);
    let remaining = REGISTRO_EXITO_REDIRECT_SECONDS;

    timersRef.current.interval = window.setInterval(() => {
      remaining -= 1;
      setSecondsRemaining(Math.max(remaining, 0));
      if (remaining <= 0 && timersRef.current.interval !== undefined) {
        window.clearInterval(timersRef.current.interval);
      }
    }, 1000);

    timersRef.current.timeout = window.setTimeout(
      () => advance(),
      REGISTRO_EXITO_REDIRECT_SECONDS * 1000
    );

    return () => {
      if (timersRef.current.interval !== undefined) {
        window.clearInterval(timersRef.current.interval);
      }
      if (timersRef.current.timeout !== undefined) {
        window.clearTimeout(timersRef.current.timeout);
      }
    };
  }, [isLoggedIn, session.status, advance]);

  return (
    <AuthFormShell title={title} subtitle="Tu cuenta fue creada correctamente.">
      <div
        style={{
          border: "1px solid rgba(212, 175, 55, 0.32)",
          borderRadius: 12,
          padding: "16px 18px",
          background: `linear-gradient(180deg, ${GM_GOLD_GLOW} 0%, rgba(255,255,255,0.02) 100%)`,
          boxShadow: "0 0 20px rgba(212, 175, 55, 0.07)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            color: GM_GOLD,
            lineHeight: 1.45,
          }}
        >
          🎁 Ya desbloqueaste tus 5 clases gratis de guitarra
        </p>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 13,
            color: GM_TEXT_SEC,
            lineHeight: 1.55,
          }}
        >
          Estas clases son tu regalo de bienvenida para comenzar tu camino paso a paso.
        </p>
      </div>

      <p
        style={{
          color: GM_TEXT_SEC,
          fontSize: 12,
          margin: "16px 0 0",
          textAlign: "center",
          lineHeight: 1.4,
        }}
        aria-live="polite"
      >
        Avanzaremos automáticamente en {secondsRemaining}{" "}
        {secondsRemaining === 1 ? "segundo" : "segundos"}…
      </p>

      <button type="button" style={authPrimaryButtonStyle} onClick={() => advance()}>
        Comenzar mis 5 clases gratis
      </button>
    </AuthFormShell>
  );
}
