import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { AuthProvider } from "./Providers";
import { AIWidget } from "@/app/chat/components/AIWidget";
import { Navbar } from "./components/Navbar";
import "./globals.css";

// Load Figtree font
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "FilmOdyssey",
  description: "Your cinematic journey starts here",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${figtree.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
          {/* Add AI Widget to all pages */}
          <AIWidget />
        </AuthProvider>
      </body>
    </html>
  );
}