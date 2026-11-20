"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "./i18n";

export default function ConfirmAccountChangePage({ token }) {
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirmChange() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/perfil/confirmar-cambio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "No se pudo confirmar el cambio.");
      setMessage(t(payload.message));
    } catch (requestError) {
      setError(t(requestError.message || "No se pudo confirmar el cambio."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="workspace-page access-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/login">LIFFUC-DB</Link> / {t("Confirmar cambio")}</p>
          <h1>{t("Confirmar cambio de cuenta")}</h1>
          <p className="workspace-description">{t("Verifica la solicitud enviada al correo que tu cuenta tenía registrado.")}</p>
        </div>
      </header>
      <section className="workspace-card access-success">
        <h2>{t("Autorizar cambio")}</h2>
        <p>{t("Al confirmar, se actualizará el correo o la contraseña de tu cuenta.")}</p>
        {error && <p className="workspace-message is-error" role="alert">{error}</p>}
        {message ? (
          <>
            <p className="workspace-message" role="status">{message}</p>
            <Link className="workspace-button workspace-button--primary" href="/panel/perfil">{t("Volver a mi perfil")}</Link>
          </>
        ) : token ? (
          <button className="workspace-button workspace-button--primary" type="button" onClick={confirmChange} disabled={loading}>
            {loading ? t("Confirmando…") : t("Confirmar cambio")}
          </button>
        ) : (
          <>
            <p className="workspace-message is-error" role="alert">{t("El enlace no contiene un código de confirmación válido.")}</p>
            <Link className="workspace-button workspace-button--primary" href="/panel/perfil">{t("Volver a mi perfil")}</Link>
          </>
        )}
      </section>
    </main>
  );
}
