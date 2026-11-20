import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM?.trim();

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !from) {
    throw new Error("La configuración SMTP institucional requiere servidor, puerto y correo remitente.");
  }
  if (Boolean(user) !== Boolean(password)) {
    throw new Error("SMTP_USER y SMTP_PASSWORD deben configurarse juntos.");
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE?.toLowerCase() === "true",
    ...(user ? { auth: { user, pass: password } } : {}),
    from,
  };
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character]);
}

export async function sendVisitorVerificationEmail({ email, name, token }) {
  const verificationUrl = getActionUrl("/verificar-cuenta", token);
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(verificationUrl.toString());
  await sendEmail({
    to: email,
    subject: "Confirma tu cuenta de visitante · LIFFUC-DB",
    text: `Hola ${name}, confirma tu correo y activa tu cuenta de visitante: ${verificationUrl.toString()}\n\nEl enlace vence en 24 horas.`,
    html: `<p>Hola ${safeName},</p><p>Confirma tu correo para activar tu cuenta de visitante en LIFFUC-DB.</p><p><a href="${safeUrl}">Confirmar mi cuenta</a></p><p>El enlace vence en 24 horas.</p>`,
  });
}

export async function sendPasswordResetEmail({ email, name, token }) {
  const resetUrl = getActionUrl("/restablecer-contrasena", token);
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(resetUrl.toString());
  await sendEmail({
    to: email,
    subject: "Restablece tu contraseña · LIFFUC-DB",
    text: `Hola ${name}, restablece tu contraseña: ${resetUrl.toString()}\n\nEl enlace vence en una hora. Si no solicitaste el cambio, ignora este correo.`,
    html: `<p>Hola ${safeName},</p><p>Recibimos una solicitud para restablecer la contraseña de tu cuenta LIFFUC-DB.</p><p><a href="${safeUrl}">Restablecer contraseña</a></p><p>El enlace vence en una hora. Si no solicitaste el cambio, ignora este correo.</p>`,
  });
}

export async function sendAccountChangeConfirmation({ email, name, token, changeType, newValue }) {
  const confirmationUrl = getActionUrl("/confirmar-cambio-cuenta", token);
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(confirmationUrl.toString());
  const changeDescription = changeType === "EMAIL"
    ? `cambiar el correo de tu cuenta a ${newValue}`
    : "cambiar la contraseña de tu cuenta";

  await sendEmail({
    to: email,
    subject: "Confirma un cambio en tu cuenta · LIFFUC-DB",
    text: `Hola ${name}, recibimos una solicitud para ${changeDescription}. Confírmala aquí: ${confirmationUrl.toString()}\n\nEl enlace vence en una hora. Si no solicitaste este cambio, ignora el correo.`,
    html: `<p>Hola ${safeName},</p><p>Recibimos una solicitud para ${escapeHtml(changeDescription)}.</p><p><a href="${safeUrl}">Confirmar cambio</a></p><p>El enlace vence en una hora. Si no solicitaste este cambio, ignora el correo.</p>`,
  });
}

function getActionUrl(path, token) {
  const baseUrl = process.env.NEXTAUTH_URL;
  if (!baseUrl) throw new Error("NEXTAUTH_URL no está configurado.");
  const actionUrl = new URL(path, baseUrl);
  actionUrl.searchParams.set("token", token);
  return actionUrl;
}

async function sendEmail({ to, subject, text, html }) {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    ...(config.auth ? { auth: config.auth } : {}),
    requireTLS: !config.secure,
  });

  await transporter.sendMail({ from: config.from, to, subject, text, html });
}
