import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import CosmicBackground from "@/components/cosmic/CosmicBackground";
import WelcomePopup from "@/components/WelcomePopup";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel" });

export const metadata: Metadata = {
  title: {
    default: "Aman Kumar - Cloud & GenAI Engineer",
    template: "%s | Aman Kumar",
  },
  description:
    "Cloud & GenAI Engineer specializing in AWS Serverless architectures, AI-powered creative tools, and scalable infrastructure.",
  keywords: [
    "Aman Kumar",
    "Full Stack Developer",
    "Cloud Engineer",
    "GenAI",
    "AWS",
    "Serverless",
    "Next.js",
    "React",
    "DevOps",
    "Portfolio",
  ],
  openGraph: {
    title: "Aman Kumar - Cloud & GenAI Engineer",
    description:
      "Cloud & GenAI Engineer building AI-powered tools and scalable serverless infrastructure on AWS.",
    url: "https://amankeshri.com",
    siteName: "Aman Kumar Portfolio",
    images: [
      {
        url: "https://amankeshri.com/aman1.png",
        width: 800,
        height: 800,
        alt: "Aman Kumar",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aman Kumar - Cloud & GenAI Engineer",
    description:
      "Cloud & GenAI Engineer building AI-powered tools and scalable serverless infrastructure on AWS.",
    images: ["https://amankeshri.com/aman1.png"],
  },
  metadataBase: new URL("https://amankeshri.com"),
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
        <ScrollProgress />
        <Navigation />
        <WelcomePopup />
        {children}
        <Footer />
      </body>
    </html>
  );
}