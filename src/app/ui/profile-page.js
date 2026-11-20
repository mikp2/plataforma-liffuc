import Link from "next/link";

export default function ProfilePage({ user }) {
  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/inicio/DB.html">LIFFUC-DB</Link> / Cuenta</p>
          <h1>Mi perfil</h1>
          <p className="workspace-description">Información de tu cuenta institucional.</p>
        </div>
      </header>
      <section className="workspace-card profile-form">
        <div className="profile-summary">
          <div className="profile-avatar" aria-hidden="true">{user?.name?.slice(0, 1).toLocaleUpperCase("es") || "U"}</div>
          <div>
            <h2>{user?.name || "Usuario"}</h2>
            <p>{user?.role === "ADMIN" ? "Administrador" : "Investigador"}</p>
          </div>
        </div>
        <label>Nombre<input value={user?.name || ""} readOnly disabled /></label>
        <label>Correo electrónico<input value={user?.email || "No registrado"} readOnly disabled /></label>
        <div className="profile-readonly-note">
          La edición del perfil y el cambio de contraseña todavía no están disponibles en los servicios actuales.
        </div>
      </section>
    </main>
  );
}
