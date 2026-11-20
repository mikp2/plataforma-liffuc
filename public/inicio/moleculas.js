const rows = document.getElementById("molecule-rows");
const message = document.getElementById("message");
const searchInput = document.getElementById("search");
const stateFilter = document.getElementById("state-filter");
const speciesFilter = document.getElementById("species-filter");
const sortSelect = document.getElementById("sort");
const resultCount = document.getElementById("result-count");
const demoNotice = document.getElementById("demo-notice");
const t = (value) => window.LIFFUC_I18n?.t(value) || value;
let molecules = [];
let canEditMolecules = false;
const requestedSpecies = new URLSearchParams(window.location.search).get("especie");

function showMessage(text, kind = "info") {
  message.textContent = text;
  message.dataset.kind = kind;
  message.hidden = !text;
}

function formatWeight(weight) {
  if (weight === null || weight === undefined) return "—";
  return `${new Intl.NumberFormat(window.LIFFUC_I18n?.locale || "es-CO", { maximumFractionDigits: 3 }).format(weight)} g/mol`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(window.LIFFUC_I18n?.locale || "es-CO", { dateStyle: "medium" }).format(date);
}

function textCell(text, className = "") {
  const cell = document.createElement("span");
  cell.textContent = text || "—";
  if (className) cell.className = className;
  return cell;
}

function refreshSpeciesFilter() {
  const selected = speciesFilter.value;
  const species = [...new Set(molecules.map((molecule) => molecule.especie).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, window.LIFFUC_I18n?.locale || "es-CO"));
  speciesFilter.replaceChildren(new Option(t("Todas las especies"), ""));
  for (const name of species) speciesFilter.add(new Option(name, name));
  if (species.includes(selected)) speciesFilter.value = selected;
  else if (species.includes(requestedSpecies)) speciesFilter.value = requestedSpecies;
}

function getVisibleMolecules() {
  const locale = window.LIFFUC_I18n?.locale || "es-CO";
  const query = searchInput.value.trim().toLocaleLowerCase(locale);
  const filtered = molecules.filter((molecule) => {
    const matchesText = !query || [
      molecule.codigo, molecule.nombre, molecule.formula, molecule.especie, molecule.familia,
    ].some((value) => String(value || "").toLocaleLowerCase(locale).includes(query));
    return matchesText
      && (!stateFilter.value || molecule.estado === stateFilter.value)
      && (!speciesFilter.value || molecule.especie === speciesFilter.value);
  });

  const [sortBy, direction] = sortSelect.value.split("-");
  filtered.sort((left, right) => {
    let comparison = 0;
    if (sortBy === "updated") comparison = new Date(left.updatedAt) - new Date(right.updatedAt);
    if (sortBy === "name") comparison = left.nombre.localeCompare(right.nombre, locale);
    if (sortBy === "code") comparison = left.codigo.localeCompare(right.codigo, locale);
    if (sortBy === "weight") comparison = (left.pesoMolecular ?? Infinity) - (right.pesoMolecular ?? Infinity);
    return direction === "desc" ? -comparison : comparison;
  });
  return filtered;
}

