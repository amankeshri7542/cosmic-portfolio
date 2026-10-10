"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, placeholder, drawSelection, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting, bracketMatching } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

export type EditorHandle = {
  insert: (text: string) => void;
  wrap: (before: string, after?: string, fallback?: string) => void;
  linePrefix: (prefix: string) => void;
  focus: () => void;
  getSelection: () => string;
};

type Props = {
  docKey: string; // re-create the editor when switching articles
  initial: string;
  onChange: (value: string) => void;
  onImages: (files: File[]) => void;
  label: string;
};

const style = HighlightStyle.define([
  { tag: t.heading1, fontFamily: "var(--font-display)", fontSize: "1.5em", color: "var(--ink)" },
  { tag: t.heading2, fontFamily: "var(--font-display)", fontSize: "1.32em", color: "var(--ink)" },
  { tag: t.heading3, fontFamily: "var(--font-display)", fontSize: "1.16em", color: "var(--ink)" },
  { tag: t.strong, fontWeight: "700", color: "var(--ink)" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.link, color: "var(--code-token-keyword)", textDecoration: "underline" },
  { tag: t.url, color: "var(--ink-3)" },
  { tag: t.monospace, fontFamily: "var(--font-mono)", color: "var(--code-token-string)" },
  { tag: t.quote, color: "var(--ink-2)", fontStyle: "italic" },
  { tag: [t.processingInstruction, t.meta], color: "var(--ink-3)" },
  { tag: t.list, color: "var(--ink-2)" },
]);

const theme = EditorView.theme({
  "&": { height: "100%", fontSize: "1.02rem", color: "var(--ink)", backgroundColor: "transparent" },
  ".cm-scroller": { fontFamily: "var(--font-text)", lineHeight: "1.7", padding: "1.25rem 0" },
  ".cm-content": { maxWidth: "46rem", margin: "0 auto", padding: "0 1.25rem 40vh", caretColor: "var(--paper)" },
  ".cm-cursor": { borderLeftColor: "var(--paper)", borderLeftWidth: "2px" },
  "&.cm-focused": { outline: "none" },
  ".cm-activeLine": { backgroundColor: "color-mix(in oklab, var(--paper) 4%, transparent)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": { backgroundColor: "color-mix(in oklab, var(--paper) 22%, transparent) !important" },
  ".cm-placeholder": { color: "var(--ink-3)" },
  ".cm-panels": { backgroundColor: "var(--deep)", color: "var(--ink)", borderColor: "var(--line)" },
  ".cm-searchMatch": { backgroundColor: "color-mix(in oklab, var(--ferric) 30%, transparent)" },
});

export const MarkdownEditor = forwardRef<EditorHandle, Props>(function MarkdownEditor({ docKey, initial, onChange, onImages, label }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const cb = useRef({ onChange, onImages });
  cb.current = { onChange, onImages };

  useEffect(() => {
    if (!host.current) return;
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initial,
        extensions: [
          history(),
          drawSelection(),
          highlightActiveLine(),
          highlightSelectionMatches(),
          bracketMatching(),
          EditorView.lineWrapping,
          markdown({ base: markdownLanguage }),
          syntaxHighlighting(style),
          theme,
          placeholder("Start writing. Markdown works: ## for a heading, **bold**, `code`, ``` for a code block. Paste or drop images."),
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
          EditorView.contentAttributes.of({ "aria-label": label, "aria-multiline": "true", spellcheck: "true" }),
          EditorView.updateListener.of((u) => { if (u.docChanged) cb.current.onChange(u.state.doc.toString()); }),
          EditorView.domEventHandlers({
            paste(e) {
              const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
              if (!files.length) return false;
              e.preventDefault();
              cb.current.onImages(files);
              return true;
            },
            drop(e, v) {
              const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => f.type.startsWith("image/"));
              if (!files.length) return false;
              e.preventDefault();
              const pos = v.posAtCoords({ x: e.clientX, y: e.clientY });
              if (pos != null) v.dispatch({ selection: { anchor: pos } });
              cb.current.onImages(files);
              return true;
            },
          }),
        ],
      }),
    });
    view.current = v;
    return () => { v.destroy(); view.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docKey]);

  useImperativeHandle(ref, () => ({
    insert(text) {
      const v = view.current;
      if (!v) return;
      const { from, to } = v.state.selection.main;
      const line = v.state.doc.lineAt(from);
      const needsBreak = text.startsWith("\n") || line.text.trim() === "" ? "" : "\n\n";
      v.dispatch({ changes: { from, to, insert: needsBreak + text }, selection: { anchor: from + needsBreak.length + text.length } });
      v.focus();
    },
    wrap(before, after = before, fallback = "text") {
      const v = view.current;
      if (!v) return;
      const { from, to } = v.state.selection.main;
      const selected = v.state.sliceDoc(from, to) || fallback;
      v.dispatch({
        changes: { from, to, insert: before + selected + after },
        selection: { anchor: from + before.length, head: from + before.length + selected.length },
      });
      v.focus();
    },
    linePrefix(prefix) {
      const v = view.current;
      if (!v) return;
      const { from, to } = v.state.selection.main;
      const changes = [];
      for (let pos = from; pos <= to; ) {
        const line = v.state.doc.lineAt(pos);
        const existing = line.text.match(/^(#{1,6} |> |- |\d+\. )/)?.[0] ?? "";
        changes.push({ from: line.from, to: line.from + existing.length, insert: existing === prefix ? "" : prefix });
        pos = line.to + 1;
      }
      v.dispatch({ changes });
      v.focus();
    },
    focus: () => view.current?.focus(),
    getSelection() {
      const v = view.current;
      if (!v) return "";
      const { from, to } = v.state.selection.main;
      return v.state.sliceDoc(from, to);
    },
  }));

  return <div ref={host} className="md-editor" data-lenis-prevent />;
});
