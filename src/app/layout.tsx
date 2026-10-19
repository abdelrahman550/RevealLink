import type { Metadata, Viewport } from "next";
import { Inter, Unbounded } from "next/font/google";

import { Providers } from "@/components/providers";
import { WinkBackdrop } from "@/components/layout/wink-backdrop";
import { APP_DESCRIPTION, APP_NAME, APP_URL } from "@/lib/constants";

import "./globals.css";

/**
 * Two voices:
 *  - Unbounded: loud, flat display type for the logo, headings and buttons.
 *  - Inter: message text, body copy and the small tracked labels.
 */
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Anonymous messages, revealed on your terms`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  authors: [{ name: APP_NAME }],
  keywords: ["anonymous messages", "identity reveal", "private inbox", APP_NAME],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — Anonymous messages, revealed on your terms`,
    description: APP_DESCRIPTION,
    url: APP_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Anonymous messages, revealed on your terms`,
    description: APP_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0c0508",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${unbounded.variable} ${inter.variable}`}
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <WinkBackdrop />

        <a
          href="#main"
          className="sr-only rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to content
        </a>

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
