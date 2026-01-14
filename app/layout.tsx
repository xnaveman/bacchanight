import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TransitionProvider } from "./components/TransitionContext";
import TransitionOverlay from "./components/TransitionOverlay";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bacchanight Jeu",
  description: "Jeu pour la soirée Bacchanight",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TransitionProvider>
          <TransitionOverlay />
          {children}
        </TransitionProvider>
      </body>
    </html>
  );
}
