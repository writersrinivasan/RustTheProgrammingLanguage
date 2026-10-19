import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AIAssistant from "@/components/AIAssistant";
import { ProgressProvider } from "@/lib/progress";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "RustForge — Learn Rust, End to End",
  description:
    "An interactive Rust learning portal: concepts, nuances, history, guided roadmaps, a live playground with tests, industry case studies and a Rust-only AI tutor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen">
        <div className="aurora" aria-hidden />
        <ProgressProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
          <footer className="border-t border-white/5 py-8 text-center text-sm text-white/40">
            <p>
              RustForge · Built for curious Rustaceans 🦀 · Code runs on the official{" "}
              <a className="underline hover:text-white" href="https://play.rust-lang.org" target="_blank" rel="noreferrer">
                Rust Playground
              </a>
            </p>
          </footer>
          <AIAssistant />
        </ProgressProvider>
      </body>
    </html>
  );
}
