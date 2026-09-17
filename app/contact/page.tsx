import { pageMetadata } from "@/lib/seo";
import ContactContent from './ContactContent';

export const metadata = pageMetadata("/contact", "Contact Aman Kumar", "Talk with Aman Kumar about software engineering, projects and collaboration. Based in Bengaluru, India.");

export default function ContactPage() {
  return <ContactContent />;
}