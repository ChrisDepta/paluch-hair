import type { Metadata } from "next";
import { Lora, Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito_Sans({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://paluch-hair.pl"),
  title: {
    default: "Paluch Hair | Fryzjer Wroclaw",
    template: "%s | Paluch Hair",
  },
  applicationName: "Paluch Hair",
  description:
    "Paluch Hair we Wroclawiu przy ul. Sztabowej. Profesjonalny salon fryzjerski z wieloletnim doswiadczeniem: strzyzenie, koloryzacja, balayaz i stylizacja.",
  keywords: [
    "fryzjer Wroclaw",
    "salon fryzjerski Wroclaw",
    "Paluch Hair",
    "strzyzenie Wroclaw",
    "koloryzacja Wroclaw",
    "balayaz Wroclaw",
    "Sztabowa Wroclaw",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://paluch-hair.pl",
    siteName: "Paluch Hair",
    title: "Paluch Hair | Fryzjer Wroclaw",
    description:
      "Profesjonalny salon fryzjerski we Wroclawiu przy ul. Sztabowej. Strzyzenie, koloryzacja, balayaz i stylizacja.",
    images: [
      {
        url: "/annmariephotography-barbershop-4484297_1920.jpg",
        width: 1920,
        height: 1280,
        alt: "Paluch Hair - salon fryzjerski we Wroclawiu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paluch Hair | Fryzjer Wroclaw",
    description:
      "Profesjonalny salon fryzjerski we Wroclawiu przy ul. Sztabowej. Strzyzenie, koloryzacja, balayaz i stylizacja.",
    images: ["/annmariephotography-barbershop-4484297_1920.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: "Paluch Hair",
  url: "https://paluch-hair.pl",
  telephone: "+48717964664",
  image: "https://paluch-hair.pl/annmariephotography-barbershop-4484297_1920.jpg",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Sztabowa 6/8",
    postalCode: "53-327",
    addressLocality: "Wroclaw",
    addressCountry: "PL",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "14:00",
    },
  ],
  priceRange: "PLN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" data-scroll-behavior="smooth" className={`${nunito.variable} ${lora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        {children}
      </body>
    </html>
  );
}
