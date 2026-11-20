import Link from "next/link";

export default function AccessRequestPage() {
  return (
    <main className="workspace-page access-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/login">LIFFUC-DB</Link> / Acceso institucional</p>
          <h1>Solicitar acceso</h1>
          <p className="workspace-description">Acceso para investigadores y colaboradores del laboratorio.</p>
        </div>
        <Link className="workspace-button workspace-button--quiet" href="/login">Ya tengo una cuenta</Link>
      </header>
      <section className="workspace-card access-success">
        <h2>Solicitudes en habilitación</h2>
        <p>Este espacio todavía no puede registrar solicitudes. Para obtener acceso, comunícate directamente con el administrador de LIFFUC.</p>
        <Link className="workspace-button workspace-button--primary" href="/login">Volver al inicio de sesión</Link>
      </section>
    </main>
  );
}
