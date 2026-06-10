import { useRef, useState } from "react";
import { motion } from "motion/react";
import {
  getSemestralCheckoutPlan,
  isSemestralCheckoutCourse,
} from "../../utils/public-subscription-flow";
import { shouldAcceptCheckoutSubmission } from "./checkout-submission";

interface CheckoutPageProps {
  course: any;
  user: any;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function CheckoutPage({ course, user, onClose, onSuccess }: CheckoutPageProps) {
  const isSemestralCheckout = isSemestralCheckoutCourse(course);
  const semestralPlan = getSemestralCheckoutPlan();
  const [selectedPlan, setSelectedPlan] = useState<"single" | "subscription">("single");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "mercadopago">("card");
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const plans = {
    single: {
      name: "Curso Individual",
      price: course.price,
      description: "Pago único • Acceso de por vida",
      features: [
        "Acceso ilimitado al curso",
        "Todas las actualizaciones futuras",
        "Certificado de finalización",
        "Soporte prioritario"
      ]
    },
    subscription: {
      name: "Suscripción Mensual",
      price: 29,
      description: "Cancela cuando quieras",
      features: [
        "Acceso a TODOS los cursos",
        "Nuevos cursos cada mes",
        "Certificados ilimitados",
        "Soporte 24/7",
        "Sesiones en vivo con instructores"
      ]
    }
  };

  const finalPrice = isSemestralCheckout
    ? semestralPlan.price - discount
    : selectedPlan === "single"
      ? course.price - discount
      : plans.subscription.price - discount;

  const activePlanName = isSemestralCheckout
    ? semestralPlan.name
    : plans[selectedPlan].name;

  const activePlanSubtotal = isSemestralCheckout
    ? semestralPlan.price
    : selectedPlan === "single"
      ? course.price
      : plans.subscription.price;

  const handlePromoCode = () => {
    // Simulación de código promocional
    if (promoCode.toUpperCase() === "GMUSIC20") {
      setDiscount(isSemestralCheckout ? 15.8 : selectedPlan === "single" ? 15.8 : 5.8);
    }
  };

  const handlePayment = async () => {
    if (!shouldAcceptCheckoutSubmission(processing, submittingRef.current)) return;

    submittingRef.current = true;
    setProcessing(true);
    setCheckoutError(null);

    try {
      await onSuccess();
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim().length > 0
          ? error.message
          : "No pudimos completar la activación. Intenta de nuevo.";
      setCheckoutError(message);
    } finally {
      setProcessing(false);
      submittingRef.current = false;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      paddingTop: 100,
      paddingBottom: 100
    }}>
      {/* Header */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 40px 40px"
      }}>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            padding: "10px 20px",
            borderRadius: 24,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 32
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver al curso
        </button>

