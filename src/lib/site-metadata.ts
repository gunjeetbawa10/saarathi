import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./constants";

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Luxury Cleaning & Property Management`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Premier property management and cleaning in Bangor and North Wales. Deep cleans, Airbnb turnovers, and executive office care — fully insured, vetted teams, eco-conscious products.",
  keywords: [
    "luxury cleaning Bangor",
    "property management North Wales",
    "Airbnb turnover cleaning",
    "executive office cleaning UK",
    "Saarathi Services",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "Expertise you can trust — your premier property management and cleaning team.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Expertise you can trust — premier property management and cleaning.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};
