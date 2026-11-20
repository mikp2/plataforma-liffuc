"use client";

import { languages, useI18n } from "./i18n";
import "./language-selector.css";

export default function LanguageSelector() {
  const { language, setLanguage, t } = useI18n();

  return (
    <label className="language-selector">
      <span className="language-selector-label">{t("Idioma")}</span>
      <select
        aria-label={t("Idioma")}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      >
        {Object.entries(languages).map(([code, item]) => (
          <option key={code} value={code}>{item.label}</option>
        ))}
      </select>
    </label>
  );
}
