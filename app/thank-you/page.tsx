import type { Metadata } from 'next';
import ThankYouContent from './ThankYouContent';

export const metadata: Metadata = {
    title: 'Thank you',
    robots: { index: false, follow: false },
    description: 'Thank you for reaching out. I will get back to you soon.',
};

export default function ThankYouPage() {
    return <ThankYouContent />;
}
