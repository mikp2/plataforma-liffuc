"use client";

import Link from "next/link";
import { useI18n } from "./i18n";

export default function AccessRequestPage() {
  const { t } = useI18n();

  return (
    <main className="workspace-page access-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/login">LIFFUC-DB</Link> / {t("Acceso institucional")}</p>
          <h1>{t("Solicitar acceso")}</h1>
          <p className="workspace-description">{t("Acceso para investigadores y colaboradores del laboratorio.")}</p>
        </div>
        <Link className="workspace-button workspace-button--quiet" href="/login">{t("Ya tengo una cuenta")}</Link>
      </header>
      <section className="workspace-card access-success">
        <h2>{t("Solicitudes en habilitación")}</h2>
        <p>{t("Este espacio todavía no puede registrar solicitudes. Para obtener acceso, comunícate directamente con el administrador de LIFFUC.")}</p>
        <Link className="workspace-button workspace-button--primary" href="/login">{t("Volver al inicio de sesión")}</Link>
      </section>
    </main>
  );
}
