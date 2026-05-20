"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import "../i18n";

type MenPriceItem = {
  name: string;
  price: string;
};

type WomenPriceItem = {
  name: string;
  short: string;
  medium: string;
  long: string;
};

type LengthPrice = {
  key: "short" | "medium" | "long";
  label: string;
  value: string;
};

type WomenPricing = {
  title: string;
  subtitle: string;
  columns: {
    service: string;
    short: string;
    medium: string;
    long: string;
  };
  items: WomenPriceItem[];
};

type ExtensionsPricing = {
  title: string;
  installTitle: string;
  correctionTitle: string;
  consult: string;
  installItems: MenPriceItem[];
  correctionItems: MenPriceItem[];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const asArray = <T,>(value: unknown): T[] => {
  return Array.isArray(value) ? (value as T[]) : [];
};

const sectionAnimation = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const isValueAvailable = (value: string) => {
  const normalized = value.trim();
  return normalized !== "" && normalized !== "-";
};

const toMobileLengthPrices = (prices: LengthPrice[], allLengthsLabel: string): LengthPrice[] => {
  const available = prices.filter((entry) => isValueAvailable(entry.value));

  if (available.length <= 1) {
    return available.map((entry) => ({
      ...entry,
      label: allLengthsLabel,
    }));
  }

  if (available.length === 2) {
    return available.map((entry) => ({
      ...entry,
      label: entry.key === "long" ? prices[2].label : prices[1].label,
    }));
  }

  return available;
};

type PricingShowcaseProps = {
  showMoreLink?: boolean;
};

export function PricingShowcase({ showMoreLink = false }: PricingShowcaseProps) {
  const { t } = useTranslation();
  const allLengthsLabel = t("pricing.women.allLengths", { defaultValue: "każda długość" });

  const womenPricingRaw = t("pricing.women", { returnObjects: true });
  const womenPricingDefault: WomenPricing = {
    title: "",
    subtitle: "",
    columns: {
      service: "",
      short: "",
      medium: "",
      long: "",
    },
    items: [],
  };

  const womenPricing: WomenPricing = isRecord(womenPricingRaw)
    ? {
        title: typeof womenPricingRaw.title === "string" ? womenPricingRaw.title : "",
        subtitle: typeof womenPricingRaw.subtitle === "string" ? womenPricingRaw.subtitle : "",
        columns: isRecord(womenPricingRaw.columns)
          ? {
              service: typeof womenPricingRaw.columns.service === "string" ? womenPricingRaw.columns.service : "",
              short: typeof womenPricingRaw.columns.short === "string" ? womenPricingRaw.columns.short : "",
              medium: typeof womenPricingRaw.columns.medium === "string" ? womenPricingRaw.columns.medium : "",
              long: typeof womenPricingRaw.columns.long === "string" ? womenPricingRaw.columns.long : "",
            }
          : womenPricingDefault.columns,
        items: asArray<WomenPriceItem>(womenPricingRaw.items),
      }
    : womenPricingDefault;

  const menPricingItems = asArray<MenPriceItem>(t("pricing.men.items", { returnObjects: true }));

  const extensionsPricingRaw = t("pricing.extensions", { returnObjects: true });
  const extensionsPricingDefault: ExtensionsPricing = {
    title: "",
    installTitle: "",
    correctionTitle: "",
    consult: "",
    installItems: [],
    correctionItems: [],
  };

  const extensionsPricing: ExtensionsPricing = isRecord(extensionsPricingRaw)
    ? {
        title: typeof extensionsPricingRaw.title === "string" ? extensionsPricingRaw.title : "",
        installTitle: typeof extensionsPricingRaw.installTitle === "string" ? extensionsPricingRaw.installTitle : "",
        correctionTitle:
          typeof extensionsPricingRaw.correctionTitle === "string" ? extensionsPricingRaw.correctionTitle : "",
        consult: typeof extensionsPricingRaw.consult === "string" ? extensionsPricingRaw.consult : "",
        installItems: asArray<MenPriceItem>(extensionsPricingRaw.installItems),
        correctionItems: asArray<MenPriceItem>(extensionsPricingRaw.correctionItems),
      }
    : extensionsPricingDefault;

  return (
    <motion.section
      id="pricing"
      className="pricing glass section-surface"
      variants={sectionAnimation}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.72 }}
    >
      <div className="section-head pricing-head">
        <div>
          <h2 suppressHydrationWarning>{t("pricing.title")}</h2>
          <p suppressHydrationWarning>{t("pricing.note")}</p>
        </div>
        {showMoreLink && (
          <Link href="/pricing" className="cta-secondary pricing-more-link">
            Pełny cennik
          </Link>
        )}
      </div>

      <div className="pricing-grid pricing-sections">
        <article className="pricing-panel pricing-block">
          <h3 suppressHydrationWarning>{womenPricing.title}</h3>
          <p className="pricing-subtitle" suppressHydrationWarning>
            {womenPricing.subtitle}
          </p>

          <div className="women-table women-head">
            <span>{womenPricing.columns.service}</span>
            <span>{womenPricing.columns.short}</span>
            <span>{womenPricing.columns.medium}</span>
            <span>{womenPricing.columns.long}</span>
          </div>

          {womenPricing.items.map((item) => (
            (() => {
              const prices: LengthPrice[] = [
                { key: "short", label: womenPricing.columns.short, value: item.short },
                { key: "medium", label: womenPricing.columns.medium, value: item.medium },
                { key: "long", label: womenPricing.columns.long, value: item.long },
              ];
              const mobilePrices = toMobileLengthPrices(prices, allLengthsLabel);

              return (
                <div className="women-table women-row" key={item.name}>
                  <span className="women-service">{item.name}</span>
                  <span className="women-price-desktop">{item.short}</span>
                  <span className="women-price-desktop">{item.medium}</span>
                  <span className="women-price-desktop">{item.long}</span>

                  <div className="women-mobile-prices" aria-label={`${item.name} - długości włosów`}>
                    {mobilePrices.map((entry) => (
                      <span className="women-mobile-price" key={`${item.name}-${entry.key}`} data-label={entry.label}>
                        {entry.value}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()
          ))}
        </article>

        <article className="pricing-panel pricing-block">
          <h3 suppressHydrationWarning>{t("pricing.men.title")}</h3>
          <div className="pricing-list compact">
            {menPricingItems.map((item) => (
              <div className="price-row" key={item.name}>
                <span>{item.name}</span>
                <strong>{item.price}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="pricing-panel pricing-block">
          <h3 suppressHydrationWarning>{extensionsPricing.title}</h3>
          <p className="pricing-subtitle" suppressHydrationWarning>
            {extensionsPricing.installTitle}
          </p>
          <div className="pricing-list compact">
            {extensionsPricing.installItems.map((item) => (
              <div className="price-row" key={item.name}>
                <span>{item.name}</span>
                <strong>{item.price}</strong>
              </div>
            ))}
          </div>

          <p className="pricing-subtitle mt" suppressHydrationWarning>
            {extensionsPricing.correctionTitle}
          </p>
          <div className="pricing-list compact">
            {extensionsPricing.correctionItems.map((item) => (
              <div className="price-row" key={item.name}>
                <span>{item.name}</span>
                <strong>{item.price}</strong>
              </div>
            ))}
          </div>

          <p className="consult-callout" suppressHydrationWarning>
            {extensionsPricing.consult}
          </p>
        </article>
      </div>
    </motion.section>
  );
}