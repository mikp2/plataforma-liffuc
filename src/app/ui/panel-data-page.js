"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const stateLabels = {
  BORRADOR: "Borrador",
  EN_REVISION: "En revisión",
  APROBADA: "Aprobada",
  PUBLICADA: "Publicada",
};

const pageConfig = {
  especies: {
    title: "Especies",
    description: "Especies registradas a partir de las moléculas del banco.",
    endpoint: "/api/moleculas",
  },
  aprobaciones: {
    title: "Aprobaciones",
    description: "Revisa las moléculas pendientes y aprueba los registros listos.",
    endpoint: "/api/moleculas?estado=EN_REVISION",
  },
  historial: {
    title: "Actividad reciente",
    description: "Consulta las fechas de registro y última actualización disponibles.",
    endpoint: "/api/moleculas",
  },
  estadisticas: {
    title: "Estadísticas",
    description: "Resumen de los registros disponibles en LIFFUC-DB.",
    endpoint: "/api/moleculas",
  },
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function usePageData(view) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const config = pageConfig[view];
    setLoading(true);
    setError("");
    try {
      const response = await fetch(config.endpoint, { cache: "no-store" });
      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error("El servidor devolvió una respuesta no válida.");
      }
      if (response.status === 401) {
        router.replace("/login");
        return;
      }
      if (!response.ok) throw new Error(payload.message || "No se pudo cargar la información.");
      if (view === "especies") {
        const speciesMap = new Map();
        for (const molecule of payload.moleculas || []) {
          const item = speciesMap.get(molecule.especie) || { nombre: molecule.especie, moleculas: 0, updatedAt: molecule.updatedAt };
          item.moleculas += 1;
          if (new Date(molecule.updatedAt) > new Date(item.updatedAt)) item.updatedAt = molecule.updatedAt;
          speciesMap.set(molecule.especie, item);
        }
        setData({ especies: [...speciesMap.values()] });
      } else if (view === "estadisticas") {
        const molecules = payload.moleculas || [];
        const statusCounts = new Map();
        const speciesCounts = new Map();
        for (const molecule of molecules) {
          statusCounts.set(molecule.estado, (statusCounts.get(molecule.estado) || 0) + 1);
          speciesCounts.set(molecule.especie, (speciesCounts.get(molecule.especie) || 0) + 1);
        }
        setData({
          total: molecules.length,
          especies: speciesCounts.size,
          estados: [...statusCounts].map(([estado, cantidad]) => ({ estado, cantidad })),
          especiesFrecuentes: [...speciesCounts].map(([nombre, cantidad]) => ({ nombre, cantidad })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 8),
        });
      } else if (view === "historial") {
        setData({ registros: payload.moleculas || [] });
      } else {
        setData(payload);
      }
    } catch (loadError) {
      setError(loadError.message || "No se pudo cargar la información.");
    } finally {
      setLoading(false);
    }
  }, [view, router]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return { data, error, loading, reload: load, setError };
}

function PageHeader({ config, reload, loading }) {
  return (
    <header className="workspace-header">
      <div>
        <p className="workspace-breadcrumb"><Link href="/inicio/DB.html">LIFFUC-DB</Link> / Panel de trabajo</p>
        <h1>{config.title}</h1>
        <p className="workspace-description">{config.description}</p>
      </div>
      <button className="workspace-button workspace-button--quiet" type="button" onClick={reload} disabled={loading}>
        Actualizar
      </button>
    </header>
  );
}

function Message({ children, error }) {
  if (!children) return null;
  return <p className={`workspace-message${error ? " is-error" : ""}`} role={error ? "alert" : "status"}>{children}</p>;
}

function SpeciesView({ data }) {
  const species = data?.especies || [];
  if (!species.length) return <p className="workspace-empty">Aún no hay especies asociadas a moléculas.</p>;
  return (
    <div className="workspace-grid">
      {species.map((item) => (
        <Link
          className="workspace-card species-card"
          href={`/panel/moleculas?especie=${encodeURIComponent(item.nombre)}`}
          key={item.nombre}
        >
          <span className="workspace-card-label">Especie</span>
          <h2>{item.nombre}</h2>
          <span className="species-count">{item.moleculas} molécula(s)</span>
          <span className="workspace-card-date">Actualizada {formatDate(item.updatedAt)}</span>
        </Link>
      ))}
    </div>
  );
}

