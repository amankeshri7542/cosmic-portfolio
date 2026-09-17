export interface BlogMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  sample: boolean;
  dateISO: string;
  modifiedISO?: string;
  cover?: string;
  coverAlt?: string;
}
export interface BlogPost extends BlogMeta { content: string }
export interface EditorPost {
  slug: string;
  draft: BlogPost;
  published: BlogPost | null;
  version: number;
}
