import { pageMetadata } from "@/lib/seo";
import WorkContent from './WorkContent';

export const metadata = pageMetadata("/work", "Software engineering projects", "Explore Aman Kumar’s business software, procurement workflows, real-time systems, cloud projects and independent experiments.");

export default function WorkPage() {
  return <WorkContent />;
}