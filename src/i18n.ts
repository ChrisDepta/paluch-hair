"use client";

import i18n from "i18next";
import Backend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

export const SUPPORTED_LANGUAGES = ["pl", "en", "de", "uk", "ru"] as const;

if (!i18n.isInitialized) {
  i18n.use(Backend).use(initReactI18next).init({
    lng: "pl",
    fallbackLng: "pl",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
