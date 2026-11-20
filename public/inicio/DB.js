const notice = document.getElementById("notice");
const rows = document.getElementById("molecule-rows");
const search = document.getElementById("search");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");
const t = (value) => window.LIFFUC_I18n?.t(value) || value;
let molecules = [];

function setNotice(message, kind = "info") {
  notice.textContent = message;
  notice.dataset.kind = kind;
}

function getField(record, names) {
  for (const name of names) {
    if (record[name] !== undefined && record[name] !== null) return record[name];
  }
  return "";
}

function getSpecies(record) {
  const species = getField(record, ["especie", "species"]);
  if (typeof species === "string") return species;
  if (species && typeof species === "object") {
    return getField(species, ["nombreCientifico", "nombre", "name"]);
  }
  return "";
}

function normalizeMolecule(record) {
  return {
    code: String(getField(record, ["codigo", "code", "id"]) || "—"),
    name: String(getField(record, ["nombre", "nombreCompuesto", "name", "compuesto"]) || t("Sin nombre")),
    species: String(getSpecies(record) || t("Sin especie")),
    status: String(getField(record, ["estado", "status"]) || "Sin estado"),
    updated: getField(record, ["updatedAt", "fechaActualizacion", "createdAt"]),
  };
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : new Intl.DateTimeFormat(window.LIFFUC_I18n?.locale || "es-CO", { dateStyle: "medium" }).format(date);
}

function statusLabel(status) {
  const labels = {
    BORRADOR: "Borrador",
    EN_REVISION: "En revisión",
    APROBADA: "Aprobada",
    PUBLICADA: "Publicada",
  };
  return t(labels[status] || status || "Sin estado");
}

function makeCell(value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = value;
  if (className) cell.className = className;
  return cell;
}

function renderMolecules() {
  const locale = window.LIFFUC_I18n?.locale || "es-CO";
  const query = search.value.trim().toLocaleLowerCase(locale);
  const visible = molecules
    .map(normalizeMolecule)
    .filter((molecule) =>
      `${molecule.code} ${molecule.name} ${molecule.species} ${molecule.status}`
        .toLocaleLowerCase(locale)
        .includes(query),
    );

  rows.replaceChildren();

  if (visible.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "empty";
    cell.colSpan = 5;
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    title.textContent = t(molecules.length === 0 ? "Aún no hay moléculas registradas" : "No se encontraron resultados");
    detail.textContent = molecules.length === 0
      ? t("Cuando existan registros, aparecerán en este catálogo.")
      : t("Prueba con otro término de búsqueda.");
    cell.append(title, detail);
    row.append(cell);
    rows.append(row);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const molecule of visible) {
    const row = document.createElement("tr");
    row.append(
      makeCell(molecule.code, "code"),
      makeCell(molecule.name, "molecule-name"),
      makeCell(molecule.species, "species"),
    );
    const statusCell = document.createElement("td");
    const status = document.createElement("span");
    status.className = "status-pill";
    status.textContent = statusLabel(molecule.status);
    statusCell.append(status);
    row.append(statusCell, makeCell(formatDate(molecule.updated)));
    fragment.append(row);
  }
  rows.append(fragment);
}

function updateStats() {
  const normalized = molecules.map(normalizeMolecule);
  const species = new Set(
    normalized
      .map((molecule) => molecule.species)
      .filter((name) => name && name !== "Sin especie"),
  );
  const pending = molecules.filter((molecule) =>
    ["EN_REVISION", "PENDING", "PENDING_REVIEW"].includes(String(getField(molecule, ["estado", "status"])).toUpperCase()),
  );
  document.getElementById("molecule-count").textContent = String(molecules.length);
  document.getElementById("species-count").textContent = String(species.size);
  document.getElementById("pending-count").textContent = String(pending.length);
}

async function loadMolecules() {
  setNotice(t("Cargando registros de moléculas…"));
  const response = await fetch("/api/moleculas", { cache: "no-store" });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("La respuesta del servicio de moléculas no es JSON válido.");
  }

  if (!response.ok) {
    throw new Error(payload?.message || `El servicio respondió con error (${response.status}).`);
  }

  const result = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.moleculas)
      ? payload.moleculas
      : Array.isArray(payload?.data)
        ? payload.data
        : null;
  if (!result) {
    throw new Error("El servicio todavía no entrega una lista de moléculas.");
  }

  molecules = result;
  updateStats();
  renderMolecules();
  setNotice(result.length ? `${result.length} ${t("registro(s) cargados.")}` : t("El banco no tiene moléculas registradas todavía."));
}

async function initialize() {
  try {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo verificar la sesión.");
    const session = await response.json();
    if (!session?.user) {
      window.location.replace("/login");
      return;
    }

    document.getElementById("user-name").textContent = session.user.name || "Usuario";
    document.getElementById("user-email").textContent = session.user.email || "";
    const isAdmin = session.user.role === "ADMIN";
    const canReviewMolecules = isAdmin || session.user.role === "INVESTIGADOR";
    const canEditMolecules = canReviewMolecules;
    document.getElementById("stats").classList.toggle("stats--visitor", session.user.role === "VISITANTE");
    document.getElementById("pending-review-card").hidden = !canReviewMolecules;
    document.getElementById("sidebar-bottom").hidden = false;
    document.getElementById("user-name").hidden = false;
    document.getElementById("user-email").hidden = false;
    document.getElementById("signout").hidden = false;
    for (const link of document.querySelectorAll('a[href="/panel/aprobaciones"], a[href="/panel/usuarios"]')) {
      if (!isAdmin) link.closest("li").hidden = true;
    }
    for (const link of document.querySelectorAll('a[href="/panel/moleculas/nueva"]')) {
      if (!canEditMolecules) link.hidden = true;
    }
    await loadMolecules();
  } catch (error) {
    setNotice(error.message || t("No se pudo cargar el panel."), "error");
    rows.replaceChildren();
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "empty";
    cell.colSpan = 5;
    cell.textContent = error.message || t("No se pudo cargar el catálogo.");
    row.append(cell);
    rows.append(row);
  }
}

document.getElementById("back-button").addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.replace("/login");
  }
});

document.getElementById("refresh").addEventListener("click", () => {
  loadMolecules().catch((error) => setNotice(error.message, "error"));
});

document.getElementById("signout").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const csrfResponse = await fetch("/api/auth/csrf", { cache: "no-store" });
    if (!csrfResponse.ok) throw new Error("No se pudo iniciar el cierre de sesión.");
    const { csrfToken } = await csrfResponse.json();
    const signoutResponse = await fetch("/api/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken, callbackUrl: "/login" }),
    });
    if (!signoutResponse.ok) throw new Error("No se pudo cerrar la sesión.");
    window.location.replace("/login");
  } catch (error) {
    button.disabled = false;
    setNotice(error.message || "No se pudo cerrar la sesión.", "error");
  }
});

search.addEventListener("input", renderMolecules);
menuToggle.addEventListener("click", () => {
  const isOpen = sidebar.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("liffuc-language-change", () => {
  renderMolecules();
  updateStats();
});

initialize();
