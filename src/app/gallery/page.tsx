import fs from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { GalleryPageContent } from "@/components/GalleryPageContent";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export const metadata: Metadata = {
  title: "Galeria",
  description:
    "Galeria realizacji Paluch Hair: strzyzenia, koloryzacje, balayaz, loki i fryzury wieczorowe wykonane we Wroclawiu.",
  alternates: {
    canonical: "/gallery",
  },
};

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
  return <GalleryPageContent items={items} />;
}
