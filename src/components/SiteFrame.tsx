"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import FocusTrap from "focus-trap-react";
import { useTranslation } from "react-i18next";
import i18nextInstance, { SUPPORTED_LANGUAGES } from "../i18n";

type Theme = "light" | "dark";
type Language = (typeof SUPPORTED_LANGUAGES)[number];

type A11ySettings = {
  fontScale: number;
  highContrast: boolean;
  underlineLinks: boolean;
  readableTypography: boolean;
};

const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: "pl", label: "Polski" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "uk", label: "Ukraińska" },
  { code: "ru", label: "Rosyjski" },
];

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M2.5 12s3.4-6.5 9.5-6.5S21.5 12 21.5 12s-3.4 6.5-9.5 6.5S2.5 12 2.5 12Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const resolveSystemTheme = (): Theme => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const getStoredA11ySettings = (): A11ySettings => {
  const defaults: A11ySettings = {
    fontScale: 100,
    highContrast: false,
    underlineLinks: false,
    readableTypography: false,
  };

  if (typeof window === "undefined") {
    return defaults;
  }

  const raw = localStorage.getItem("a11y-settings");
  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<A11ySettings>;
    const fontScale =
      typeof parsed.fontScale === "number"
        ? Math.min(130, Math.max(95, parsed.fontScale))
        : parsed.fontScale === ("normal" as unknown)
          ? 100
          : parsed.fontScale === ("large" as unknown)
            ? 108
            : parsed.fontScale === ("xlarge" as unknown)
              ? 115
              : defaults.fontScale;

    return {
      fontScale,
      highContrast: Boolean(parsed.highContrast),
      underlineLinks: Boolean(parsed.underlineLinks),
      readableTypography: Boolean(parsed.readableTypography),
    };
  } catch {
    return defaults;
  }
};

type SiteFrameProps = {
  children: ReactNode;
};

