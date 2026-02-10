import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import CosmicBackground from "@/components/cosmic/CosmicBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });

export const metadata: Metadata = {
  title: "Aman Kumar - Full Stack Developer",
  description: "MERN Full Stack Developer specializing in secure, scalable applications with cloud-native deployments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable} antialiased font-sans bg-cosmic-void text-gray-200`}>
        <CosmicBackground />
        <Navigation />
        {children}
      </body>
    </html>
  );
}