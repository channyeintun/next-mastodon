import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ScrollRestorationProvider } from "@/components/providers/ScrollRestorationProvider";
import { AuthModal } from "@/components/molecules";
import NavigationWrapper from "@/components/organisms/NavigationWrapper";
import { GlobalModalProvider } from "@/contexts/GlobalModalContext";
import { GlobalModalRenderer } from "@/components/organisms/GlobalModalRenderer";

export const metadata: Metadata = {
  title: "Mastodon",
  description: "A minimal, performant social media frontend for Mastodon",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read auth and UI cookies on server for hydration
  const cookieStore = await cookies();
  const instanceURL = cookieStore.get('instanceURL')?.value ?? null;
  const accessToken = cookieStore.get('accessToken')?.value ?? null;
  const clientId = cookieStore.get('clientId')?.value ?? null;
  const clientSecret = cookieStore.get('clientSecret')?.value ?? null;
  const theme = cookieStore.get('theme')?.value as 'light' | 'dark' | 'auto' | undefined;

  const initialState = {
    auth: {
      instanceURL,
      accessToken,
      clientId,
      clientSecret,
    },
    theme: theme ?? 'auto',
  };

  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <StoreProvider initialState={initialState}>
            <GlobalModalProvider>
              <ScrollRestorationProvider />
              <NavigationWrapper />
              {children}
              <GlobalModalRenderer />
              <AuthModal />
            </GlobalModalProvider>
          </StoreProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
