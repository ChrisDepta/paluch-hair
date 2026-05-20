import fs from "fs/promises";
import path from "path";
import { GalleryGrid } from "@/components/GalleryGrid";
import { SiteFrame } from "@/components/SiteFrame";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

async function getGalleryItems() {
  const galleryDir = path.join(process.cwd(), "public", "gallery");
  const entries = await fs.readdir(galleryDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .sort((left, right) => left.localeCompare(right, "pl"))
    .map((fileName) => ({
      name: fileName.replace(/[-_]+/g, " ").replace(/\.[^.]+$/, ""),
      src: `/gallery/${fileName}`,
    }));
}

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <SiteFrame>
      <main className="gallery-page-layout">
        <section className="subpage-hero glass">
          <div>
            <span className="badge">Galeria</span>
            <h1>Nasze realizacje</h1>
            <p>
              Zapraszamy do obejrzenia naszych realizacji — strzyżeń, koloryzacji, baleyażu, loków i fryzur
              wieczorowych. Każde zdjęcie to efekt pracy wykonanej z dbałością o szczegóły. Kliknij dowolne zdjęcie,
              aby powiększyć.
            </p>
          </div>
        </section>

        <GalleryGrid items={items} initialCount={12} step={12} />
      </main>
    </SiteFrame>
  );
}
