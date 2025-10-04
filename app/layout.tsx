import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import CosmicBackground from "@/components/cosmic/CosmicBackground";

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
      <body className="antialiased">
        <CosmicBackground />
        <Navigation />
        {children}
      </body>
    </html>
  );
}