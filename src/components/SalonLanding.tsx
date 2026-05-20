"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import FocusTrap from "focus-trap-react";
import i18nextInstance, { SUPPORTED_LANGUAGES } from "../i18n";

type Theme = "light" | "dark";
type Language = (typeof SUPPORTED_LANGUAGES)[number];

type ReviewItem = {
  name: string;
  text: string;
};

type WorkHoursItem = {
  day: string;
  value: string;
};

type A11ySettings = {
  fontScale: number;
  highContrast: boolean;
  underlineLinks: boolean;
  readableTypography: boolean;
};

const asArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

const resolveSystemTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  if (typeof window.matchMedia !== "function") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const galleryItems = [
  { title: "Strzyżenie i modelowanie", src: "/mostafa_meraji-haircut-6797912_1920.jpg" },
  { title: "Farbowanie włosów", src: "/mostafa_meraji-haircut-6798047_1920.jpg" },
  { title: "Baleyaż", src: "/oga_red-hair-2258292_1920.jpg" },
  { title: "Trwała ondulacja", src: "/ninulia-hairdresser-659139_1920.jpg" },
  { title: "Loki", src: "/7760815-hair-4657887_1920.jpg" },
  { title: "Fryzura wieczorowa", src: "/sandryriveraa-bride-4989149_1920.jpg" },
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

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M6.8 3.4h3.4l1 4-2.1 1.8a14.7 14.7 0 0 0 5.7 5.7l1.8-2.1 4 1v3.4c0 .8-.7 1.5-1.5 1.5C10 18.7 5.3 14 5.3 5c0-.9.7-1.6 1.5-1.6Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 7.8v4.6l3 1.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: "pl", label: "Polski" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "uk", label: "Ukraińska" },
  { code: "ru", label: "Rosyjski" },
];

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
        : parsed.fontScale === "normal"
          ? 100
          : parsed.fontScale === "large"
            ? 108
            : parsed.fontScale === "xlarge"
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

const sectionAnimation = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const calculateElapsedYears = (startDate: Date, endDate: Date): number => {
  let years = endDate.getFullYear() - startDate.getFullYear();
  const beforeAnniversary =
    endDate.getMonth() < startDate.getMonth() ||
    (endDate.getMonth() === startDate.getMonth() && endDate.getDate() < startDate.getDate());

  if (beforeAnniversary) {
    years -= 1;
  }

  return Math.max(0, years);
};

const calculateEstimatedServices = (startDate: Date, endDate: Date): number => {
  const elapsedDays = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / MS_IN_DAY));
  const averageServicesPerDay = 3;

  return Math.round(elapsedDays * averageServicesPerDay);
};

const calculateEstimatedUniqueClients = (servicesCount: number): number => {
  const averageVisitsPerClient = 2.8;

  return Math.max(0, Math.round(servicesCount / averageVisitsPerClient));
};

