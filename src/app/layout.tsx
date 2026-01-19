import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { preconnect } from "react-dom";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { VideoSyncProvider } from "@/components/providers/VideoSyncProvider";
import { KeyboardShortcutsProvider } from "@/components/providers/KeyboardShortcutsProvider";
import { GlobalModalProvider } from "@/contexts/GlobalModalContext";
import SkipToMain from "@/components/atoms/SkipToMain";
import { ServiceWorkerRegister } from "@/components/atoms/ServiceWorkerRegister";
import { locales, defaultLocale, LOCALE_COOKIE_NAME, type Locale } from "@/i18n/config";
import { isMobileDevice } from "@/utils/device";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: "Next Mastodon",
  description: "Decentralized social network",
  openGraph: {
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#6364ff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read auth and UI cookies on server for hydration
  const cookieStore = await cookies();
  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || '';
  const isMobile = isMobileDevice(userAgent);

  const instanceURL = cookieStore.get('instanceURL')?.value ?? null;

  // Resource hints for performance
  if (instanceURL) {
    const url = new URL(instanceURL);
    // Preconnect for API
    preconnect(instanceURL);

    // Preconnect and DNS prefetch for media subdomain (e.g., files.instanceUrl)
    // as clarified by the user.
    const filesURL = `${url.protocol}//files.${url.hostname}`;
    preconnect(filesURL);

    // DNS prefetch as a fallback for browsers that don't support preconnect
    // OR for secondary domains that might be used for media
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
    isMobile,
  };

  return (
    <html lang={locale} data-theme={dataTheme}>
      <head>
        {instanceURL && <link rel="dns-prefetch" href={instanceURL} />}
        {instanceURL && <link rel="dns-prefetch" href={`${new URL(instanceURL).protocol}//files.${new URL(instanceURL).hostname}`} />}
      </head>
      <body>
        <ServiceWorkerRegister />
        <QueryProvider>
          <StoreProvider initialState={initialState}>
            <ThemeProvider />
            <NextIntlClientProvider messages={messages}>
              <SkipToMain />
              <VideoSyncProvider>
                <GlobalModalProvider>
                  <KeyboardShortcutsProvider>
                    {children}
                  </KeyboardShortcutsProvider>
                </GlobalModalProvider>
              </VideoSyncProvider>
            </NextIntlClientProvider>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