function ApprovalView({ molecules, onApprove, busyCode }) {
  return (
    <section className="approval-section">
      <div className="approval-heading"><h2>Moléculas por revisar</h2><span>{molecules.length}</span></div>
      {!molecules.length ? <p className="workspace-empty">No hay moléculas pendientes de revisión.</p> : (
        <div className="workspace-list">
          {molecules.map((molecule) => (
            <article className="workspace-card approval-row" key={molecule.codigo}>
              <div className="workspace-record">
                <span className="workspace-record-code">{molecule.codigo}</span>
                <h2>{molecule.nombre}</h2>
                <p>{molecule.especie}{molecule.formula ? ` · ${molecule.formula}` : ""}</p>
              </div>
              <div className="approval-actions">
                <Link className="workspace-button workspace-button--quiet" href={`/panel/moleculas/${encodeURIComponent(molecule.codigo)}/editar`}>Revisar</Link>
                <button
                  className="workspace-button workspace-button--primary"
                  type="button"
                  disabled={busyCode === molecule.codigo}
                  onClick={() => onApprove(molecule.codigo)}
                >
                  {busyCode === molecule.codigo ? "Aprobando…" : "Aprobar"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="workspace-note">Las solicitudes de acceso aún no se guardan en la base de datos.</p>
    </section>
  );
}

function HistoryView({ records }) {
  if (!records.length) return <p className="workspace-empty">Aún no hay moléculas registradas.</p>;
  return (
    <>
      <p className="workspace-note">Este resumen muestra fechas actuales de creación y actualización; no hay un registro histórico de cada cambio.</p>
      <div className="workspace-list">
        {records.map((record) => (
          <article className="workspace-card history-row" key={record.codigo}>
            <div className="history-indicator" aria-hidden="true" />
            <div className="workspace-record">
              <span className="workspace-record-code">{record.codigo}</span>
              <h2><Link href={`/panel/moleculas/${encodeURIComponent(record.codigo)}`}>{record.nombre}</Link></h2>
              <p>Estado: {stateLabels[record.estado] || record.estado}</p>
            </div>
            <div className="history-dates">
              <span>Creada {formatDate(record.createdAt)}</span>
              <span>Actualizada {formatDate(record.updatedAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function StatisticsView({ data }) {
  const statusCounts = data?.estados || [];
  const species = data?.especiesFrecuentes || [];
  const maxSpecies = Math.max(1, ...species.map((item) => item.cantidad));
  return (
    <>
      <div className="workspace-stats">
        <article className="workspace-card stat-card"><span>Moléculas</span><strong>{data?.total ?? 0}</strong></article>
        <article className="workspace-card stat-card"><span>Especies registradas</span><strong>{data?.especies ?? 0}</strong></article>
        <article className="workspace-card stat-card"><span>Pendientes de revisión</span><strong>{statusCounts.find((item) => item.estado === "EN_REVISION")?.cantidad ?? 0}</strong></article>
      </div>
      <div className="workspace-columns">
        <section className="workspace-card stats-section">
          <h2>Registros por estado</h2>
          {statusCounts.length
            ? statusCounts.map((item) => (
              <div className="status-stat" key={item.estado}>
                <span>{stateLabels[item.estado] || item.estado}</span>
                <strong>{item.cantidad}</strong>
                <div className="stat-track"><i style={{ width: `${data.total ? (item.cantidad / data.total) * 100 : 0}%` }} /></div>
              </div>
            ))
            : <p className="workspace-empty">Aún no hay registros.</p>}
        </section>
        <section className="workspace-card stats-section">
          <h2>Especies con más registros</h2>
          {species.length
            ? species.map((item) => (
              <div className="species-stat" key={item.nombre}>
                <span>{item.nombre}</span>
                <div className="stat-track"><i style={{ width: `${(item.cantidad / maxSpecies) * 100}%` }} /></div>
                <strong>{item.cantidad}</strong>
              </div>
            ))
            : <p className="workspace-empty">Aún no hay especies registradas.</p>}
        </section>
      </div>
    </>
  );
}

export default function PanelDataPage({ view }) {
  const config = pageConfig[view];
  const { data, error, loading, reload, setError } = usePageData(view);
  const [busyCode, setBusyCode] = useState("");
  const molecules = useMemo(() => data?.moleculas || [], [data]);
  const records = data?.registros || [];

  async function approveMolecule(codigo) {
    setBusyCode(codigo);
    setError("");
    try {
      const response = await fetch(`/api/moleculas/${encodeURIComponent(codigo)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "APROBADA" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "No se pudo aprobar la molécula.");
      await reload();
    } catch (approveError) {
      setError(approveError.message || "No se pudo aprobar la molécula.");
    } finally {
      setBusyCode("");
    }
  }

  return (
    <main className="workspace-page">
      <PageHeader config={config} reload={reload} loading={loading} />
      <Message error={Boolean(error)}>{error || (loading ? "Cargando información…" : "")}</Message>
      {!loading && !error && view === "especies" && <SpeciesView data={data} />}
      {!loading && !error && view === "aprobaciones" && (
        <ApprovalView
          molecules={molecules}
          onApprove={approveMolecule}
          busyCode={busyCode}
        />
      )}
      {!loading && !error && view === "historial" && <HistoryView records={records} />}
      {!loading && !error && view === "estadisticas" && <StatisticsView data={data} />}
    </main>
  );
}
