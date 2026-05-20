"use client";

import { useTranslation } from "react-i18next";
import "../i18n";
import { GalleryGrid } from "./GalleryGrid";
import { SiteFrame } from "./SiteFrame";

type GalleryPageItem = {
  name: string;
  src: string;
};

type GalleryPageContentProps = {
  items: GalleryPageItem[];
};

export function GalleryPageContent({ items }: GalleryPageContentProps) {
  const { t } = useTranslation();

  return (
    <SiteFrame>
      <main className="gallery-page-layout">
        <section className="subpage-hero glass">
          <div>
            <span className="badge">{t("galleryPage.badge")}</span>
            <h1>{t("galleryPage.title")}</h1>
            <p>{t("galleryPage.description")}</p>
          </div>
        </section>

        <GalleryGrid items={items} initialCount={12} step={12} />
      </main>
    </SiteFrame>
  );
}
