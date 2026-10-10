// One Markdown pipeline for the public article and the editor preview, so a preview is exactly
// what ships. Raw HTML in Markdown is dropped (no rehype-raw), so authored content can't inject markup.
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit, SKIP } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Element, ElementContent, Root, Parent } from "hast";
import type { Root as MdRoot } from "mdast";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { createCssVariablesTheme } from "@shikijs/core";

export type ImageInfo = { width: number; height: number; lqip?: string };
export type TocEntry = { id: string; text: string; depth: 2 | 3 };
export type Rendered = { html: string; toc: TocEntry[] };

const theme = createCssVariablesTheme({ name: "cyanotype", variablePrefix: "--code-", fontStyle: true });

let highlighter: Promise<HighlighterCore> | null = null;
function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [theme],
    langs: [
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/javascript"),
      import("@shikijs/langs/json"),
      import("@shikijs/langs/bash"),
      import("@shikijs/langs/sql"),
      import("@shikijs/langs/rust"),
      import("@shikijs/langs/python"),
      import("@shikijs/langs/yaml"),
      import("@shikijs/langs/diff"),
      import("@shikijs/langs/css"),
      import("@shikijs/langs/html"),
      import("@shikijs/langs/markdown"),
    ],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

const ALIASES: Record<string, string> = { ts: "typescript", js: "javascript", sh: "bash", shell: "bash", zsh: "bash", py: "python", rs: "rust", yml: "yaml", md: "markdown" };

type Options = { images?: Record<string, ImageInfo>; siteHost?: string };

function rehypeArticle(opts: Options, hl: HighlighterCore, toc: TocEntry[]) {
  const loaded = new Set(hl.getLoadedLanguages());
  return () => (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent: Parent | undefined) => {
      // Headings: collect the table of contents and add a quiet self-link.
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties?.id) {
        const id = String(node.properties.id);
        toc.push({ id, text: toString(node), depth: node.tagName === "h2" ? 2 : 3 });
        node.children.push({
          type: "element",
          tagName: "a",
          properties: { href: `#${id}`, className: ["anchor"], ariaLabel: `Link to “${toString(node)}”` },
          children: [{ type: "text", value: "#" }],
        });
      }

      // Links and images: only http(s), mailto, tel and relative/fragment URLs survive (no javascript:, data:, …).
      for (const attr of ["href", "src"] as const) {
        const v = node.properties?.[attr];
        if (typeof v === "string" && !/^(https?:|mailto:|tel:|\/|#|\.\/|\.\.\/)/i.test(v.trim()) && /^[a-z][a-z0-9+.-]*:/i.test(v.trim())) {
          delete node.properties[attr];
        }
      }

      // Links: open external links safely; keep internal links as-is.
      if (node.tagName === "a" && typeof node.properties?.href === "string") {
        const href = node.properties.href;
        if (/^https?:\/\//.test(href) && !(opts.siteHost && href.includes(opts.siteHost))) {
          node.properties.rel = ["noopener", "noreferrer"];
          node.properties.target = "_blank";
        }
      }

      // Images: reserve their space (no layout shift), lazy-load, and turn a title into a caption.
      if (node.tagName === "img" && parent && typeof index === "number") {
        const src = String(node.properties?.src ?? "");
        const info = opts.images?.[src];
        node.properties = {
          ...node.properties,
          loading: "lazy",
          decoding: "async",
          ...(info ? { width: info.width, height: info.height } : {}),
          ...(info?.lqip ? { style: `background-image:url(${info.lqip});background-size:cover` } : {}),
        };
        const title = node.properties.title;
        if (title && parent.type === "element" && (parent as Element).tagName === "p" && parent.children.length === 1) {
          delete node.properties.title;
          const figure: Element = {
            type: "element",
            tagName: "figure",
            properties: {},
            children: [node, { type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: String(title) }] }],
          };
          (parent as Element).tagName = "div";
          (parent as Element).properties = { className: ["figure-wrap"] };
          parent.children[index] = figure;
          return SKIP;
        }
      }

      // Code blocks: highlight with the cyanotype palette (CSS variables, so Paper mode works too).
      if (node.tagName === "pre" && node.children[0]?.type === "element" && (node.children[0] as Element).tagName === "code" && parent && typeof index === "number") {
        const code = node.children[0] as Element;
        const cls = (code.properties?.className as string[] | undefined)?.find((c) => c.startsWith("language-"));
        const raw = cls?.slice(9).toLowerCase() ?? "";
        const lang = ALIASES[raw] ?? raw;
        const text = toString(code).replace(/\n$/, "");
        const highlighted = loaded.has(lang)
          ? (hl.codeToHast(text, { lang, theme: "cyanotype" }).children[0] as Element)
          : ({ type: "element", tagName: "pre", properties: { className: ["shiki"] }, children: [{ type: "element", tagName: "code", properties: {}, children: [{ type: "text", value: text }] }] } as Element);
        highlighted.properties = { ...highlighted.properties, tabIndex: 0, dataLang: lang || "text" };
        const wrapper: Element = {
          type: "element",
          tagName: "div",
          properties: { className: ["code-block"] },
          children: [
            ...(lang ? [{ type: "element", tagName: "span", properties: { className: ["code-lang"], ariaHidden: "true" }, children: [{ type: "text", value: lang }] } as ElementContent] : []),
            highlighted,
          ],
        };
        parent.children[index] = wrapper;
        return SKIP;
      }

      // Tables scroll horizontally on small screens instead of overflowing the page.
      if (node.tagName === "table" && parent && typeof index === "number") {
        parent.children[index] = { type: "element", tagName: "div", properties: { className: ["table-wrap"], tabIndex: 0 }, children: [node] };
        return SKIP;
      }
    });
  };
}

/** Drop a leading `# Title` — the page renders the title itself. */
function normalise(md: string) {
  return md.replace(/^\s*#\s+[^\n]+\n+/, "");
}

/** Shift headings so the article's top level is always h2 and levels never skip (h2 → h3 → h4). */
function remarkHeadingLevels() {
  return (tree: MdRoot) => {
    const depths: number[] = [];
    visit(tree as never, "heading", (n: { depth: number }) => { depths.push(n.depth); });
    if (!depths.length) return;
    const present = [...new Set(depths)].sort((a, b) => a - b);
    const map = new Map(present.map((d, i) => [d, Math.min(6, 2 + i)]));
    visit(tree as never, "heading", (n: { depth: number }) => { n.depth = map.get(n.depth) ?? n.depth; });
  };
}

export async function renderMarkdown(markdown: string, opts: Options = {}): Promise<Rendered> {
  const hl = await getHighlighter();
  const toc: TocEntry[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHeadingLevels)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeArticle(opts, hl, toc))
    .use(rehypeStringify)
    .process(normalise(markdown));
  return { html: String(file), toc };
}

/** Highlight one code sample with the site's palette (server-only; used for the story's "Read the code"). */
export async function highlightCode(code: string, lang: string) {
  const hl = await getHighlighter();
  const l = ALIASES[lang] ?? lang;
  return hl.codeToHtml(code.trim(), { lang: hl.getLoadedLanguages().includes(l) ? l : "text", theme: "cyanotype" });
}
