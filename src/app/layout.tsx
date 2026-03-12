import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/Navbar";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
          {children}
        </main>
      </body>
    </html>
  );
}
