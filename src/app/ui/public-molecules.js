"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./public-molecules.css";

function displayDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(date);
}

function PublicShell({ children }) {
  return (
    <main className="public-catalog">
      <header className="public-catalog-header">
        <Link className="public-brand" href="/">LIFFUC<span>-DB</span></Link>
        <nav aria-label="Navegación pública">
          <Link href="/buscar">Buscar moléculas</Link>
          <Link href="/especies">Especies</Link>
          <Link className="public-login-link" href="/login">Acceso institucional</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}

export function PublicMoleculeExplorer({ view = "search", initialSpecies = "" }) {
  const router = useRouter();
  const [molecules, setMolecules] = useState([]);
  const [species, setSpecies] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState(initialSpecies);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const moleculeResponse = await fetch("/api/moleculas", { cache: "no-store" });
        const moleculePayload = await moleculeResponse.json();
        if (moleculeResponse.status === 401) {
          window.location.replace("/login");
          return;
        }
        if (!moleculeResponse.ok) throw new Error(moleculePayload.message || "No se pudo cargar el catálogo.");
        const publishedMolecules = (moleculePayload.moleculas || []).filter(
          (molecule) => molecule.estado === "PUBLICADA" && !molecule.codigo.startsWith("LFC-DEMO-"),
        );
        const speciesMap = new Map();
        for (const molecule of publishedMolecules) {
          speciesMap.set(molecule.especie, (speciesMap.get(molecule.especie) || 0) + 1);
        }
        if (active) {
          setMolecules(publishedMolecules);
          setSpecies([...speciesMap].map(([nombre, moleculas]) => ({ nombre, moleculas })));
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "No se pudo cargar el catálogo público.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => molecules.filter((molecule) => {
    const text = `${molecule.codigo} ${molecule.nombre} ${molecule.formula || ""} ${molecule.especie} ${molecule.familia || ""}`.toLocaleLowerCase("es");
    return text.includes(query.trim().toLocaleLowerCase("es"))
      && (!selectedSpecies || molecule.especie === selectedSpecies);
  }), [molecules, query, selectedSpecies]);

  return (
    <PublicShell>
      <section className="public-heading">
        <p>Repositorio científico · LIFFUC</p>
        <h1>{view === "species" ? "Especies" : "Catálogo de moléculas"}</h1>
        <span>{view === "species" ? "Explora las especies vinculadas a compuestos publicados." : "Consulta los compuestos publicados en LIFFUC-DB."}</span>
      </section>

      {view === "species" ? (
        loading ? <p className="public-state">Cargando especies…</p> : error ? <p className="public-state public-error">{error}</p> : (
          <div className="public-species-grid">
            {species.map((item) => (
              <button className="public-species-card" type="button" key={item.nombre} onClick={() => router.push(`/buscar?especie=${encodeURIComponent(item.nombre)}`)}>
                <span>Especie</span><strong>{item.nombre}</strong><small>{item.moleculas} molécula(s) publicadas</small>
              </button>
            ))}
            {!species.length && <p className="public-state">Aún no hay especies publicadas.</p>}
          </div>
        )
      ) : (
        <>
          <div className="public-controls">
            <label>
              <span className="public-visually-hidden">Buscar moléculas</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, código, fórmula o especie…" />
            </label>
            <label>
              <span className="public-visually-hidden">Filtrar por especie</span>
              <select value={selectedSpecies} onChange={(event) => setSelectedSpecies(event.target.value)}>
                <option value="">Todas las especies</option>
                {species.map((item) => <option key={item.nombre} value={item.nombre}>{item.nombre}</option>)}
              </select>
            </label>
            {selectedSpecies && <button type="button" className="public-reset" onClick={() => setSelectedSpecies("")}>Limpiar filtro</button>}
          </div>
          <p className="public-count">{loading ? "Cargando catálogo…" : `${visible.length} molécula(s) publicada(s)`}</p>
          {error ? <p className="public-state public-error">{error}</p> : (
            <div className="public-molecule-grid">
              {visible.map((molecule) => (
                <Link className="public-molecule-card" href={`/moleculas/${encodeURIComponent(molecule.codigo)}`} key={molecule.codigo}>
                  <span className="public-code">{molecule.codigo}</span>
                  <h2>{molecule.nombre}</h2>
                  <p>{molecule.especie}</p>
                  <div className="public-tags">
                    {molecule.formula && <span>{molecule.formula}</span>}
                    {molecule.familia && <span>{molecule.familia}</span>}
                  </div>
                  <small>Ver ficha <span aria-hidden="true">→</span></small>
                </Link>
              ))}
              {!loading && !visible.length && <p className="public-state">No se encontraron moléculas. Prueba otra búsqueda o filtro.</p>}
            </div>
          )}
        </>
      )}
    </PublicShell>
  );
}

export function PublicMoleculeDetail({ codigo }) {
  const [molecule, setMolecule] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/moleculas/${encodeURIComponent(codigo)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "No se pudo cargar la ficha.");
        if (payload.estado !== "PUBLICADA" || payload.codigo.startsWith("LFC-DEMO-")) {
          throw new Error("Esta molécula no está publicada.");
        }
        if (active) setMolecule(payload);
      })
      .catch((loadError) => { if (active) setError(loadError.message || "No se pudo cargar la ficha."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [codigo]);

  return (
    <PublicShell>
      <Link className="public-back" href="/buscar">← Volver al catálogo</Link>
      {loading ? <p className="public-state">Cargando ficha…</p> : error ? <p className="public-state public-error">{error}</p> : molecule && (
        <article className="public-detail">
          <p className="public-code">{molecule.codigo}</p>
          <h1>{molecule.nombre}</h1>
          <p className="public-detail-species">{molecule.especie}{molecule.familia ? ` · ${molecule.familia}` : ""}</p>
          <div className="public-detail-facts">
            {molecule.formula && <div><span>Fórmula molecular</span><strong>{molecule.formula}</strong></div>}
            {molecule.pesoMolecular && <div><span>Peso molecular</span><strong>{molecule.pesoMolecular} g/mol</strong></div>}
            {molecule.origen && <div><span>Procedencia</span><strong>{molecule.origen}</strong></div>}
            {molecule.updatedAt && <div><span>Actualizada</span><strong>{displayDate(molecule.updatedAt)}</strong></div>}
          </div>
          <div className="public-detail-section"><h2>Descripción</h2><p>{molecule.descripcion}</p></div>
          {molecule.actividad && <div className="public-detail-section"><h2>Actividad biológica</h2><p>{molecule.actividad}</p></div>}
          {molecule.metodoObtencion && <div className="public-detail-section"><h2>Método de obtención</h2><p>{molecule.metodoObtencion}</p></div>}
          {molecule.referencias && <div className="public-detail-section"><h2>Referencias</h2><p>{molecule.referencias}</p></div>}
        </article>
      )}
    </PublicShell>
  );
}
