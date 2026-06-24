import { useState, type FormEvent } from "react";
import { GmusicApiError } from "../services/gmusic-api/client";
import { useAuth } from "../hooks/useAuth";
import {
  AuthFormShell,
  authInputStyle,
  authPrimaryButtonStyle,
} from "../components/gmusic/DemoAuthGuard";

interface RegistroCuentaPageProps {
  setPage: (page: string) => void;
}

export function RegistroCuentaPage({ setPage }: RegistroCuentaPageProps) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ name, email, phone, password });
      setPage("registro-exito");
    } catch (err) {
      const message =
        err instanceof GmusicApiError
          ? err.message
          : "No pudimos crear tu cuenta. Inténtalo de nuevo.";
      setError(message);
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

        <label htmlFor="registro-phone">Celular</label>
        <input
          id="registro-phone"
          type="tel"
          style={authInputStyle}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          autoComplete="tel"
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
      const message =
        err instanceof GmusicApiError
          ? err.message
          : "No pudimos iniciar sesión. Revisa tus datos.";
      setError(message);
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

export function RegistroExitoPage({ setPage }: { setPage: (page: string) => void }) {
  return (
    <AuthFormShell
      title="¡Gracias por inscribirte!"
      subtitle="Te regalamos las primeras 5 clases. Empieza cuando quieras."
    >
      <button type="button" style={authPrimaryButtonStyle} onClick={() => setPage("mi-camino-demo")}>
        Ir a mis clases gratis
      </button>
    </AuthFormShell>
  );
}
