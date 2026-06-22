import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";

import type { Metadata } from "next";

import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "@/components/global/ThemeProvider";

import "~~/styles/globals.css";
import Providers from "./providers";

export const metadata: Metadata = {

  title: {
    default: "Team Chain",
    template: "%s | Team Chain",
  },

  description:
    "Build trusted teams through GitHub reputation, transparent contributions, and stake-backed accountability. Team Chain helps developers collaborate with confidence.",

  keywords: [
    "Team Chain",
    "Web3",
    "GitHub",
    "Freelance",
    "DAO",
    "Developer Reputation",
    "On-Chain Reputation",
    "Stake",
    "Open Source",
    "Blockchain",
    "Collaboration",
    "Team Formation",
  ],

  authors: [
    {
      name: "Team Chain",
    },
  ],

  creator: "Team Chain",

  openGraph: {
    title: "Team Chain",
    description:
      "Build trusted teams through GitHub reputation and stake-backed accountability.",

    url: "https://teamchain.xyz",

    siteName: "Team Chain",

    type: "website",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Team Chain",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Team Chain",

    description:
      "Build trusted teams through GitHub reputation and stake-backed accountability.",

    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <Providers>
            <ScaffoldEthAppWithProviders>
              {children}
            </ScaffoldEthAppWithProviders>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}