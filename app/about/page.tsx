import type { Metadata } from 'next';
import AboutContent from './AboutContent';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Aman Kumar — Cloud & GenAI Engineer specializing in AWS Serverless, AI-powered tools, and scalable infrastructure.',
};

export default function AboutPage() {
  return <AboutContent />;
}