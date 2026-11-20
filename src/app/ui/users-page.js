"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "./i18n";

export default function UsersPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    username: "",
    password: "",
    rol: "INVESTIGADOR",
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/usuarios", { cache: "no-store" });
      const payload = await response.json();
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error(payload.message || "No se pudo cargar la lista de usuarios.");
      if (!Array.isArray(payload.usuarios)) {
        setUsers([]);
        setError("El servicio de usuarios todavía no entrega registros ni permite administrarlos.");
        return;
      }
      setUsers(payload.usuarios);
    } catch (loadError) {
      setError(loadError.message || "No se pudo cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  async function createUser(event) {
    event.preventDefault();
    setCreatingUser(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const payload = await response.json();
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error(payload.message || "No se pudo crear el usuario.");
      setUsers((currentUsers) => [...currentUsers, payload.usuario]);
      setNewUser({ nombre: "", email: "", username: "", password: "", rol: "INVESTIGADOR" });
      setNotice(t("La cuenta fue creada. Comparte las credenciales de forma segura."));
    } catch (createError) {
      setError(createError.message || "No se pudo crear el usuario.");
    } finally {
      setCreatingUser(false);
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(t("¿Eliminar la cuenta de {name}? Esta acción no se puede deshacer.").replace("{name}", user.nombre))) return;
    setDeletingUserId(user.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/usuarios/${encodeURIComponent(user.id)}`, { method: "DELETE" });
      const payload = await response.json();
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error(payload.message || "No se pudo eliminar el usuario.");
      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));
    } catch (deleteError) {
      setError(deleteError.message || "No se pudo eliminar el usuario.");
    } finally {
      setDeletingUserId("");
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/inicio/DB.html">LIFFUC-DB</Link> / {t("Panel de trabajo")}</p>
          <h1>{t("Usuarios")}</h1>
          <p className="workspace-description">{t("Directorio de cuentas con acceso al banco.")}</p>
        </div>
        <button className="workspace-button workspace-button--quiet" type="button" onClick={loadUsers} disabled={loading}>{t("Actualizar")}</button>
      </header>
      {error && <p className="workspace-message is-error" role="status">{error}</p>}
      {notice && <p className="workspace-message" role="status">{notice}</p>}
      <section className="workspace-card users-create">
        <h2>{t("Crear cuenta")}</h2>
        <form className="user-form" onSubmit={createUser}>
          <label>
            {t("Nombre")}
            <input
              name="nombre"
              autoComplete="name"
              required
              maxLength={120}
              value={newUser.nombre}
              onChange={(event) => setNewUser((current) => ({ ...current, nombre: event.target.value }))}
            />
          </label>
          <label>
            {t("Correo")}
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={newUser.email}
              onChange={(event) => setNewUser((current) => ({ ...current, email: event.target.value }))}
            />
          </label>
          <label>
            {t("Nombre de usuario")}
            <input
              name="username"
              autoComplete="username"
              required
              minLength={3}
              maxLength={50}
              pattern="[A-Za-z0-9._-]+"
              value={newUser.username}
              onChange={(event) => setNewUser((current) => ({ ...current, username: event.target.value }))}
            />
          </label>
          <label>
            {t("Contraseña temporal (8 a 72 caracteres)")}
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              value={newUser.password}
              onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))}
            />
          </label>
          <label>
            {t("Tipo de usuario")}
            <select
              name="rol"
              value={newUser.rol}
              onChange={(event) => setNewUser((current) => ({ ...current, rol: event.target.value }))}
            >
              <option value="INVESTIGADOR">{t("Investigador")}</option>
              <option value="VISITANTE">{t("Visitante")}</option>
            </select>
          </label>
          <button className="workspace-button workspace-button--primary" type="submit" disabled={creatingUser}>
            {creatingUser ? `${t("Creando")}…` : t("Crear usuario")}
          </button>
        </form>
      </section>
      {loading ? <p className="workspace-empty">{t("Cargando usuarios…")}</p> : users.length ? (
        <section className="workspace-card users-table-card">
          <div className="users-section-heading"><h2>{t("Cuentas registradas")}</h2><span>{users.length} {t("Usuarios").toLocaleLowerCase()}</span></div>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead><tr><th>{t("Nombre")}</th><th>{t("Usuario")}</th><th>{t("Rol")}</th><th>{t("Acceso")}</th><th>{t("Acciones")}</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.nombre}</strong><span>{user.email}</span></td>
                    <td>{user.username}</td>
                    <td>{user.rol === "ADMIN" ? t("Administrador") : user.rol === "VISITANTE" ? t("Visitante") : t("Investigador")}</td>
                    <td>{user.activo ? t("Activo") : t("Inactivo")}</td>
                    <td>
                      <button
                        className="workspace-button workspace-button--quiet"
                        type="button"
                        disabled={user.rol === "ADMIN" || deletingUserId === user.id}
                        onClick={() => deleteUser(user)}
                        title={user.rol === "ADMIN" ? t("La cuenta administradora no se puede eliminar.") : undefined}
                      >
                        {deletingUserId === user.id ? t("Eliminando…") : t("Eliminar")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : !error ? <p className="workspace-empty">{t("No hay usuarios para mostrar.")}</p> : null}
      <p className="workspace-note">{t("Las cuentas nuevas solo pueden tener rol de investigador o visitante. La contraseña se guarda cifrada; compártela por un canal seguro.")}</p>
    </main>
  );
}
