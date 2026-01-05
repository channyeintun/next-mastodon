import type { Metadata } from "next";
import { cookies } from "next/headers";
import { preconnect } from "react-dom";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { VideoSyncProvider } from "@/components/providers/VideoSyncProvider";
import SkipToMain from "@/components/atoms/SkipToMain";
import { ServiceWorkerRegister } from "@/components/atoms/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Mastodon",
  description: "Decentralized social media",
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
  const clientSecret = cookieStore.get('clientSecret')?.value ?? null;
  const theme = cookieStore.get('theme')?.value as 'light' | 'dark' | 'auto' | undefined;

  // Read annualReportState and wrapstodonYear for SSR Wrapstodon
  const annualReportState = cookieStore.get('annualReportState')?.value as 'available' | 'generating' | 'eligible' | 'ineligible' | undefined;
  const wrapstodonYearCookie = cookieStore.get('wrapstodonYear')?.value;
  const wrapstodonYear = wrapstodonYearCookie ? parseInt(wrapstodonYearCookie, 10) : undefined;

  // For SSR: only set data-theme if user explicitly chose light or dark
  // If auto or undefined, let client handle it to avoid forcing wrong default
  const dataTheme = theme === 'light' || theme === 'dark' ? theme : undefined;

  const initialState = {
    auth: {
      instanceURL,
      accessToken,
      clientId,
      clientSecret,
    },
    annualReportState,
    wrapstodonYear,
  };

  return (
    <html lang="en" data-theme={dataTheme}>
      <head>
        <meta name="theme-color" content="#6364ff" />
      </head>
      <body>
        <SkipToMain />
        <ServiceWorkerRegister />
        <QueryProvider>
          <StoreProvider initialState={initialState}>
            <ThemeProvider />
            <VideoSyncProvider>
              {children}
            </VideoSyncProvider>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

