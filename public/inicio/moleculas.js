const rows = document.getElementById("molecule-rows");
const message = document.getElementById("message");
const searchInput = document.getElementById("search");
const stateFilter = document.getElementById("state-filter");
const speciesFilter = document.getElementById("species-filter");
const sortSelect = document.getElementById("sort");
const resultCount = document.getElementById("result-count");
const demoNotice = document.getElementById("demo-notice");
let molecules = [];

function showMessage(text, kind = "info") {
  message.textContent = text;
  message.dataset.kind = kind;
  message.hidden = !text;
}

function formatWeight(weight) {
  if (weight === null || weight === undefined) return "—";
  return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 3 }).format(weight)} g/mol`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(date);
}

function textCell(text, className = "") {
  const cell = document.createElement("td");
  cell.textContent = text || "—";
  if (className) cell.className = className;
  return cell;
}

function refreshSpeciesFilter() {
  const selected = speciesFilter.value;
  const species = [...new Set(molecules.map((molecule) => molecule.especie).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "es"));
  speciesFilter.replaceChildren(new Option("Todas las especies", ""));
  for (const name of species) speciesFilter.add(new Option(name, name));
  if (species.includes(selected)) speciesFilter.value = selected;
}

function getVisibleMolecules() {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const filtered = molecules.filter((molecule) => {
    const matchesText = !query || [
      molecule.codigo, molecule.nombre, molecule.formula, molecule.especie, molecule.familia,
    ].some((value) => String(value || "").toLocaleLowerCase("es").includes(query));
    return matchesText
      && (!stateFilter.value || molecule.estado === stateFilter.value)
      && (!speciesFilter.value || molecule.especie === speciesFilter.value);
  });

  const [sortBy, direction] = sortSelect.value.split("-");
  filtered.sort((left, right) => {
    let comparison = 0;
    if (sortBy === "updated") comparison = new Date(left.updatedAt) - new Date(right.updatedAt);
    if (sortBy === "name") comparison = left.nombre.localeCompare(right.nombre, "es");
    if (sortBy === "code") comparison = left.codigo.localeCompare(right.codigo, "es");
    if (sortBy === "weight") comparison = (left.pesoMolecular ?? Infinity) - (right.pesoMolecular ?? Infinity);
    return direction === "desc" ? -comparison : comparison;
  });
  return filtered;
}

function render() {
  const visible = getVisibleMolecules();
  rows.replaceChildren();
  resultCount.textContent = `${visible.length} de ${molecules.length} molécula(s)`;
  demoNotice.hidden = !molecules.some((molecule) => molecule.codigo.startsWith("LFC-DEMO-"));

  if (!visible.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "empty";
    cell.colSpan = 8;
    const title = document.createElement("strong");
    title.textContent = molecules.length ? "No hay resultados para estos filtros" : "El catálogo está vacío";
    cell.append(title, document.createTextNode(molecules.length ? "Prueba con otros criterios o limpia los filtros." : "Agrega una molécula o carga los datos de demostración."));
    row.append(cell);
    rows.append(row);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const molecule of visible) {
    const row = document.createElement("tr");
    row.append(
      textCell(molecule.codigo, "code"),
      textCell(molecule.nombre, "name"),
      textCell(molecule.formula),
      textCell(molecule.especie),
      textCell(formatWeight(molecule.pesoMolecular)),
    );
    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "status";
    badge.dataset.state = molecule.estado;
    badge.textContent = {
      BORRADOR: "Borrador",
      EN_REVISION: "En revisión",
      APROBADA: "Aprobada",
      PUBLICADA: "Publicada",
    }[molecule.estado] || molecule.estado;
    statusCell.append(badge);
    row.append(statusCell, textCell(formatDate(molecule.updatedAt)));
    const actionCell = document.createElement("td");
    const link = document.createElement("a");
    link.className = "edit-link";
    link.href = `/panel/moleculas/${encodeURIComponent(molecule.codigo)}/editar`;
    link.textContent = "Editar";
    actionCell.append(link);
    row.append(actionCell);
    fragment.append(row);
  }
  rows.append(fragment);
}

async function loadMolecules() {
  showMessage("Cargando catálogo…");
  document.getElementById("refresh").disabled = true;
  try {
    const response = await fetch("/api/moleculas", { cache: "no-store" });
    const payload = await response.json();
    if (response.status === 401) {
      window.location.replace("/login");
      return;
    }
    if (!response.ok) throw new Error(payload.message || "No se pudo cargar el catálogo.");
    if (!Array.isArray(payload.moleculas)) throw new Error("La respuesta del catálogo no tiene el formato esperado.");
    molecules = payload.moleculas;
    refreshSpeciesFilter();
    render();
    showMessage(molecules.length ? "" : "El catálogo aún no tiene registros.");
  } catch (error) {
    showMessage(error.message || "No se pudo cargar el catálogo.", "error");
  } finally {
    document.getElementById("refresh").disabled = false;
  }
}

for (const control of [searchInput, stateFilter, speciesFilter, sortSelect]) {
  control.addEventListener("input", render);
  control.addEventListener("change", render);
}
document.getElementById("clear").addEventListener("click", () => {
  searchInput.value = "";
  stateFilter.value = "";
  speciesFilter.value = "";
  sortSelect.value = "updated-desc";
  render();
});
document.getElementById("refresh").addEventListener("click", loadMolecules);

loadMolecules();
