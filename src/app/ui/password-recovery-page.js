"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "./i18n";

export default function PasswordRecoveryPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestReset(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/recuperar-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || t("No se pudo solicitar la recuperación."));
      setMessage(t(payload.message));
    } catch (requestError) {
      setError(t(requestError.message || "No se pudo solicitar la recuperación."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="workspace-page access-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/login">LIFFUC-DB</Link> / {t("Recuperar contraseña")}</p>
          <h1>{t("Recuperar contraseña")}</h1>
          <p className="workspace-description">{t("Te enviaremos instrucciones al correo asociado a tu cuenta.")}</p>
        </div>
      </header>
      <section className="workspace-card">
        <h2>{t("Solicitar enlace de recuperación")}</h2>
        <p className="workspace-note">{t("Por seguridad, el mensaje no revela si el correo tiene una cuenta activa.")}</p>
        {error && <p className="workspace-message is-error" role="alert">{error}</p>}
        {message && <p className="workspace-message" role="status">{message}</p>}
        <form className="access-form" onSubmit={requestReset}>
          <label className="access-wide">
            {t("Correo electrónico")}
            <input
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button className="workspace-button workspace-button--primary" type="submit" disabled={loading}>
            {loading ? t("Enviando…") : t("Enviar enlace")}
          </button>
        </form>
        <Link className="auth-secondary-link" href="/login">{t("Volver a iniciar sesión")}</Link>
      </section>
    </main>
  );
}
