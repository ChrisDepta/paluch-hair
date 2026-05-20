import { PricingShowcase } from "@/components/PricingShowcase";
import { SiteFrame } from "@/components/SiteFrame";

export default function PricingPage() {
  return (
    <SiteFrame>
      <main className="gallery-page-layout">
        <section className="subpage-hero glass">
          <div>
            <span className="badge">Cennik</span>
            <h1>Cennik</h1>
            <p>Przejrzysty zestaw usług i cen w jednym miejscu.</p>
          </div>
        </section>

        <PricingShowcase />
      </main>
    </SiteFrame>
  );
}
