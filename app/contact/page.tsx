import type { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Aman Kumar for freelance projects, full-time opportunities, or technical consultations.',
};

export default function ContactPage() {
  return <ContactContent />;
}