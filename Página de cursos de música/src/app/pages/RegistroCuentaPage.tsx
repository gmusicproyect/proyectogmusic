import { useEffect, useState, type FormEvent } from "react";
import { formatAuthFormError } from "../services/gmusic-api/client";
import { useAuth } from "../hooks/useAuth";
import {
  AuthFormShell,
  authInputStyle,
  authPrimaryButtonStyle,
} from "../components/gmusic/DemoAuthGuard";

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
  const { login } = useAuth();
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
      setPage("mi-camino-demo");
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

const REGISTRO_EXITO_REDIRECT_MS = 2500;

export function RegistroExitoPage({ setPage }: { setPage: (page: string) => void }) {
  const { isLoggedIn, session } = useAuth();

  useEffect(() => {
    if (session.status === "loading" || !isLoggedIn) {
      return;
    }
    const timer = window.setTimeout(() => setPage("onboarding-quiz"), REGISTRO_EXITO_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [isLoggedIn, session.status, setPage]);

  return (
    <AuthFormShell
      title="¡Gracias por inscribirte!"
      subtitle="Gracias por inscribirte, te regalamos las primeras 5 clases."
    >
      <p style={{ color: "#9CA3AF", fontSize: "13px", margin: "0 0 8px" }}>
        Redirigiendo al quiz de temperamento…
      </p>
      <button type="button" style={authPrimaryButtonStyle} onClick={() => setPage("onboarding-quiz")}>
        Continuar
      </button>
    </AuthFormShell>
  );
}
