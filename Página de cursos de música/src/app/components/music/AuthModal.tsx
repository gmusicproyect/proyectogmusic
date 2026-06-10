import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { buildAuthModalSuccessPayload } from "../../utils/auth-modal-success";
import type { UserData } from "../../types/music-app";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: UserData) => void;
  defaultTab?: "login" | "register";
  registrationOnly?: boolean;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultTab = "register",
  registrationOnly = false,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const effectiveTab = registrationOnly ? "register" : activeTab;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (registrationOnly) {
      onSuccess(
        buildAuthModalSuccessPayload({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        })
      );
      setLoading(false);
      onClose();
      return;
    }

    // Simulación de registro/login fuera del funnel Semestral
    setTimeout(() => {
      onSuccess({
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        phone: formData.phone,
      });
      setLoading(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(10px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "linear-gradient(145deg, rgba(20,20,28,0.98) 0%, rgba(12,12,18,0.99) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 32,
            maxWidth: 480,
            width: "100%",
            padding: 48,
            position: "relative",
            boxShadow: "0 24px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)"
          }}
        >
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          {/* Logo/Icon */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 8px 32px rgba(37,99,235,0.3)"
          }}>
            <span style={{ fontSize: 32 }}>🎸</span>
          </div>

          {/* Título */}
          <h2 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#fff",
            textAlign: "center",
            marginBottom: 12
          }}>
            {effectiveTab === "register" ? "Crea tu cuenta" : "Bienvenido de vuelta"}
          </h2>
          <p style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            marginBottom: 32
          }}>
            {effectiveTab === "register"
              ? "Comienza tu viaje musical hoy mismo"
              : "Continúa donde lo dejaste"}
          </p>

          {/* Tabs */}
          {!registrationOnly && (
          <div style={{
            display: "flex",
            gap: 8,
            background: "rgba(255,255,255,0.03)",
            padding: 6,
            borderRadius: 16,
            marginBottom: 32
          }}>
            <button
              onClick={() => setActiveTab("register")}
              style={{
                flex: 1,
                padding: "10px 20px",
                borderRadius: 12,
                background: activeTab === "register" ? "rgba(37,99,235,0.2)" : "transparent",
                border: activeTab === "register" ? "1px solid rgba(37,99,235,0.4)" : "1px solid transparent",
                color: activeTab === "register" ? "#2563eb" : "rgba(255,255,255,0.5)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            >
              Registrarse
            </button>
            <button
              onClick={() => setActiveTab("login")}
              style={{
                flex: 1,
                padding: "10px 20px",
                borderRadius: 12,
                background: activeTab === "login" ? "rgba(37,99,235,0.2)" : "transparent",
                border: activeTab === "login" ? "1px solid rgba(37,99,235,0.4)" : "1px solid transparent",
                color: activeTab === "login" ? "#2563eb" : "rgba(255,255,255,0.5)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            >
              Iniciar sesión
            </button>
          </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {effectiveTab === "register" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 8
                }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: María González"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 15,
                    outline: "none",
                    transition: "all 0.3s",
                    fontFamily: "'Outfit',sans-serif"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(37,99,235,0.5)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8
              }}>
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  transition: "all 0.3s",
                  fontFamily: "'Outfit',sans-serif"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(37,99,235,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8
              }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 8 caracteres"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  transition: "all 0.3s",
                  fontFamily: "'Outfit',sans-serif"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(37,99,235,0.5)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
            </div>

            {effectiveTab === "register" && (
              <div style={{ marginBottom: 28 }}>
                <label style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.7)",
                  marginBottom: 8
                }}>
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+52 123 456 7890"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 15,
                    outline: "none",
                    transition: "all 0.3s",
                    fontFamily: "'Outfit',sans-serif"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(37,99,235,0.5)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                />
              </div>
            )}

            {effectiveTab === "login" && (
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 28
              }}>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Botón submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: loading
                  ? "rgba(37,99,235,0.5)"
                  : "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 32px rgba(37,99,235,0.3)",
                transition: "all 0.3s",
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: 20
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(37,99,235,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.3)";
                }
              }}
            >
              {loading ? "Procesando..." : effectiveTab === "register" ? "Crear cuenta gratis" : "Iniciar sesión"}
            </button>

            {/* Divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 20
            }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>O continúa con</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* OAuth buttons */}
            <button
              type="button"
              style={{
                width: "100%",
                padding: "14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </form>

          {/* Footer */}
          <p style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
            marginTop: 24,
            lineHeight: 1.6
          }}>
            Al continuar, aceptas nuestros{" "}
            <span style={{ color: "#2563eb", cursor: "pointer" }}>Términos de uso</span> y{" "}
            <span style={{ color: "#2563eb", cursor: "pointer" }}>Política de privacidad</span>
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
