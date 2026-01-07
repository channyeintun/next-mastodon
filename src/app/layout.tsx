import type { Metadata } from "next";
import { cookies } from "next/headers";
import { preconnect } from "react-dom";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { VideoSyncProvider } from "@/components/providers/VideoSyncProvider";
import SkipToMain from "@/components/atoms/SkipToMain";
import { ServiceWorkerRegister } from "@/components/atoms/ServiceWorkerRegister";
import { locales, defaultLocale, LOCALE_COOKIE_NAME, type Locale } from "@/i18n/config";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: "Next Mastodon",
  description: "Decentralized social media",
  openGraph: {
    title: "Next Mastodon",
    description: "Decentralized social media",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Mastodon",
    description: "Decentralized social media",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read auth and UI cookies on server for hydration
  const cookieStore = await cookies();
  const instanceURL = cookieStore.get('instanceURL')?.value ?? null;

  // Preconnect to user's Mastodon instance for faster API requests
  if (instanceURL) {
    preconnect(instanceURL);
  }

  const accessToken = cookieStore.get('accessToken')?.value ?? null;
  const clientId = cookieStore.get('clientId')?.value ?? null;
  // Note: clientSecret is httpOnly and not accessible from client
  const theme = cookieStore.get('theme')?.value as 'light' | 'dark' | 'auto' | undefined;

  // Read annualReportState and wrapstodonYear for SSR Wrapstodon
  const annualReportState = cookieStore.get('annualReportState')?.value as 'available' | 'generating' | 'eligible' | 'ineligible' | undefined;
  const wrapstodonYearCookie = cookieStore.get('wrapstodonYear')?.value;
  const wrapstodonYear = wrapstodonYearCookie ? parseInt(wrapstodonYearCookie, 10) : undefined;

  // Read locale from cookie, default to 'en'
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale: Locale = locales.includes(localeCookie as Locale)
    ? (localeCookie as Locale)
    : defaultLocale;

  // Get messages for current locale
  const messages = await getMessages();

  // For SSR: only set data-theme if user explicitly chose light or dark
  // If auto or undefined, let client handle it to avoid forcing wrong default
  const dataTheme = theme === 'light' || theme === 'dark' ? theme : undefined;

  const initialState = {
    auth: {
      instanceURL,
      accessToken,
      clientId,
    },
    annualReportState,
    wrapstodonYear,
  };

  return (
    <html lang={locale} data-theme={dataTheme}>
      <head>
        <meta name="theme-color" content="#6364ff" />
      </head>
      <body>
        <SkipToMain />
        <ServiceWorkerRegister />
        <QueryProvider>
          <StoreProvider initialState={initialState}>
            <ThemeProvider />
            <NextIntlClientProvider messages={messages}>
              <VideoSyncProvider>
                {children}
              </VideoSyncProvider>
            </NextIntlClientProvider>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

