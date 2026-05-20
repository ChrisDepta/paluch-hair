import type { Metadata } from "next";
import { SalonLanding } from "@/components/SalonLanding";

export const metadata: Metadata = {
  title: "Fryzjer Wroclaw",
  description:
    "Paluch Hair we Wroclawiu przy ul. Sztabowej. Profesjonalne strzyzenie, koloryzacja, balayaz i stylizacja. Rezerwacja telefoniczna.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <SalonLanding />;
}
