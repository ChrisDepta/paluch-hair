"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../i18n";

type GalleryItem = {
  name: string;
  src: string;
};

type GalleryGridProps = {
  items: GalleryItem[];
  initialCount?: number;
  step?: number;
};

const sectionAnimation = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

export function GalleryGrid({ items, initialCount = 12, step = 12 }: GalleryGridProps) {
  const { t } = useTranslation();
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setShowMoreButton(window.scrollY > 260 && visibleCount < items.length);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items.length, visibleCount]);

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + visibleItems.length) % visibleItems.length : null));
  }, [visibleItems.length]);
  const nextImage = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % visibleItems.length : null));
  }, [visibleItems.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "ArrowRight") nextImage();
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, prevImage, nextImage, closeLightbox]);

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex]);

  const activeLightboxItem = lightboxIndex !== null ? visibleItems[lightboxIndex] : null;

  return (
    <>
      <motion.section
        className="gallery-page-grid"
        variants={sectionAnimation}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.55 }}
      >
        {visibleItems.map((item, index) => (
          <motion.article
            key={item.name}
            className="gallery-page-card glass"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            onClick={() => setLightboxIndex(index)}
            style={{ cursor: "pointer" }}
            aria-label={t("galleryGrid.openPhotoAria", { index: index + 1 })}
          >
            <Image src={item.src} alt="" fill className="gallery-photo" sizes="(max-width: 768px) 100vw, 33vw" />
            <div>
              <small>{t("common.brandTagline")}</small>
            </div>
          </motion.article>
        ))}
      </motion.section>

      <div className="gallery-more-wrap">
        {hasMore && showMoreButton ? (
          <button
            className="cta-primary gallery-more-btn"
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + step, items.length))}
          >
            {t("galleryGrid.showMore")}
          </button>
        ) : (
          hasMore && <p className="gallery-more-hint">{t("galleryGrid.scrollHint")}</p>
        )}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && activeLightboxItem && (
          <motion.div
            className="lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeLightbox}
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX === null) return;
              const dx = e.changedTouches[0].clientX - touchStartX;
              if (Math.abs(dx) > 48) {
                dx < 0 ? nextImage() : prevImage();
              }
              setTouchStartX(null);
            }}
          >
            <button className="lightbox-close" type="button" onClick={closeLightbox} aria-label={t("galleryGrid.closePreviewAria")}>
              ✕
            </button>

            <button
              className="lightbox-nav lightbox-prev"
              type="button"
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              aria-label={t("galleryGrid.prevPhotoAria")}
            >
              ‹
            </button>

            <motion.div
              className="lightbox-img-wrap"
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeLightboxItem.src}
                alt={t("common.brandTagline")}
                fill
                className="lightbox-photo"
                sizes="100vw"
                priority
              />
            </motion.div>

            <button
              className="lightbox-nav lightbox-next"
              type="button"
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              aria-label={t("galleryGrid.nextPhotoAria")}
            >
              ›
            </button>

            <p className="lightbox-counter">{lightboxIndex + 1} / {visibleItems.length}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
