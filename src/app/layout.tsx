import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { IdeaProvider } from "@/context/IdeaContext";
import BottomNav from "@/components/BottomNav";

import { Providers } from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "WIP - Share your App Ideas",
  description: "Share and get feedback on your mini app ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Providers>
          <IdeaProvider>
            <Header />
            <main className="container" style={{ padding: "80px 1rem 100px 1rem", minHeight: "100vh" }}>
              {children}
            </main>
            <BottomNav />
          </IdeaProvider>
        </Providers>
      </body>
    </html>
  );
}



