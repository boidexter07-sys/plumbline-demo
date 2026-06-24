import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const HAS_CLERK = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://boidexter07-sys.github.io/plumbline-demo/"),
  title: {
    default: "Plumbline — A driver's-seat view of your investments.",
    template: "%s — Plumbline",
  },
  description:
    "Plumbline is calm guidance for noisy markets. See your investments clearly. Understand what they mean. Built for Canadian investors, $4.99 CAD/mo after a 7-day free trial.",
  applicationName: "Plumbline",
  authors: [{ name: "Plumbline, Inc." }],
  keywords: [
    "Plumbline",
    "Pulse",
    "investments",
    "portfolio",
    "Canadian investors",
    "calm guidance",
  ],
  openGraph: {
    type: "website",
    siteName: "Plumbline",
    locale: "en_CA",
    url: "https://boidexter07-sys.github.io/plumbline-demo/",
    title: "Plumbline — A driver's-seat view of your investments.",
    description:
      "See your investments clearly. Understand what they mean. Calm guidance for the active Canadian investor. $4.99 CAD/mo after a 7-day free trial.",
    images: [
      {
        url: "/plumbline-demo/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Plumbline — A driver's-seat view of your investments.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plumbline — A driver's-seat view of your investments.",
    description:
      "See your investments clearly. Understand what they mean. Calm guidance for the active Canadian investor.",
    images: ["/plumbline-demo/assets/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: "#F5F1E8",
  colorScheme: "light",
  icons: {
    icon: "/plumbline-demo/assets/favicon-32.png",
    apple: "/plumbline-demo/assets/app-icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Phase 1: ClerkProvider is only active when Clerk env is provisioned.
  // Static export on GitHub Pages ships with no Clerk env, so the children
  // render without a provider and <RequireAuth /> shows its "not signed in"
  // gate (which is the correct Phase 1 behaviour). When Phase 2 provisions
  // Clerk keys, this branch becomes the only rendered path automatically.
  const tree = (
    <html lang="en-CA" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
  return HAS_CLERK ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
