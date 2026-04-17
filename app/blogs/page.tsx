import type { Metadata } from 'next';
import { getAllBlogs } from '@/lib/blog';
import BlogsContent from './BlogsContent';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Technical articles by Aman Kumar on cloud computing, DevOps, and AI engineering.',
};

export default function BlogsPage() {
  const blogs = getAllBlogs();
  return <BlogsContent blogs={blogs} />;
}
