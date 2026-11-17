export default function Page() {
  return (
    <main>
      /* ============================================================
   LIFFUC-DB · Inicio de sesión
   ============================================================ */

(() => {
  "use strict";

  // Ajusta esta ruta a tu backend (Express)
  const LOGIN_ENDPOINT = "/api/auth/login";
  const REDIRECT_AFTER_LOGIN = "dashboard.html";

  const $ = (sel) => document.querySelector(sel);

  const form = $("#loginForm");
  const emailInput = $("#email");
  const passInput = $("#password");
  const toggleBtn = $("#togglePassword");
  const submitBtn = $("#submitBtn");
  const alertBox = $("#alert");

  /* ---------- Año del pie ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Mostrar / ocultar contraseña ---------- */
  toggleBtn.addEventListener("click", () => {
    const show = passInput.type === "password";
    passInput.type = show ? "text" : "password";
    toggleBtn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
    toggleBtn.style.color = show ? "var(--forest-700)" : "";
  });

  /* ---------- Validación ---------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(input, message) {
    const slot = document.querySelector(`[data-error-for="${input.id}"]`);
    input.classList.toggle("is-invalid", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (slot) slot.textContent = message || "";
  }

  function validate() {
    let ok = true;

    if (!emailInput.value.trim()) {
      setError(emailInput, "Ingresa tu correo electrónico.");
      ok = false;
    } else if (!EMAIL_RE.test(emailInput.value.trim())) {
      setError(emailInput, "El correo no tiene un formato válido.");
      ok = false;
    } else {
      setError(emailInput, "");
    }

    if (!passInput.value) {
      setError(passInput, "Ingresa tu contraseña.");
      ok = false;
    } else if (passInput.value.length < 6) {
      setError(passInput, "Debe tener al menos 6 caracteres.");
      ok = false;
    } else {
      setError(passInput, "");
    }

    return ok;
  }

  [emailInput, passInput].forEach((el) =>
    el.addEventListener("input", () => {
      if (el.classList.contains("is-invalid")) validate();
      hideAlert();
    })
  );

  /* ---------- Alertas ---------- */
  function showAlert(message, type = "error") {
    alertBox.textContent = message;
    alertBox.className = `alert alert--${type}`;
    alertBox.hidden = false;
  }
  function hideAlert() {
    alertBox.hidden = true;
  }

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
    submitBtn.querySelector(".btn__label").textContent = isLoading
      ? "Verificando…"
      : "Iniciar sesión";
  }

  /* ---------- Envío ---------- */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAlert();

    if (!validate()) {
      const card = document.querySelector(".card");
      card.classList.remove("shake");
      void card.offsetWidth; // reinicia la animación
      card.classList.add("shake");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passInput.value,
          remember: $("#remember").checked,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Correo o contraseña incorrectos.");
      }

      showAlert("Acceso correcto. Redirigiendo…", "ok");
      setTimeout(() => (window.location.href = REDIRECT_AFTER_LOGIN), 600);
    } catch (err) {
      const offline = err instanceof TypeError;
      showAlert(offline ? "No se pudo conectar con el servidor. Intenta de nuevo." : err.message);
      setLoading(false);
    }
  });

  /* ---------- Contadores animados ---------- */
  function animateCounters() {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      const duration = 1400;
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased).toLocaleString("es-CO");
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }
  animateCounters();

  /* ---------- Fondo: red de moléculas ---------- */
  const canvas = $("#molecules");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w, h, atoms = [];
  const COLORS = ["#a9bfae", "#f5efde", "#b8923a"];
  const MAX_DIST = 120;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(70, Math.floor((w * h) / 14000));
    atoms = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 2 + Math.random() * 4,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // enlaces
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const a = atoms[i], b = atoms[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < MAX_DIST) {
          ctx.strokeStyle = `rgba(169, 191, 174, ${0.35 * (1 - d / MAX_DIST)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // átomos
    for (const a of atoms) {
      ctx.fillStyle = a.c;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (!reduceMotion) {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
      }
    }

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", () => {
    resize();
    if (reduceMotion) draw();
  });

  resize();
  draw();
})();
    </main>
  );
}
