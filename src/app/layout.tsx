import type { Metadata } from "next";
import { Inter, Playfair_Display, Public_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { cn } from "../lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-serif",
  weight: ["400", "700"],
  style: ["normal", "italic"]
});
const publicSans = Public_Sans({ 
  subsets: ["latin"], 
  variable: "--font-display" 
});

export const metadata: Metadata = {
  title: "One Line News | Quick Daily Updates",
  description: "Daily 10 news updates for government preparation students in one line.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(inter.variable, playfair.variable, publicSans.variable)}>
      <body className="font-display antialiased">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 geometric-accent"></div>
          <div className="absolute bottom-0 right-1/4 geometric-accent"></div>
          <div className="absolute top-1/2 left-10 w-32 h-32 rounded-full border border-white/5"></div>
          <div className="absolute bottom-10 right-20 w-64 h-64 rounded-full border border-primary/10"></div>
        </div>
        <div className="relative z-10">
          <Navbar />
          <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