function render() {
  const visible = getVisibleMolecules();
  rows.replaceChildren();
  resultCount.textContent = `${visible.length} / ${molecules.length} ${t("Moléculas")}`;
  demoNotice.hidden = !molecules.some((molecule) => molecule.codigo.startsWith("LFC-DEMO-"));

  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const title = document.createElement("strong");
    title.textContent = t(molecules.length ? "No encontramos moléculas con esos criterios" : "El catálogo está vacío");
    const description = document.createElement("span");
    description.textContent = molecules.length
      ? t("Prueba con otra búsqueda o ajusta los filtros seleccionados.")
      : t("Cuando se registren moléculas, aparecerán aquí.");
    empty.append(title, description);
    rows.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const molecule of visible) {
    const card = document.createElement("article");
    card.className = "molecule-card";
    const top = document.createElement("div");
    top.className = "card-top";
    top.append(textCell(molecule.codigo, "molecule-code"));
    const badge = document.createElement("span");
    badge.className = "status";
    badge.dataset.state = molecule.estado;
    badge.textContent = {
      BORRADOR: t("Borrador"),
      EN_REVISION: t("En revisión"),
      APROBADA: t("Aprobada"),
      PUBLICADA: t("Publicada"),
    }[molecule.estado] || molecule.estado;
    top.append(badge);

    const main = document.createElement("div");
    main.className = "card-main";
    const copy = document.createElement("div");
    copy.className = "card-copy";
    copy.append(
      textCell(molecule.nombre, "molecule-name"),
      textCell(molecule.especie, "molecule-species"),
      textCell(molecule.formula || formatWeight(molecule.pesoMolecular), "molecule-formula"),
    );
    main.append(copy);
    const image = (molecule.archivos || []).find((file) => file.tipo === "IMAGEN" && file.url);
    if (image) {
      const thumbnail = document.createElement("img");
      thumbnail.className = "molecule-image";
      thumbnail.src = image.url;
      thumbnail.alt = `${t("Imagen de")} ${molecule.nombre}`;
      thumbnail.loading = "lazy";
      main.append(thumbnail);
    }

    const tags = document.createElement("div");
    tags.className = "tag-list";
    if (molecule.familia) {
      const family = textCell(molecule.familia, "tag");
      family.title = molecule.familia;
      tags.append(family);
    }
    if (molecule.actividad) {
      const activity = textCell(molecule.actividad, "tag tag--activity");
      activity.title = molecule.actividad;
      tags.append(activity);
    }
    if (molecule.origen && !molecule.familia && !molecule.actividad) {
      const origin = textCell(molecule.origen, "tag");
      origin.title = molecule.origen;
      tags.append(origin);
    }

    const footer = document.createElement("div");
    footer.className = "card-footer";
    footer.append(textCell(`${t("Actualizado")} ${formatDate(molecule.updatedAt)}`, "card-updated"));
    const actions = document.createElement("div");
    actions.className = "card-actions";
    const detailButton = document.createElement("button");
    detailButton.className = "card-action";
    detailButton.type = "button";
    detailButton.textContent = t("Ver ficha");
    detailButton.setAttribute("aria-label", `${t("Ver ficha")} · ${molecule.nombre}`);
    detailButton.addEventListener("click", () => openDetails(molecule));
    if (canEditMolecules) {
      const link = document.createElement("a");
      link.className = "card-action card-action--edit";
      link.href = `/panel/moleculas/${encodeURIComponent(molecule.codigo)}/editar`;
      link.textContent = t("Editar");
      link.setAttribute("aria-label", `${t("Editar")} ${molecule.nombre}`);
      actions.append(detailButton, link);
    } else {
      actions.append(detailButton);
    }
    footer.append(actions);
    card.append(top, main);
    if (tags.childElementCount) card.append(tags);
    card.append(footer);
    fragment.append(card);
  }
  rows.append(fragment);
}

function addDetailItem(container, label, value, wide = false) {
  if (!value) return;
  const item = document.createElement("section");
  item.className = wide ? "detail-item detail-item--wide" : "detail-item";
  const heading = document.createElement("p");
  heading.className = "detail-label";
  heading.textContent = label;
  const content = document.createElement("p");
  content.className = "detail-value";
  content.textContent = value;
  item.append(heading, content);
  container.append(item);
}

