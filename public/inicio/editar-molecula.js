const params = new URLSearchParams(window.location.search);
let codigo = params.get("codigo");
let isNew = params.get("new") === "1" || !codigo;
const form = document.getElementById("molecule-form");
const message = document.getElementById("message");
const saveButton = document.getElementById("save");
const attachmentsCard = document.getElementById("attachments-card");
const fileList = document.getElementById("file-list");
const t = (value) => window.LIFFUC_I18n?.t(value) || value;
let currentUserRole = "";

const editableFields = [
  "codigo",
  "nombre",
  "formula",
  "pesoMolecular",
  "especie",
  "familia",
  "origen",
  "estado",
  "descripcion",
  "actividad",
  "metodoObtencion",
  "referencias",
];

function showMessage(text, kind = "info") {
  message.textContent = text;
  message.dataset.kind = kind;
  message.hidden = !text;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  let payload = {};
  try {
    payload = await response.json();
  } catch {
    throw new Error(t("El servidor devolvió una respuesta no válida."));
  }
  if (response.status === 401) {
    window.location.replace("/login");
    throw new Error(t("La sesión expiró. Inicia sesión nuevamente."));
  }
  if (!response.ok) throw new Error(payload.message || t("No se pudo completar la operación."));
  return payload;
}

function fillForm(molecule) {
  for (const field of editableFields) {
    const input = form.elements.namedItem(field);
    if (input) input.value = molecule[field] ?? "";
  }
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderAttachments(files) {
  fileList.replaceChildren();
  attachmentsCard.hidden = files.length === 0;

  for (const file of files) {
    const card = document.createElement("article");
    card.className = "file-card";
    const preview = document.createElement("a");
    preview.className = "file-preview";
    preview.href = file.url;
    preview.target = "_blank";
    preview.rel = "noopener noreferrer";
    preview.setAttribute("aria-label", `${t("Abrir")} ${file.nombre}`);

    if (file.tipo === "IMAGEN") {
      const image = document.createElement("img");
      image.src = file.url;
      image.alt = file.nombre;
      preview.append(image);
    } else {
      preview.textContent = t("Abrir documento PDF");
    }

    const info = document.createElement("div");
    info.className = "file-info";
    const name = document.createElement("span");
    name.className = "file-name";
    name.title = file.nombre;
    name.textContent = file.nombre;
    const actions = document.createElement("div");
    actions.className = "file-actions";
    const open = document.createElement("a");
    open.href = file.url;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.textContent = `${t("Abrir")} · ${formatSize(file.tamano)}`;
    const remove = document.createElement("button");
    remove.className = "remove-file";
    remove.type = "button";
    remove.textContent = t("Eliminar");
    remove.addEventListener("click", () => deleteAttachment(file));
    actions.append(open, remove);
    info.append(name, actions);
    card.append(preview, info);
    fileList.append(card);
  }
}

async function loadMolecule() {
  if (isNew) return;
  showMessage(t("Cargando la información registrada…"));
  try {
    const molecule = await requestJson(`/api/moleculas/${encodeURIComponent(codigo)}`, { cache: "no-store" });
    fillForm(molecule);
    if (currentUserRole === "INVESTIGADOR") {
      form.elements.namedItem("estado").value = "EN_REVISION";
    }
    renderAttachments(molecule.archivos || []);
    document.getElementById("page-title").textContent = t("Editar molécula");
    document.getElementById("breadcrumb").textContent = molecule.codigo;
    document.title = `Editar ${molecule.nombre} | LIFFUC-DB`;
    showMessage("");
  } catch (error) {
    showMessage(error.message || t("No se pudo cargar la molécula."), "error");
    form.querySelectorAll("input, select, textarea, button[type=submit]").forEach((input) => { input.disabled = true; });
  }
}

async function deleteAttachment(file) {
  if (!window.confirm(`${t("¿Eliminar")} "${file.nombre}" ${t("de esta molécula?")}`)) return;
  try {
    await requestJson(`/api/moleculas/${encodeURIComponent(codigo)}/archivos/${encodeURIComponent(file.id)}`, {
      method: "DELETE",
    });
    const molecule = await requestJson(`/api/moleculas/${encodeURIComponent(codigo)}`, { cache: "no-store" });
    renderAttachments(molecule.archivos || []);
    showMessage(t("Archivo eliminado."));
  } catch (error) {
    showMessage(error.message || t("No se pudo eliminar el archivo."), "error");
  }
}

function buildPayload() {
  const payload = Object.fromEntries(
    editableFields.map((field) => [field, form.elements.namedItem(field).value]),
  );
  const weight = form.elements.namedItem("pesoMolecular");
  payload.pesoMolecular = weight.value ? weight.valueAsNumber : null;
  for (const field of ["formula", "familia", "origen", "actividad", "metodoObtencion", "referencias"]) {
    payload[field] = payload[field].trim() || null;
  }
  for (const field of ["codigo", "nombre", "especie", "descripcion"]) {
    payload[field] = payload[field].trim();
  }
  return payload;
}

async function uploadSelectedFiles(targetCode) {
  const selected = document.getElementById("files").files;
  if (!selected.length) return;
  const body = new FormData();
  for (const file of selected) body.append("files", file);
  await requestJson(`/api/moleculas/${encodeURIComponent(targetCode)}/archivos`, {
    method: "POST",
    body,
  });
  document.getElementById("files").value = "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  saveButton.disabled = true;
  showMessage(t("Guardar información…"));
  try {
    const payload = buildPayload();
    const saved = await requestJson(
      isNew ? "/api/moleculas" : `/api/moleculas/${encodeURIComponent(codigo)}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    codigo = saved.codigo;
    isNew = false;
    document.getElementById("page-title").textContent = t("Editar molécula");
    document.getElementById("breadcrumb").textContent = saved.codigo;
    fillForm(saved);
    await uploadSelectedFiles(codigo);
    const refreshed = await requestJson(`/api/moleculas/${encodeURIComponent(codigo)}`, { cache: "no-store" });
    renderAttachments(refreshed.archivos || []);
    showMessage(t("Los datos y archivos se guardaron correctamente."));
    if (params.get("new") === "1" || params.get("codigo") !== codigo) {
      window.top.location.assign(`/panel/moleculas/${encodeURIComponent(codigo)}/editar`);
    }
  } catch (error) {
    showMessage(error.message || t("No se pudo guardar la molécula."), "error");
  } finally {
    saveButton.disabled = false;
  }
});

async function initialize() {
  try {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    if (!response.ok) throw new Error(t("No se pudo verificar la sesión."));
    const session = await response.json();
    if (!session?.user) {
      window.location.replace("/login");
      return;
    }
    if (!["ADMIN", "INVESTIGADOR"].includes(session.user.role)) {
      window.location.replace("/panel/moleculas");
      return;
    }

    currentUserRole = session.user.role;
    if (session.user.role === "INVESTIGADOR") {
      const status = form.elements.namedItem("estado");
      status.value = "EN_REVISION";
      status.disabled = true;
    }
    await loadMolecule();
  } catch (error) {
    showMessage(error.message || t("No se pudo verificar la sesión."), "error");
    form.querySelectorAll("input, select, textarea, button").forEach((input) => { input.disabled = true; });
  }
}

document.addEventListener("liffuc-language-change", () => {
  if (!isNew) document.getElementById("page-title").textContent = t("Editar molécula");
});

initialize();
