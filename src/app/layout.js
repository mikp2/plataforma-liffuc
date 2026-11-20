import "./globals.css";
import BackButton from "./ui/back-button";
import LanguageSelector from "./ui/language-selector";
import { LanguageProvider } from "./ui/i18n";

export const metadata = {
  title: "Banco de Moléculas",
  description: "Plataforma de gestión del banco de moléculas",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <LanguageProvider>
          <BackButton />
          <LanguageSelector />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
