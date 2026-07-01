import "./globals.css";

export const metadata = {
  title: "Competitive Analysis - AI Market Radar",
  description:
    "A runnable market-intelligence workflow that collects public AI signals, clusters market moves, and writes weekly competitive analysis briefs.",
  applicationName: "Competitive Analysis",
  authors: [{ name: "KTLYST Labs" }],
  creator: "KTLYST Labs",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "Competitive Analysis",
    title: "Competitive Analysis - AI Market Radar",
    description:
      "Track AI repos, model releases, agents, research, and builder chatter without turning the feed into a pile of summaries.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
