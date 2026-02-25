import type { Metadata } from 'next';
import WorkContent from './WorkContent';

export const metadata: Metadata = {
  title: 'Work & Projects',
  description:
    'Explore projects by Aman Kumar — AI assistants, e-commerce platforms, serverless systems, and more.',
};

export default function WorkPage() {
  return <WorkContent />;
}