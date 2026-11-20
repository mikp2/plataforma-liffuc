"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "../../ui/i18n";
import "@/app/ui/workspace.css";

export default function CreateVisitorAccountPage() {
  const { t } = useI18n();
  const [values, setValues] = useState({
    nombre: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitRegistration(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "No se pudo solicitar la cuenta.");
      setValues({ nombre: "", email: "", username: "", password: "", confirmPassword: "" });
      setMessage(t(payload.message));
    } catch (requestError) {
      setError(t(requestError.message || "No se pudo solicitar la cuenta."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="workspace-page access-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/login">LIFFUC-DB</Link> / {t("Crear cuenta")}</p>
          <h1>{t("Cuenta de visitante")}</h1>
          <p className="workspace-description">{t("Regístrate para consultar las moléculas publicadas.")}</p>
        </div>
        <Link className="workspace-button workspace-button--quiet" href="/login">{t("Volver a iniciar sesión")}</Link>
      </header>
      <section className="workspace-card">
        <h2>{t("Crear una cuenta de visitante")}</h2>
        <p className="workspace-note">{t("Solo se crean cuentas de visitante. Para solicitar acceso de investigador, comunícate con el administrador.")}</p>
        {error && <p className="workspace-message is-error" role="alert">{error}</p>}
        {message && <p className="workspace-message" role="status">{message}</p>}
        <form className="access-form" onSubmit={submitRegistration}>
          <label>
            {t("Nombre completo")}
            <input
              autoComplete="name"
              maxLength={120}
              required
              value={values.nombre}
              onChange={(event) => setValues((current) => ({ ...current, nombre: event.target.value }))}
            />
          </label>
          <label>
            {t("Correo electrónico")}
            <input
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={values.email}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label>
            {t("Nombre de usuario")}
            <input
              autoComplete="username"
              minLength={3}
              maxLength={50}
              pattern="[A-Za-z0-9._-]+"
              required
              value={values.username}
              onChange={(event) => setValues((current) => ({ ...current, username: event.target.value }))}
            />
          </label>
          <label>
            {t("Contraseña (8 a 72 caracteres)")}
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              value={values.password}
              onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
            />
          </label>
          <label className="access-wide">
            {t("Confirmar contraseña")}
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              value={values.confirmPassword}
              onChange={(event) => setValues((current) => ({ ...current, confirmPassword: event.target.value }))}
            />
          </label>
          <button className="workspace-button workspace-button--primary" type="submit" disabled={loading}>
            {loading ? t("Enviando…") : t("Enviar confirmación al correo")}
          </button>
        </form>
      </section>
    </main>
  );
}
