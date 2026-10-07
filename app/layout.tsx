import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

// Inter is a variable font — no weight array (same rule as Fraunces before it)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SkillBridge — Get hired for your skills, not your college name",
    template: "%s · SkillBridge",
  },
  description:
    "Skill roadmaps, verified skill tests, and skill-based hiring for tier 2/3 college students in India. Learn, prove, get discovered. Free forever for students.",
  keywords: [
    "skill-based hiring",
    "tier 3 college placements",
    "skill roadmap",
    "verified skill tests",
    "off campus jobs india",
    "fresher jobs",
  ],
  openGraph: {
    type: "website",
    siteName: "SkillBridge",
    title: "SkillBridge — Get hired for your skills, not your college name",
    description:
      "Structured roadmaps, verified skill tests, and skill-first hiring for tier 2/3 college students. Free forever for students.",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillBridge — Get hired for your skills, not your college name",
    description:
      "Structured roadmaps, verified skill tests, and skill-first hiring for tier 2/3 college students.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="min-h-screen font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
