"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n } from "./i18n";

const initialPasswordChange = {
  contrasenaActual: "",
  contrasenaNueva: "",
  confirmarContrasena: "",
};

export default function ProfilePage({ user }) {
  const { t, locale } = useI18n();
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [passwordChange, setPasswordChange] = useState(initialPasswordChange);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [changeError, setChangeError] = useState("");
  const [changeMessage, setChangeMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [requestingChange, setRequestingChange] = useState(false);

  async function saveProfile(event) {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setSavingProfile(true);
    try {
      const response = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: name, username }),
      });
      const payload = await response.json();
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      if (!response.ok) throw new Error(payload.message || "No se pudo actualizar el perfil.");
      setName(payload.usuario.nombre);
      setUsername(payload.usuario.username);
      setProfileMessage(t("Tu nombre y nombre de usuario se actualizaron."));
    } catch (error) {
      setProfileError(t(error.message || "No se pudo actualizar el perfil."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function requestAccountChange(payload) {
    setChangeError("");
    setChangeMessage("");
    setRequestingChange(true);
    try {
      const response = await fetch("/api/perfil/solicitar-cambio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.status === 401) {
        window.location.replace("/login");
        return false;
      }
      if (!response.ok) throw new Error(result.message || "No se pudo solicitar la confirmación.");
      setChangeMessage(t(result.message));
      return true;
    } catch (error) {
      setChangeError(t(error.message || "No se pudo solicitar la confirmación."));
      return false;
    } finally {
      setRequestingChange(false);
    }
  }

  async function changeEmail(event) {
    event.preventDefault();
    if (newEmail.trim().toLowerCase() === email.toLowerCase()) {
      setChangeError(t("El correo nuevo debe ser diferente al correo actual."));
      setChangeMessage("");
      return;
    }
    await requestAccountChange({ tipo: "EMAIL", emailNuevo: newEmail });
  }

  async function changePassword(event) {
    event.preventDefault();
    if (passwordChange.contrasenaNueva !== passwordChange.confirmarContrasena) {
      setChangeError(t("La nueva contraseña y su confirmación no coinciden."));
      setChangeMessage("");
      return;
    }
    const sent = await requestAccountChange({
      tipo: "PASSWORD",
      contrasenaActual: passwordChange.contrasenaActual,
      contrasenaNueva: passwordChange.contrasenaNueva,
    });
    if (sent) setPasswordChange(initialPasswordChange);
  }

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/inicio/DB.html">LIFFUC-DB</Link> / {t("Cuenta")}</p>
          <h1>{t("Mi perfil")}</h1>
          <p className="workspace-description">{t("Actualiza tu información y administra el acceso a tu cuenta.")}</p>
        </div>
      </header>
      <div className="profile-sections">
        <section className="workspace-card">
          <div className="profile-summary">
            <div className="profile-avatar" aria-hidden="true">{name.slice(0, 1).toLocaleUpperCase(locale) || "U"}</div>
            <div>
              <h2>{name || t("Usuario")}</h2>
              <p>{user?.role === "ADMIN" ? t("Administrador") : user?.role === "VISITANTE" ? t("Visitante") : t("Investigador")}</p>
            </div>
          </div>
          <h2 className="profile-section-title">{t("Información personal")}</h2>
          {profileError && <p className="workspace-message is-error" role="alert">{profileError}</p>}
          {profileMessage && <p className="workspace-message" role="status">{profileMessage}</p>}
          <form className="profile-form" onSubmit={saveProfile}>
            <label>
              {t("Nombre")}
              <input
                autoComplete="name"
                maxLength={120}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
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
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
              <small>{t("Debe ser único; admite letras, números, punto, guion y guion bajo.")}</small>
            </label>
            <label className="profile-field-readonly">
              {t("Correo actual")}
              <input value={email} readOnly />
              <small>{t("Para cambiarlo, solicita confirmación en la sección de seguridad.")}</small>
            </label>
            <button className="workspace-button workspace-button--primary profile-save" type="submit" disabled={savingProfile}>
              {savingProfile ? t("Guardando…") : t("Guardar nombre y usuario")}
            </button>
          </form>
        </section>

        <section className="workspace-card">
          <h2 className="profile-section-title">{t("Cambiar correo electrónico")}</h2>
          <p className="workspace-note">{t("Enviaremos un enlace al correo actual ({email}). El correo nuevo se aplicará después de confirmarlo.").replace("{email}", email)}</p>
          {changeError && <p className="workspace-message is-error" role="alert">{changeError}</p>}
          {changeMessage && <p className="workspace-message" role="status">{changeMessage}</p>}
          <form className="profile-form" onSubmit={changeEmail}>
            <label className="profile-field-wide">
              {t("Nuevo correo electrónico")}
              <input
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
              />
            </label>
            <button className="workspace-button workspace-button--primary profile-save" type="submit" disabled={requestingChange}>
              {requestingChange ? t("Enviando…") : t("Enviar confirmación al correo actual")}
            </button>
          </form>
        </section>

        <section className="workspace-card">
          <h2 className="profile-section-title">{t("Cambiar contraseña")}</h2>
          <p className="workspace-note">{t("Por seguridad, confirma tu contraseña actual. Enviaremos la autorización al correo registrado ({email}); la nueva contraseña se activa al confirmar el enlace.").replace("{email}", email)}</p>
          <form className="profile-form" onSubmit={changePassword}>
            <label>
              {t("Contraseña actual")}
              <input
                type="password"
                autoComplete="current-password"
                required
                value={passwordChange.contrasenaActual}
                onChange={(event) => setPasswordChange((current) => ({ ...current, contrasenaActual: event.target.value }))}
              />
            </label>
            <label>
              {t("Contraseña nueva (8 a 72 caracteres)")}
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                value={passwordChange.contrasenaNueva}
                onChange={(event) => setPasswordChange((current) => ({ ...current, contrasenaNueva: event.target.value }))}
              />
            </label>
            <label className="profile-field-wide">
              {t("Confirmar contraseña nueva")}
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                value={passwordChange.confirmarContrasena}
                onChange={(event) => setPasswordChange((current) => ({ ...current, confirmarContrasena: event.target.value }))}
              />
            </label>
            <button className="workspace-button workspace-button--primary profile-save" type="submit" disabled={requestingChange}>
              {requestingChange ? t("Enviando…") : t("Enviar autorización al correo actual")}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
