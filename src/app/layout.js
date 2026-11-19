import "./globals.css";
import BackButton from "./ui/back-button";

export const metadata = {
  title: "Banco de Moléculas",
  description: "Plataforma de gestión del banco de moléculas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <BackButton />
        {children}
      </body>
    </html>
  );
}