        <h1 style={{
          fontSize: 36,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 8
        }}>
          Completa tu compra
        </h1>
        <p style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.5)"
        }}>
          Hola {user.name}, estás a un paso de comenzar tu aprendizaje
        </p>
      </div>

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 40px",
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        gap: 40
      }}>
        {/* Columna izquierda - Formulario */}
        <div>
          {/* Selección de plan */}
          <div style={{ marginBottom: 40 }}>
            <h2 style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#fff",
              marginBottom: 20
            }}>
              {isSemestralCheckout ? "Tu plan" : "Elige tu plan"}
            </h2>

            {isSemestralCheckout ? (
              <div
                style={{
                  background: "rgba(37,99,235,0.1)",
                  border: "2px solid rgba(37,99,235,0.5)",
                  borderRadius: 20,
                  padding: 24,
                }}
              >
                <div style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 8
                }}>
                  ${semestralPlan.price}
                </div>

                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#fff",
                  marginBottom: 4
                }}>
                  Plan {semestralPlan.name}
                </div>

                <div style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 8
                }}>
                  {semestralPlan.description}
                </div>

                <div style={{
                  fontSize: 13,
                  color: "#2563eb",
                  fontWeight: 600,
                  marginBottom: 16
                }}>
                  Duración: {semestralPlan.duration}
                </div>

                {semestralPlan.features.map((feature, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.7)"
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
            ) : (
            <div style={{ display: "flex", gap: 16 }}>
              {(["single", "subscription"] as const).map((plan) => (
                <motion.div
                  key={plan}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPlan(plan)}
                  style={{
                    flex: 1,
                    background: selectedPlan === plan
                      ? "rgba(37,99,235,0.1)"
                      : "rgba(255,255,255,0.02)",
                    border: selectedPlan === plan
                      ? "2px solid rgba(37,99,235,0.5)"
                      : "2px solid rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    padding: 24,
                    cursor: "pointer",
                    transition: "all 0.3s",
                    position: "relative"
                  }}
                >
                  {plan === "subscription" && (
                    <div style={{
                      position: "absolute",
                      top: -10,
                      right: 20,
                      background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                      color: "#000",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 12px",
                      borderRadius: 12,
                      textTransform: "uppercase",
                      letterSpacing: "1px"
                    }}>
                      Popular
                    </div>
                  )}

                  <div style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 8
                  }}>
                    ${plans[plan].price}
                    {plan === "subscription" && (
                      <span style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>/mes</span>
                    )}
                  </div>

                  <div style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 4
                  }}>
                    {plans[plan].name}
                  </div>

                  <div style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: 16
                  }}>
                    {plans[plan].description}
                  </div>

                  {plans[plan].features.map((feature, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                        fontSize: 13,
                        color: "rgba(255,255,255,0.7)"
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {feature}
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
            )}
          </div>

          {/* Método de pago */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#fff",
              marginBottom: 20
            }}>
              Método de pago
            </h2>

            <div style={{
              display: "flex",
              gap: 12,
              marginBottom: 24
            }}>
              {[
                { id: "card", label: "Tarjeta", icon: "💳" },
                { id: "paypal", label: "PayPal", icon: "🅿️" },
                { id: "mercadopago", label: "Mercado Pago", icon: "💵" }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as any)}
                  style={{
                    flex: 1,
                    padding: "14px 20px",
                    background: paymentMethod === method.id
                      ? "rgba(37,99,235,0.15)"
                      : "rgba(255,255,255,0.05)",
                    border: paymentMethod === method.id
                      ? "1px solid rgba(37,99,235,0.5)"
                      : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    color: paymentMethod === method.id ? "#2563eb" : "rgba(255,255,255,0.7)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.3s"
                  }}
                >
                  <span style={{ fontSize: 20 }}>{method.icon}</span>
                  {method.label}
                </button>
              ))}
            </div>

            {/* Formulario de tarjeta */}
            {paymentMethod === "card" && (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 24
              }}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.7)",
                    marginBottom: 8
                  }}>
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 15,
                      outline: "none",
                      fontFamily: "'Outfit',sans-serif"
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
                    Nombre en la tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="NOMBRE APELLIDO"
                    value={cardData.name}
                    onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 15,
                      outline: "none",
                      fontFamily: "'Outfit',sans-serif",
                      textTransform: "uppercase"
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 8
                    }}>
                      Vencimiento
                    </label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "#fff",
                        fontSize: 15,
                        outline: "none",
                        fontFamily: "'Outfit',sans-serif"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 8
                    }}>
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "#fff",
                        fontSize: 15,
                        outline: "none",
                        fontFamily: "'Outfit',sans-serif"
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "paypal" && (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 40,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🅿️</div>
                <p style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 20
                }}>
                  Serás redirigido a PayPal para completar el pago de forma segura
                </p>
              </div>
            )}

            {paymentMethod === "mercadopago" && (
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 40,
                textAlign: "center"
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💵</div>
                <p style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.6)",
                  marginBottom: 20
                }}>
                  Serás redirigido a Mercado Pago para completar el pago
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha - Resumen */}
        <div>
          <div style={{
            position: "sticky",
            top: 100
          }}>
            {/* Card del curso */}
            <div style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: 24,
              marginBottom: 20
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 20
              }}>
                Resumen de compra
              </h3>

              <div style={{
                display: "flex",
                gap: 16,
                marginBottom: 24,
                paddingBottom: 24,
                borderBottom: "1px solid rgba(255,255,255,0.08)"
              }}>
                <img
                  src={course.image}
                  alt={course.title}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    objectFit: "cover"
                  }}
                />
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 6,
                    lineHeight: 1.3
                  }}>
                    {course.title}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: 4
                  }}>
                    por {course.instructor}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: "#2563eb",
                    fontWeight: 600
                  }}>
                    {activePlanName}
                  </div>
                </div>
              </div>

              {/* Código promocional */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: "flex",
                  gap: 8
                }}>
                  <input
                    type="text"
                    placeholder="Código promocional"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      color: "#fff",
                      fontSize: 13,
                      outline: "none",
                      fontFamily: "'Outfit',sans-serif"
                    }}
                  />
                  <button
                    onClick={handlePromoCode}
                    style={{
                      padding: "12px 20px",
                      background: "rgba(37,99,235,0.15)",
                      border: "1px solid rgba(37,99,235,0.3)",
                      borderRadius: 10,
                      color: "#2563eb",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Aplicar
                  </button>
                </div>
                {discount > 0 && (
                  <div style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    ¡Descuento aplicado!
                  </div>
                )}
              </div>

              {/* Desglose de precio */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 10,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.7)"
                }}>
                  <span>Subtotal</span>
                  <span>${activePlanSubtotal}</span>
                </div>

                {discount > 0 && (
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    fontSize: 14,
                    color: "#10b981"
                  }}>
                    <span>Descuento</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{
                  height: 1,
                  background: "rgba(255,255,255,0.1)",
                  margin: "16px 0"
                }} />

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#fff"
                }}>
                  <span>Total</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Botón de pago */}
              {checkoutError && (
                <div
                  role="alert"
                  style={{
                    marginBottom: 12,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(239,68,68,0.12)",
                    border: "1px solid rgba(239,68,68,0.35)",
                    color: "#fecaca",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {checkoutError}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: processing
                    ? "rgba(251,191,36,0.5)"
                    : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  border: "none",
                  borderRadius: 16,
                  color: "#000",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: processing ? "not-allowed" : "pointer",
                  boxShadow: "0 8px 32px rgba(251,191,36,0.4)",
                  transition: "all 0.3s",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: 16
                }}
              >
                {processing ? "Procesando..." : "Completar pago"}
              </button>

              {/* Garantía */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                textAlign: "center",
                justifyContent: "center"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Garantía de reembolso de 30 días
              </div>
            </div>

            {/* Info adicional */}
            <div style={{
              background: "rgba(37,99,235,0.05)",
              border: "1px solid rgba(37,99,235,0.2)",
              borderRadius: 16,
              padding: 20
            }}>
              <div style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.6
              }}>
                <div style={{ marginBottom: 12, fontWeight: 600, color: "#2563eb" }}>
                  ✓ Pago 100% seguro
                </div>
                Tus datos están protegidos con encriptación SSL de nivel bancario. Nunca almacenamos información de tu tarjeta.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
