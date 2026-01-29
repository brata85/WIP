import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { IdeaProvider } from "@/context/IdeaContext";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IdeaCast - Share your App Ideas",
  description: "Share and get feedback on your mini app ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <IdeaProvider>
          <Header />
          <main className="container" style={{ padding: "80px 1rem 100px 1rem", minHeight: "100vh" }}>
            {children}
          </main>
          <BottomNav />
        </IdeaProvider>
      </body>
    </html>
  );
}



