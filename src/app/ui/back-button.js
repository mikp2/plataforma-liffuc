"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "./i18n";

export default function BackButton() {
  const router = useRouter();
  const { t } = useI18n();

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    router.push("/");
  }

  return (
    <button className="back-button" type="button" onClick={goBack}>
      ← {t("Regresar")}
    </button>
  );
}