export function SalonLanding() {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement | null>(null);
  const aboutCountersRef = useRef<HTMLDivElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement | null>(null);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isNavScrolled, setIsNavScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [aboutCounterValues, setAboutCounterValues] = useState({
    careerYears: 0,
    salonYears: 0,
    clientsServed: 0,
    servicesPerformed: 0,
  });
  const [a11ySettings, setA11ySettings] = useState<A11ySettings>(() => getStoredA11ySettings());

  const [systemTheme, setSystemTheme] = useState<Theme>(() => {
    return resolveSystemTheme();
  });

  const [manualTheme, setManualTheme] = useState<Theme | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    return null;
  });

  const activeTheme = manualTheme ?? systemTheme;

  const { scrollYProgress: pageProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const isAboutCountersInView = useInView(aboutCountersRef, { once: true, amount: 0.55 });

  const progressScaleX = useTransform(pageProgress, [0, 1], [0, 1]);
  const heroContentY = useTransform(heroProgress, [0, 1], [0, 70]);
  const heroMediaY = useTransform(heroProgress, [0, 1], [0, -50]);

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
    if (typeof window === "undefined") {
      return;
    }

    const onScroll = () => {
      const y = window.scrollY;
      setIsNavScrolled(y > 18);
      setShowBackToTop(y > 520);
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
    const scaleValue = String(a11ySettings.fontScale / 100);

    root.style.setProperty("--user-font-scale", scaleValue);
    root.dataset.contrast = a11ySettings.highContrast ? "high" : "normal";
    root.dataset.links = a11ySettings.underlineLinks ? "underlined" : "normal";
    root.dataset.readability = a11ySettings.readableTypography ? "enhanced" : "normal";

    localStorage.setItem("a11y-settings", JSON.stringify(a11ySettings));
  }, [a11ySettings]);

  const rawLanguage = i18nextInstance.resolvedLanguage ?? i18nextInstance.language ?? "pl";
  const language = (SUPPORTED_LANGUAGES.find((lng: string) => rawLanguage.startsWith(lng)) ?? "pl") as Language;

  const now = new Date();
  const careerStart = new Date(1992, 8, 1);
  const salonStart = new Date(2005, 9, 1);
  const totalCareerYears = calculateElapsedYears(careerStart, now);
  const totalSalonYears = calculateElapsedYears(salonStart, now);
  const totalServicesPerformed = calculateEstimatedServices(careerStart, now);
  const totalClientsServed = calculateEstimatedUniqueClients(totalServicesPerformed);

  const aboutPoints = asArray<string>(t("about.points", { returnObjects: true }));
  const reviewItems = asArray<ReviewItem>(t("reviews.items", { returnObjects: true }));
  const visibleReviewItems = reviewItems.slice(0, 4);
  const workHours = asArray<WorkHoursItem>(t("contact.hours", { returnObjects: true }));
  const numberFormatter = new Intl.NumberFormat(language);

  useEffect(() => {
    if (!isAboutCountersInView) {
      return;
    }

    let frame = 0;
    const durationMs = 1600;
    const startMs = performance.now();

    const tick = (nowMs: number) => {
      const progress = Math.min((nowMs - startMs) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;

      setAboutCounterValues({
        careerYears: Math.round(totalCareerYears * eased),
        salonYears: Math.round(totalSalonYears * eased),
        clientsServed: Math.round(totalClientsServed * eased),
        servicesPerformed: Math.round(totalServicesPerformed * eased),
      });

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [isAboutCountersInView, totalCareerYears, totalSalonYears, totalClientsServed, totalServicesPerformed]);

  const toggleTheme = () => {
    const nextTheme = activeTheme === "light" ? "dark" : "light";
    setManualTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const changeLanguage = (nextLanguage: Language) => {
    i18nextInstance.changeLanguage(nextLanguage);
    setIsLanguageMenuOpen(false);
  };

  const activeLanguageLabel =
    LANGUAGE_OPTIONS.find((option) => option.code === language)?.label ?? language.toUpperCase();

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
          <a href="#home">{t("nav.home")}</a>
          <a href="#about">{t("nav.about")}</a>
          <Link href="/gallery">{t("nav.gallery")}</Link>
          <Link href="/pricing">{t("nav.pricing")}</Link>
          <a href="#contact">{t("nav.contact")}</a>
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
      </header>

      <main>
        <motion.section
          id="home"
          ref={heroRef}
          className="hero-ref"
          variants={sectionAnimation}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.75 }}
        >
          <article className="hero-card glass">
            <Image
              src="/annmariephotography-barbershop-4484297_1920.jpg"
              alt="Wnetrze salonu"
              className="hero-bg-photo"
              fill
              priority
              sizes="(max-width: 980px) 100vw, 72vw"
            />
            <div className="hero-overlay" />
            <motion.div className="hero-content" style={{ y: heroContentY }}>
              <span className="badge">{t("hero.badge")}</span>
              <h1>{t("hero.title")}</h1>
              <p>{t("hero.subtitle")}</p>
              <div className="hero-cta">
                <a href="tel:+48717964664" className="cta-primary">
                  {t("hero.ctaCall")}
                </a>
                <a
                  href="https://maps.app.goo.gl/zyhj3P3xnWGvD3mR8"
                  className="cta-primary cta-google-review"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("hero.ctaReview")}
                </a>
              </div>
              <p className="rating">{t("hero.rating")}</p>
            </motion.div>
          </article>

          <motion.article
            className="hero-float-media glass"
            style={{ y: heroMediaY }}
            initial={{ opacity: 0, x: 36, y: 24 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
          >
            <Image
              src="/mostafa_meraji-barber-shop-6818713_1920.jpg"
              alt="Stylizacja fryzury"
              className="hero-right-photo"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 980px) 88vw, 52vw"
            />
          </motion.article>
        </motion.section>

        <motion.section
          id="about"
          className="about glass section-surface"
          variants={sectionAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <h2>{t("about.title")}</h2>
          <p>{t("about.intro")}</p>
          <p>{t("about.text")}</p>
          <ul>
            {aboutPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <div className="about-counters" ref={aboutCountersRef}>
            <div className="about-counters-topline" aria-hidden="true" />
            <div className="about-counters-grid">
              <article className="about-counter">
                <p className="about-counter-label">{t("about.counters.salon")}</p>
                <p className="about-counter-value">{numberFormatter.format(aboutCounterValues.salonYears)}</p>
              </article>

              <article className="about-counter">
                <p className="about-counter-label">{t("about.counters.career")}</p>
                <p className="about-counter-value">{numberFormatter.format(aboutCounterValues.careerYears)}</p>
              </article>

              <article className="about-counter">
                <p className="about-counter-label">{t("about.counters.clients")}</p>
                <p className="about-counter-value">{numberFormatter.format(aboutCounterValues.clientsServed)}</p>
              </article>

              <article className="about-counter">
                <p className="about-counter-label">{t("about.counters.services")}</p>
                <p className="about-counter-value">{numberFormatter.format(aboutCounterValues.servicesPerformed)}</p>
              </article>
            </div>
          </div>

          <p className="about-footnote">{t("about.since")}</p>
        </motion.section>

        <motion.section
          id="gallery"
          className="gallery section-surface"
          variants={sectionAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <div className="section-head">
            <h2>{t("gallery.title")}</h2>
            <p>{t("gallery.hint")}</p>
          </div>

          <div className="gallery-grid">
            {galleryItems.map((item, index) => (
              <motion.article
                className="gallery-card glass"
                key={item.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ rotateX: -7, rotateY: 7, scale: 1.02 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  className="gallery-photo"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
                />
                <div>
                  <p>{item.title}</p>
                  <small>Agnieszka Paluch Hair</small>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="gallery-actions">
            <Link href="/gallery" className="cta-primary gallery-link-btn">
              Zobacz pełną galerię
            </Link>
          </div>
        </motion.section>

        <motion.section
          id="reviews"
          className="reviews section-surface"
          variants={sectionAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <div className="section-head">
            <h2>{t("reviews.title")}</h2>
            <p>{t("reviews.subtitle")}</p>
          </div>

          <div className="reviews-grid">
            {visibleReviewItems.map((item, index) => (
              <motion.article
                key={item.name}
                className="review-card glass"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <p className="review-name">{item.name}</p>
                <p className="review-stars">★★★★★</p>
                <p className="review-text">{item.text}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="maps-cta"
          className="maps-cta glass section-surface"
          variants={sectionAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="maps-kicker">{t("mapsCta.kicker")}</h2>
          <h2>{t("mapsCta.title")}</h2>
          <p>{t("mapsCta.text")}</p>
          <p className="maps-stars" aria-label="Google rating 4.8 out of 5 stars">
            <span className="maps-star is-full" aria-hidden="true">
              ★
            </span>
            <span className="maps-star is-full" aria-hidden="true">
              ★
            </span>
            <span className="maps-star is-full" aria-hidden="true">
              ★
            </span>
            <span className="maps-star is-full" aria-hidden="true">
              ★
            </span>
            <span className="maps-star is-partial" aria-hidden="true">
              ★
            </span>
          </p>
          <p className="maps-rating-note">{t("mapsCta.rating")}</p>
          <div className="maps-actions">
            <a href="https://maps.app.goo.gl/zyhj3P3xnWGvD3mR8" target="_blank" rel="noreferrer" className="cta-primary">
              {t("mapsCta.primary")}
            </a>
          </div>
        </motion.section>

        <motion.section
          id="contact"
          className="contact glass section-surface"
          variants={sectionAnimation}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.72 }}
        >
          <h2>{t("contact.title")}</h2>
          <div className="contact-layout">
            <div className="contact-main">
              <p className="contact-company">{t("contact.company")}</p>
              <p className="contact-note">{t("contact.noForm")}</p>

              <p className="contact-label">{t("contact.phoneLabel")}</p>
              <div className="contact-line">
                <span className="contact-icon" aria-hidden="true">
                  <PhoneIcon />
                </span>
                <a className="phone-link" href="tel:+48717964664">
                  {t("contact.phone")}
                </a>
              </div>

              <p className="contact-label">{t("contact.addressLabel")}</p>
              <div className="contact-line">
                <span className="contact-icon" aria-hidden="true">
                  <PinIcon />
                </span>
                <p className="contact-address">{t("contact.address")}</p>
              </div>
            </div>

            <div className="hours-box">
              <p className="hours-title">
                <span className="contact-icon" aria-hidden="true">
                  <ClockIcon />
                </span>
                {t("contact.hoursTitle")}
              </p>
              {workHours.map((item) => (
                <div className="hours-row" key={item.day}>
                  <span>{item.day}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </main>

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
                    id="a11y-font-scale"
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
