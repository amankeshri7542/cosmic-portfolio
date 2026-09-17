/* Author-supplied image URLs load in the browser, avoiding server-side fetches of arbitrary URLs. */
/* eslint-disable @next/next/no-img-element */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownArticle({ content }: { content: string }) {
  return <div className="article-body"><ReactMarkdown skipHtml remarkPlugins={[remarkGfm]} components={{
    h1: ({ children }) => <h2>{children}</h2>,
    img: ({ src, alt }) => <img src={src} alt={alt || ""} loading="lazy" decoding="async" referrerPolicy="no-referrer" />,
  }}>{content.replace(/^\s*# .+\r?\n/, "")}</ReactMarkdown></div>;
}
