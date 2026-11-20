"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "./i18n";

export default function PasswordResetPage({ token }) {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function resetPassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirmPassword) {
      setError(t("Las contraseñas no coinciden."));
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/restablecer-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "No se pudo restablecer la contraseña.");
      setPassword("");
      setConfirmPassword("");
      setMessage(t(payload.message));
    } catch (requestError) {
      setError(t(requestError.message || "No se pudo restablecer la contraseña."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="workspace-page access-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/login">LIFFUC-DB</Link> / {t("Nueva contraseña")}</p>
          <h1>{t("Restablecer contraseña")}</h1>
          <p className="workspace-description">{t("Elige una contraseña nueva para tu cuenta.")}</p>
        </div>
      </header>
      <section className="workspace-card">
        <h2>{t("Nueva contraseña")}</h2>
        {error && <p className="workspace-message is-error" role="alert">{error}</p>}
        {message ? (
          <>
            <p className="workspace-message" role="status">{message}</p>
            <Link className="workspace-button workspace-button--primary" href="/login">{t("Ir a iniciar sesión")}</Link>
          </>
        ) : token ? (
          <form className="access-form" onSubmit={resetPassword}>
            <label>
              {t("Contraseña nueva (8 a 72 caracteres)")}
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <label>
              {t("Confirmar contraseña nueva")}
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>
            <button className="workspace-button workspace-button--primary access-wide" type="submit" disabled={loading}>
              {loading ? t("Guardando…") : t("Guardar contraseña nueva")}
            </button>
          </form>
        ) : (
          <>
            <p className="workspace-message is-error" role="alert">{t("El enlace no contiene un código de recuperación válido.")}</p>
            <Link className="workspace-button workspace-button--primary" href="/recuperar-contrasena">{t("Solicitar otro enlace")}</Link>
          </>
        )}
      </section>
    </main>
  );
}
