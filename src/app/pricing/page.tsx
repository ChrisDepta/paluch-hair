import type { Metadata } from "next";
import { PricingPageContent } from "@/components/PricingPageContent";

export const metadata: Metadata = {
  title: "Cennik",
  description:
    "Cennik uslug Paluch Hair we Wroclawiu: strzyzenie, modelowanie, koloryzacja, balayaz, ombre oraz uslugi fryzjerskie dla kobiet i mezczyzn.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return <PricingPageContent />;
}
