"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import "../../(publico)/.css";

export default function Page() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        identifier: identifier.trim(),
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Usuario o contraseña incorrectos.");
        setLoading(false);
        return;
      }

      window.location.replace("/inicio/DB.html");
    } catch {
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  return (
    <main className="login" style={{ maxWidth: "none", margin: 0, padding: 0 }}>
      <section className="brand" aria-label="LIFFUC-DB">
        <canvas id="molecules" aria-hidden="true" />
        <div className="brand__content">
          <header className="brand__logo">
            <div className="brand__mark">L</div>
            <div className="brand__name">
              LIFFUC<span>-DB</span>
            </div>
          </header>
          <div>
            <p className="eyebrow">Grupo de investigación LIFFUC</p>
            <h1>Ciencia que conecta moléculas y conocimiento.</h1>
            <p className="brand__lead">
              Banco de moléculas destinado a la organización, consulta y gestión de
              compuestos químicos obtenidos de investigaciones en productos naturales.
            </p>
          </div>
          <ul className="stats" aria-label="Áreas de la plataforma">
            <li>
              <strong>01</strong>
              <span>Investigación</span>
            </li>
            <li>
              <strong>02</strong>
              <span>Moléculas</span>
            </li>
            <li>
              <strong>03</strong>
              <span>Conocimiento</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="panel" aria-label="Inicio de sesión">
        <div className="card">
          <div className="card__header">
            <p className="eyebrow eyebrow--dark">Acceso a la plataforma</p>
            <h2>Bienvenido</h2>
            <p className="muted">
              Ingresa tus credenciales para acceder al banco de moléculas LIFFUC.
            </p>
          </div>

          {error && (
            <div className="alert alert--error" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <form id="loginForm" noValidate onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="username">Correo electrónico o usuario</label>
              <input
                id="username"
                name="username"
                type="text"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                required
                aria-invalid={Boolean(error)}
              />
            </div>

            <div className="field">
              <div className="field__row">
                <label htmlFor="password">Contraseña</label>
              </div>
              <div className="input-group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(error)}
                />
                <button
                  type="button"
                  className="input-group__btn"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn--primary ${loading ? "is-loading" : ""}`}
              disabled={loading}
            >
              <span className="btn__spinner" aria-hidden="true" />
              <span className="btn__label">
                {loading ? "Verificando…" : "Iniciar sesión"}
              </span>
            </button>
          </form>

          <a
            className="btn btn--ghost"
            href="/paginaweb/paginaweb.html"
            style={{ width: "100%", marginTop: 12, textAlign: "center" }}
          >
            Ir a la página web de LIFFUC
          </a>

          <div className="divider">Acceso institucional</div>
          <p className="signup">Solicita tus credenciales al administrador.</p>
        </div>

        <footer className="footer">LIFFUC-DB · Banco de moléculas</footer>
      </section>
    </main>
  );
}
