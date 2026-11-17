import "./globals.css";

export const metadata = {
  title: "Banco de Moléculas",
  description: "Plataforma de gestión del banco de moléculas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