function openDetails(molecule) {
  const dialog = document.getElementById("molecule-detail");
  const content = document.getElementById("detail-content");
  document.getElementById("detail-code").textContent = molecule.codigo || "";
  document.getElementById("detail-title").textContent = molecule.nombre || t("Ficha de molécula");
  const editLink = document.getElementById("detail-edit");
  editLink.href = `/panel/moleculas/${encodeURIComponent(molecule.codigo)}/editar`;
  editLink.hidden = !canEditMolecules;
  content.replaceChildren();

  addDetailItem(content, t("Estado"), {
    BORRADOR: t("Borrador"),
    EN_REVISION: t("En revisión"),
    APROBADA: t("Aprobada"),
    PUBLICADA: t("Publicada"),
  }[molecule.estado] || molecule.estado);
  addDetailItem(content, t("Fórmula molecular"), molecule.formula);
  addDetailItem(content, t("Peso molecular"), formatWeight(molecule.pesoMolecular));
  addDetailItem(content, t("Especie"), molecule.especie);
  addDetailItem(content, t("Familia química"), molecule.familia);
  addDetailItem(content, t("Procedencia"), molecule.origen);
  addDetailItem(content, t("Descripción"), molecule.descripcion, true);
  addDetailItem(content, t("Actividad biológica"), molecule.actividad, true);
  addDetailItem(content, t("Método de obtención"), molecule.metodoObtencion, true);
  addDetailItem(content, t("Referencias"), molecule.referencias, true);

  if (molecule.archivos?.length) {
    const item = document.createElement("section");
    item.className = "detail-item detail-item--wide";
    const heading = document.createElement("p");
    heading.className = "detail-label";
    heading.textContent = t("Archivos asociados");
    const files = document.createElement("div");
    files.className = "detail-files";
    for (const file of molecule.archivos) {
      const link = document.createElement("a");
      link.className = "detail-file";
      link.href = file.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `${file.tipo === "PDF" ? "PDF" : t("Imagen")} · ${file.nombre}`;
      files.append(link);
    }
    item.append(heading, files);
    content.append(item);
  }

  dialog.showModal();
}

async function loadMolecules() {
  showMessage(t("Cargando catálogo…"));
  const refreshButton = document.getElementById("refresh");
  refreshButton.disabled = true;
  rows.setAttribute("aria-busy", "true");
  try {
    const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
    if (!sessionResponse.ok) throw new Error("No se pudo verificar la sesión.");
    const session = await sessionResponse.json();
    if (!session?.user) {
      window.location.replace("/login");
      return;
    }
    const role = session.user.role;
    canEditMolecules = role === "ADMIN" || role === "INVESTIGADOR";
    document.getElementById("account-name").textContent = session.user.name || "Usuario";
    document.getElementById("account-email").textContent = session.user.email || "";
    document.getElementById("account-footer").hidden = false;
    document.querySelector('a[href="/panel/moleculas/nueva"]').hidden = !canEditMolecules;

    const response = await fetch("/api/moleculas", { cache: "no-store" });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error("El servidor devolvió una respuesta no válida.");
    }
    if (response.status === 401) {
      window.location.replace("/login");
      return;
    }
    if (!response.ok) throw new Error(payload.message || "No se pudo cargar el catálogo.");
    if (!Array.isArray(payload.moleculas)) throw new Error("La respuesta del catálogo no tiene el formato esperado.");
    molecules = payload.moleculas;
    refreshSpeciesFilter();
    render();
    showMessage(molecules.length ? "" : t("El catálogo aún no tiene registros."));
  } catch (error) {
    showMessage(error.message || "No se pudo cargar el catálogo.", "error");
    rows.replaceChildren();
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const title = document.createElement("strong");
    title.textContent = t("No se pudo cargar el catálogo");
    const description = document.createElement("span");
    description.textContent = error.message || t("Intenta actualizar la página.");
    empty.append(title, description);
    rows.append(empty);
  } finally {
    rows.setAttribute("aria-busy", "false");
    refreshButton.disabled = false;
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
document.addEventListener("liffuc-language-change", () => {
  refreshSpeciesFilter();
  render();
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
    showMessage(error.message || "No se pudo cerrar la sesión.", "error");
  }
});

const detailDialog = document.getElementById("molecule-detail");
document.getElementById("close-detail").addEventListener("click", () => detailDialog.close());
document.getElementById("close-detail-footer").addEventListener("click", () => detailDialog.close());
detailDialog.addEventListener("click", (event) => {
  if (event.target === detailDialog) detailDialog.close();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.target.matches("input, textarea, select")) {
    event.preventDefault();
    searchInput.focus();
  }
});

loadMolecules();
