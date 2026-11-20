"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "./i18n";

export default function VerifyVisitorAccountPage({ token }) {
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyEmail() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/verificar-cuenta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "No se pudo confirmar el correo.");
      setMessage(t(payload.message));
    } catch (requestError) {
      setError(t(requestError.message || "No se pudo confirmar el correo."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="workspace-page access-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/login">LIFFUC-DB</Link> / {t("Confirmar correo")}</p>
          <h1>{t("Verificar cuenta")}</h1>
          <p className="workspace-description">{t("Confirma que tienes acceso al correo usado para registrarte.")}</p>
        </div>
      </header>
      <section className="workspace-card access-success">
        <h2>{t("Activar cuenta de visitante")}</h2>
        <p>{t("Al confirmar, tu cuenta quedará habilitada para consultar las moléculas publicadas.")}</p>
        {error && <p className="workspace-message is-error" role="alert">{error}</p>}
        {message ? (
          <>
            <p className="workspace-message" role="status">{message}</p>
            <Link className="workspace-button workspace-button--primary" href="/login">{t("Ir a iniciar sesión")}</Link>
          </>
        ) : (
          <button className="workspace-button workspace-button--primary" type="button" onClick={verifyEmail} disabled={loading || !token}>
            {loading ? t("Confirmando…") : t("Confirmar mi correo")}
          </button>
        )}
        {!token && <p className="workspace-message is-error" role="alert">El enlace no contiene un código de confirmación válido.</p>}
      </section>
    </main>
  );
}
