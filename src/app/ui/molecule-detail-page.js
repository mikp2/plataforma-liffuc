"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/app/ui/workspace.css";

const stateLabels = {
  BORRADOR: "Borrador",
  EN_REVISION: "En revisión",
  APROBADA: "Aprobada",
  PUBLICADA: "Publicada",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function MoleculeDetailPage({ codigo }) {
  const router = useRouter();
  const [molecule, setMolecule] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/moleculas/${encodeURIComponent(codigo)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (response.status === 401) {
          router.replace("/login");
          return;
        }
        if (!response.ok) throw new Error(payload.message || "No se pudo cargar la molécula.");
        if (active) setMolecule(payload);
      })
      .catch((loadError) => { if (active) setError(loadError.message || "No se pudo cargar la molécula."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [codigo, router]);

  return (
    <main className="workspace-page">
      <header className="workspace-header">
        <div>
          <p className="workspace-breadcrumb"><Link href="/inicio/DB.html">LIFFUC-DB</Link> / <Link href="/panel/moleculas">Moléculas</Link></p>
          <h1>{molecule?.nombre || "Ficha de molécula"}</h1>
          <p className="workspace-description">{molecule ? `${molecule.codigo} · ${stateLabels[molecule.estado] || molecule.estado}` : "Información del compuesto"}</p>
        </div>
        {molecule && <Link className="workspace-button workspace-button--primary" href={`/panel/moleculas/${encodeURIComponent(molecule.codigo)}/editar`}>Editar ficha</Link>}
      </header>
      {loading && <p className="workspace-empty">Cargando ficha…</p>}
      {error && <p className="workspace-message is-error" role="alert">{error}</p>}
      {molecule && (
        <>
          <section className="workspace-card molecule-facts">
            {[
              ["Fórmula molecular", molecule.formula],
              ["Peso molecular", molecule.pesoMolecular ? `${molecule.pesoMolecular} g/mol` : ""],
              ["Especie", molecule.especie],
              ["Familia química", molecule.familia],
              ["Procedencia", molecule.origen],
              ["Última actualización", formatDate(molecule.updatedAt)],
            ].filter(([, value]) => value).map(([label, value]) => (
              <div key={label}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </section>
          {[
            ["Descripción", molecule.descripcion],
            ["Actividad biológica", molecule.actividad],
            ["Método de obtención", molecule.metodoObtencion],
            ["Referencias", molecule.referencias],
          ].filter(([, value]) => value).map(([label, value]) => (
            <section className="workspace-card molecule-text-section" key={label}><h2>{label}</h2><p>{value}</p></section>
          ))}
          {molecule.archivos?.length > 0 && (
            <section className="workspace-card molecule-text-section">
              <h2>Archivos asociados</h2>
              <div className="molecule-attachments">
                {molecule.archivos.map((file) => (
                  <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.tipo === "PDF" ? "PDF" : "Imagen"} · {file.nombre}
                  </a>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
