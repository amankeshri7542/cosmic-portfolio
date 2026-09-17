import { pageMetadata } from "@/lib/seo";
import AboutContent from "./AboutContent";

export const metadata = pageMetadata("/about", "About Aman Kumar", "Meet Aman Kumar, a full-stack software engineer working across business software, Rust, PostgreSQL and AWS.");

export default function AboutPage() {
  return <AboutContent />;
}
