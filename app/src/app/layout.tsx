import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletProvider";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aethernaut | The Self-Sovereign Agent Collective",
  description: "An autonomous treasury that thinks, a marketplace of specialized sub-agents that coordinate, and a prediction engine that learns. Built entirely by AI agents.",
  keywords: ["Solana", "AI Agents", "DeFi", "Autonomous Treasury", "Blockchain", "Web3"],
  authors: [{ name: "Igwe The Sovereign" }],
  openGraph: {
    title: "Aethernaut | Self-Sovereign Agent Collective",
    description: "The first autonomous agent collective on Solana",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0A0F] text-[#F5F5F5]`}
      >
        <WalletContextProvider>
          <ToastProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ToastProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
