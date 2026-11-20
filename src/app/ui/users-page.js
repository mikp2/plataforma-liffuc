"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
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

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/inicio/DB.html">LIFFUC-DB</Link> / Panel de trabajo</p>
          <h1>Usuarios</h1>
          <p className="workspace-description">Directorio de cuentas con acceso al banco.</p>
        </div>
        <button className="workspace-button workspace-button--quiet" type="button" onClick={loadUsers} disabled={loading}>Actualizar</button>
      </header>
      {error && <p className="workspace-message is-error" role="status">{error}</p>}
      {loading ? <p className="workspace-empty">Cargando usuarios…</p> : users.length ? (
        <section className="workspace-card users-table-card">
          <div className="users-section-heading"><h2>Cuentas registradas</h2><span>{users.length} usuario(s)</span></div>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Acceso</th></tr></thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.nombre}</strong><span>{user.email}</span></td>
                    <td>{user.username}</td>
                    <td>{user.rol === "ADMIN" ? "Administrador" : "Investigador"}</td>
                    <td>{user.activo ? "Activo" : "Inactivo"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : !error ? <p className="workspace-empty">No hay usuarios para mostrar.</p> : null}
    </main>
  );
}
