"use client";

import { useTranslation } from "react-i18next";
import "../i18n";
import { PricingShowcase } from "./PricingShowcase";
import { SiteFrame } from "./SiteFrame";

export function PricingPageContent() {
  const { t } = useTranslation();

  return (
    <SiteFrame>
      <main className="gallery-page-layout">
        <section className="subpage-hero glass">
          <div>
            <span className="badge">{t("pricingPage.badge")}</span>
            <h1>{t("pricingPage.title")}</h1>
            <p>{t("pricingPage.description")}</p>
          </div>
        </section>

        <PricingShowcase />
      </main>
    </SiteFrame>
  );
}