export function SiteFrame({ children }: SiteFrameProps) {
  const { t } = useTranslation();
  const langMenuRef = useRef<HTMLDivElement | null>(null);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [a11ySettings, setA11ySettings] = useState<A11ySettings>(() => getStoredA11ySettings());

  const [systemTheme, setSystemTheme] = useState<Theme>(() => resolveSystemTheme());
  const [manualTheme, setManualTheme] = useState<Theme | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const stored = localStorage.getItem("theme") as Theme | null;
    return stored === "light" || stored === "dark" ? stored : null;
  });

  const activeTheme = manualTheme ?? systemTheme;

  const { scrollYProgress } = useScroll();
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    document.documentElement.dataset.theme = activeTheme;
  }, [activeTheme]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isLanguageMenuOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!langMenuRef.current?.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isLanguageMenuOpen]);

  useEffect(() => {
    if (!isAccessibilityOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAccessibilityOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isAccessibilityOpen]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onScroll = () => {
      const y = window.scrollY;
      setIsNavScrolled(y > 18);
      setShowBackToTop(y > 420);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.style.setProperty("--user-font-scale", String(a11ySettings.fontScale / 100));
    root.dataset.contrast = a11ySettings.highContrast ? "high" : "normal";
    root.dataset.links = a11ySettings.underlineLinks ? "underlined" : "normal";
    root.dataset.readability = a11ySettings.readableTypography ? "enhanced" : "normal";

    localStorage.setItem("a11y-settings", JSON.stringify(a11ySettings));
  }, [a11ySettings]);

  const toggleTheme = () => {
    const nextTheme = activeTheme === "light" ? "dark" : "light";
    setManualTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const rawLanguage = i18nextInstance.resolvedLanguage ?? i18nextInstance.language ?? "pl";
  const language = (SUPPORTED_LANGUAGES.find((lng: string) => rawLanguage.startsWith(lng)) ?? "pl") as Language;
  const activeLanguageLabel =
    LANGUAGE_OPTIONS.find((option) => option.code === language)?.label ?? language.toUpperCase();

  const changeLanguage = (nextLanguage: Language) => {
    i18nextInstance.changeLanguage(nextLanguage);
    setIsLanguageMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetA11ySettings = () => {
    setA11ySettings({
      fontScale: 100,
      highContrast: false,
      underlineLinks: false,
      readableTypography: false,
    });
  };

  return (
    <div className="page-shell ref-style-shell">
      <div className="bg-aurora" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />
      <motion.div className="scroll-progress" style={{ scaleX: progressScaleX }} />

      <header className={`top-nav ${isNavScrolled ? "is-scrolled" : ""}`}>
        <p className="brand">
          <Image src="/logoTransparentWheel.png" alt="" className="brand-logo" width={34} height={34} priority />
          <span>Paluch Hair</span>
        </p>
        <nav>
          <Link href="/">{t("nav.home")}</Link>
          <Link href="/#about">{t("nav.about")}</Link>
          <Link href="/gallery">{t("nav.gallery")}</Link>
          <Link href="/#reviews">{t("reviews.title")}</Link>
          <Link href="/pricing">{t("nav.pricing")}</Link>
          <Link href="/#contact">{t("nav.contact")}</Link>
        </nav>
        <div className="actions">
          <div className="lang-picker" ref={langMenuRef}>
            <button
              type="button"
              className="lang-trigger"
              onClick={() => setIsLanguageMenuOpen((open) => !open)}
              aria-expanded={isLanguageMenuOpen}
              aria-haspopup="menu"
            >
              {activeLanguageLabel}
              <span className="lang-caret" aria-hidden="true">
                v
              </span>
            </button>

            {isLanguageMenuOpen && (
              <div className="lang-menu" role="menu" aria-label="Language selector">
                {LANGUAGE_OPTIONS.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    className={`lang-option ${language === option.code ? "is-active" : ""}`}
                    onClick={() => changeLanguage(option.code)}
                    role="menuitem"
                  >
                    <span>{option.label}</span>
                    <small>{option.code.toUpperCase()}</small>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={toggleTheme} className="pill-btn" type="button" aria-label="Toggle theme">
            <span suppressHydrationWarning>{activeTheme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>

        <button
          className={`hamburger${isMobileMenuOpen ? " is-open" : ""}`}
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <span className="ham-bar" />
          <span className="ham-bar" />
          <span className="ham-bar" />
        </button>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              className="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              aria-label="Menu mobilne"
            >
              <div className="mobile-menu-top">
                <p className="brand">
                  <Image src="/logoTransparentWheel.png" alt="" className="brand-logo" width={28} height={28} />
                  <span>Paluch Hair</span>
                </p>
                <button
                  className="mobile-menu-close"
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Zamknij menu"
                >
                  ✕
                </button>
              </div>
              <div className="mobile-menu-links">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.home")}</Link>
                <Link href="/#about" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.about")}</Link>
                <Link href="/gallery" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.gallery")}</Link>
                <Link href="/#reviews" onClick={() => setIsMobileMenuOpen(false)}>{t("reviews.title")}</Link>
                <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.pricing")}</Link>
                <Link href="/#contact" onClick={() => setIsMobileMenuOpen(false)}>{t("nav.contact")}</Link>
              </div>
              <div className="mobile-menu-controls">
                <p className="mobile-menu-section-label">Język / Language</p>
                <div className="mobile-lang-grid">
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      className={`lang-option${language === option.code ? " is-active" : ""}`}
                      onClick={() => changeLanguage(option.code)}
                      role="menuitem"
                    >
                      <span>{option.label}</span>
                      <small>{option.code.toUpperCase()}</small>
                    </button>
                  ))}
                </div>
                <button onClick={toggleTheme} className="pill-btn mobile-theme-btn" type="button" aria-label="Toggle theme">
                  <span suppressHydrationWarning>{activeTheme === "light" ? "🌙 Dark" : "☀️ Light"}</span>
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {children}

      <div className="floating-controls" aria-label="Quick actions">
        <div className="floating-group floating-left-group">
          {showBackToTop && (
            <button
              className="floating-btn floating-back"
              type="button"
              onClick={scrollToTop}
              aria-label={t("nav.backToTop")}
            >
              {t("nav.backToTop")}
            </button>
          )}
        </div>
        <div className="floating-group floating-right-group">
          <button
            className="floating-btn floating-a11y"
            type="button"
            onClick={() => setIsAccessibilityOpen(true)}
            aria-label={t("a11y.openAria")}
          >
            <EyeIcon />
          </button>
        </div>
      </div>

      {isAccessibilityOpen && (
        <div className="a11y-overlay" role="presentation" onClick={() => setIsAccessibilityOpen(false)}>
          <FocusTrap>
            <section
              className="a11y-modal"
              role="dialog"
              aria-modal="true"
              aria-label={t("a11y.dialogAria")}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="a11y-head">
                <h3>{t("a11y.title")}</h3>
                <button
                  className="a11y-close"
                  type="button"
                  onClick={() => setIsAccessibilityOpen(false)}
                  aria-label={t("a11y.closeAria")}
                >
                  X
                </button>
              </div>

              <p className="a11y-intro">{t("a11y.intro")}</p>

              <label className="a11y-row">
                <span>{t("a11y.fontScale")}</span>
                <div className="a11y-slider-wrap">
                  <input
                    id="a11y-font-scale-subpage"
                    className="a11y-slider"
                    type="range"
                    min={95}
                    max={130}
                    step={5}
                    value={a11ySettings.fontScale}
                    onChange={(event) =>
                      setA11ySettings((current) => ({
                        ...current,
                        fontScale: Number(event.target.value),
                      }))
                    }
                    aria-label={t("a11y.fontScaleSliderAria")}
                  />
                  <span className="a11y-slider-value">{a11ySettings.fontScale}%</span>
                </div>
              </label>

              <label className="a11y-row checkbox">
                <input
                  type="checkbox"
                  checked={a11ySettings.highContrast}
                  onChange={(event) =>
                    setA11ySettings((current) => ({
                      ...current,
                      highContrast: event.target.checked,
                    }))
                  }
                />
                <span>{t("a11y.highContrast")}</span>
              </label>

              <label className="a11y-row checkbox">
                <input
                  type="checkbox"
                  checked={a11ySettings.underlineLinks}
                  onChange={(event) =>
                    setA11ySettings((current) => ({
                      ...current,
                      underlineLinks: event.target.checked,
                    }))
                  }
                />
                <span>{t("a11y.underlineLinks")}</span>
              </label>

              <label className="a11y-row checkbox">
                <input
                  type="checkbox"
                  checked={a11ySettings.readableTypography}
                  onChange={(event) =>
                    setA11ySettings((current) => ({
                      ...current,
                      readableTypography: event.target.checked,
                    }))
                  }
                />
                <span>{t("a11y.readableTypography")}</span>
              </label>

              <div className="a11y-footer">
                <button type="button" className="a11y-reset" onClick={resetA11ySettings}>
                  {t("a11y.reset")}
                </button>
              </div>
            </section>
          </FocusTrap>
        </div>
      )}
    </div>
  );
}
