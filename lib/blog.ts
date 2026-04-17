import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOGS_DIR = path.join(process.cwd(), 'app', 'blogs');

export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export interface BlogPost extends BlogMeta {
  content: string;
}

function extractTitleFromContent(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function extractExcerptFromContent(content: string): string {
  // Remove the h1 title line, then grab the first non-empty, non-heading paragraph
  const lines = content.split('\n');
  let found = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---')) continue;
    if (!found) { found = true; }
    if (trimmed.length > 30) return trimmed.slice(0, 160) + (trimmed.length > 160 ? '…' : '');
  }
  return '';
}

export function getAllBlogs(): BlogMeta[] {
  const files = fs.readdirSync(BLOGS_DIR).filter((f) => f.endsWith('.md'));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(BLOGS_DIR, filename), 'utf-8');
      const { data, content } = matter(raw);

      const title = data.title || extractTitleFromContent(content);
      const excerpt = data.excerpt || extractExcerptFromContent(content);
      const date = data.date
        ? new Date(data.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'No date';

      return { slug, title, date, excerpt };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getBlogBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOGS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  const title = data.title || extractTitleFromContent(content);
  const excerpt = data.excerpt || extractExcerptFromContent(content);
  const date = data.date
    ? new Date(data.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'No date';

  return { slug, title, date, excerpt, content };
}
