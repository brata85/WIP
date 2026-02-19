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
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          opacity: 0.15,
          filter: 'blur(8px)',
          backgroundImage: 'url(/logo.png)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          transform: 'scale(1.5)' // Slightly larger than screen to ensure coverage with blur
        }} />
        <Providers>
          <IdeaProvider>
            <Header />
            <main className="container" style={{ padding: "80px 1rem 100px 1rem", minHeight: "100vh", position: "relative", zIndex: 1 }}>
              {children}
            </main>
            <BottomNav />
          </IdeaProvider>
        </Providers>
      </body>
    </html>
  );
}



