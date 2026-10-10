"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PostBody } from "@/lib/post-types";
import { slugify, validSlug, wordCount } from "@/lib/post-types";
import { api, ApiError, uploadImage, type EditorPost, type ListItem, type Media, type Revision } from "./api";
import { mirror, sameDraft, type Mirror } from "./mirror";
import { useAutosave, type SaveState } from "./useAutosave";
import { MarkdownEditor, type EditorHandle } from "./MarkdownEditor";
import { publishChecks } from "./checks";
import { Login } from "./Login";
import article from "../blog/Article.module.css";
import s from "./write.module.css";

type Mode = "write" | "split" | "preview";
type Panel = null | "media" | "revisions";
type Dialog =
  | null
  | { kind: "publish" }
  | { kind: "unpublish" }
  | { kind: "delete" }
  | { kind: "alt"; files: File[]; forCover?: boolean };

const time = (d: number | string) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const day = (d: string) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function Desk() {
  const [auth, setAuth] = useState<"checking" | "in" | "out">("checking");
  const [authReason, setAuthReason] = useState<string>();
  const [posts, setPosts] = useState<ListItem[]>([]);
  const [post, setPost] = useState<EditorPost | null>(null);
  const [draft, setDraft] = useState<PostBody | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [mode, setMode] = useState<Mode>("split");
  const [panel, setPanel] = useState<Panel>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [details, setDetails] = useState(true);
  const [recover, setRecover] = useState<Mirror | null>(null);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [storage, setStorage] = useState<{ driver: "blob" | "local" | "none"; prefix: string }>({ driver: "none", prefix: "" });
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [preview, setPreview] = useState<{ html: string; words: number } | null>(null);
  const [previewLink, setPreviewLink] = useState<string>("");
  const [listOpen, setListOpen] = useState(true);
  const [docRev, setDocRev] = useState(0); // bump to reload the editor's text from `draft`
  const editor = useRef<EditorHandle>(null);
  const tabId = useRef("");
  const channel = useRef<BroadcastChannel | null>(null);

  const say = useCallback((m: string) => {
    setToast(m);
    window.setTimeout(() => setToast((t) => (t === m ? "" : t)), 6000);
  }, []);

  const onSaved = useCallback((r: { version: number; updatedAt: string; slug?: string }) => {
    setPost((p) => (p ? { ...p, version: r.version, updatedAt: r.updatedAt, slug: r.slug ?? p.slug, status: p.published ? "changed" : "draft" } : p));
    setPosts((list) => list.map((i) => (i.id === post?.id ? { ...i, updatedAt: r.updatedAt, version: r.version, slug: r.slug ?? i.slug, title: draft?.title || i.title, status: i.status === "draft" ? "draft" : "changed" } : i)));
  }, [post?.id, draft?.title]);

  const save = useAutosave(post, draft, onSaved);

  // ── session ──
  const refreshList = useCallback(async () => {
    try { setPosts(await api.list()); } catch (e) { if (e instanceof ApiError && e.status === 401) setAuth("out"); }
  }, []);

  useEffect(() => {
    api.session()
      .then((r) => {
        if (r.configured === false) setAuthReason("Publishing isn't configured here yet: the server needs a database and an editor password hash.");
        setAuth(r.authenticated ? "in" : "out");
      })
      .catch(() => setAuth("out"));
  }, []);

  useEffect(() => {
    if (auth !== "in") return;
    api.list().then(setPosts).catch((e) => { if (e instanceof ApiError && e.status === 401) setAuth("out"); });
    api.media().then((r) => { setMedia(r.media); setStorage({ driver: r.driver, prefix: r.prefix }); }).catch(() => {});
  }, [auth]);


  // ── one tab writes at a time ──
  useEffect(() => {
    if (!tabId.current) tabId.current = crypto.randomUUID();
    const ch = new BroadcastChannel("ak-writer");
    channel.current = ch;
    ch.onmessage = (e) => {
      const m = e.data as { type: string; id: string; tab: string };
      if (m.tab === tabId.current || !post || m.id !== post.id) return;
      if (m.type === "open") setPaused(true);
    };
    return () => ch.close();
  }, [post]);

  const claim = useCallback((id: string) => channel.current?.postMessage({ type: "open", id, tab: tabId.current }), []);

  // ── open / create ──
  async function open(id: string) {
    if (post && !(await save.flush())) {
      if (!confirm("The current article hasn't saved yet. It's kept on this device. Open the other article anyway?")) return;
    }
    setBusy(true);
    try {
      const p = await api.get(id);
      setPost(p);
      setDraft(p.draft);
      setDocRev((n) => n + 1);
      setDetails(false);
      setSlugTouched(true);
      setPreviewLink("");
      setPaused(false);
      claim(p.id);
      const local = await mirror.get(p.id);
      if (local && !sameDraft(local.draft, p.draft) && local.savedAt > Date.parse(p.updatedAt)) setRecover(local);
      else setRecover(null);
      if (window.innerWidth < 900) setListOpen(false);
    } catch (e) {
      say(e instanceof Error ? e.message : "Couldn't open that article.");
    } finally {
      setBusy(false);
    }
  }

  async function create() {
    setBusy(true);
    try {
      const p = await api.create();
      setPosts((l) => [{ id: p.id, slug: p.slug, title: p.draft.title, status: "draft", updatedAt: p.updatedAt, version: p.version }, ...l]);
      setPost(p);
      setDraft(p.draft);
      setSlugTouched(false);
      setRecover(null);
      setDetails(true);
      claim(p.id);
      requestAnimationFrame(() => document.getElementById("f-title")?.focus());
    } catch (e) {
      say(e instanceof Error ? e.message : "Couldn't start a new article.");
    } finally {
      setBusy(false);
    }
  }

  // ── editing ──
  const update = useCallback((patch: Partial<PostBody>) => {
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, ...patch };
      save.touch(next);
      return next;
    });
  }, [save]);

  function setTitle(title: string) {
    const neverPublished = !post?.published && !post?.firstPublishedAt;
    update(neverPublished && !slugTouched ? { title, slug: slugify(title) || draft?.slug } : { title });
  }

  // ── preview rendering (same pipeline as the public article) ──
  useEffect(() => {
    if (!draft || mode === "write") return;
    const t = window.setTimeout(() => {
      api.render(draft.content).then(setPreview).catch(() => {});
    }, 350);
    return () => window.clearTimeout(t);
  }, [draft?.content, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── keyboard ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); void save.flush(true).then((ok) => ok && say("Saved — revision kept.")); }
      if (mod && e.shiftKey && e.key.toLowerCase() === "p") { e.preventDefault(); if (post) setDialog({ kind: "publish" }); } // the dialog itself shows if nothing changed
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, post, say]);

  // ── images ──
  async function uploadAll(files: File[], alt: string, caption: string, forCover?: boolean) {
    setDialog(null);
    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) { say(`${file.name} is larger than 8 MB. Resize it and try again.`); continue; }
      say(`Uploading ${file.name}…`);
      try {
        const m = await uploadImage(file, alt, storage.driver, storage.prefix);
        setMedia((list) => [m, ...list]);
        if (forCover) update({ cover: m.url, coverAlt: alt, coverWidth: m.width ?? undefined, coverHeight: m.height ?? undefined });
        else editor.current?.insert(`![${alt}](${m.url}${caption ? ` "${caption.replace(/"/g, "'")}"` : ""})\n`);
        say(`Added ${file.name}.`);
      } catch (e) {
        say(e instanceof Error ? `Upload failed: ${e.message}` : "Upload failed.");
      }
    }
  }

  // ── lifecycle ──
  async function doPublish() {
    if (!post || !draft) return;
    setBusy(true);
    try {
      if (!(await save.flush())) throw new Error("Couldn't save the latest changes first. Check your connection and try again.");
      const p = await api.publish(post.id, save.version.current);
      save.rebase(p.version);
      setPost(p);
      setDraft(p.draft);
      setDialog(null);
      await refreshList();
      say(`Published at /blogs/${p.slug}.`);
    } catch (e) {
      if (e instanceof ApiError && Array.isArray(e.data.errors)) say(`Not published: ${(e.data.errors as string[]).join(" ")}`);
      else say(e instanceof Error ? e.message : "Publishing failed.");
    } finally {
      setBusy(false);
    }
  }

  async function doUnpublish() {
    if (!post) return;
    setBusy(true);
    try {
      await save.flush();
      const p = await api.unpublish(post.id, save.version.current);
      save.rebase(p.version);
      setPost(p);
      setDialog(null);
      await refreshList();
      say("Unpublished. The article is a private draft again; its address now returns “not found”.");
    } catch (e) {
      say(e instanceof Error ? e.message : "Unpublishing failed.");
    } finally {
      setBusy(false);
    }
  }

  async function doDelete() {
    if (!post) return;
    setBusy(true);
    try {
      await api.remove(post.id);
      await mirror.remove(post.id);
      setPosts((l) => l.filter((i) => i.id !== post.id));
      setPost(null);
      setDraft(null);
      setDialog(null);
      say("Draft deleted.");
    } catch (e) {
      say(e instanceof Error ? e.message : "Couldn't delete the draft.");
    } finally {
      setBusy(false);
    }
  }

  async function makePreviewLink() {
    if (!post) return;
    try {
      await save.flush();
      const r = await api.preview(post.id);
      const url = new URL(r.url, location.origin).toString();
      setPreviewLink(url);
      await navigator.clipboard?.writeText(url).catch(() => {});
      say("Private preview link copied. It expires in 7 days.");
    } catch (e) {
      say(e instanceof Error ? e.message : "Couldn't create a preview link.");
    }
  }

  async function openRevisions() {
    if (!post) return;
    setPanel(panel === "revisions" ? null : "revisions");
    try { setRevisions(await api.revisions(post.id)); } catch {}
  }

  async function restore(rev: Revision) {
    if (!post || !confirm(`Replace the current draft with the version from ${day(rev.createdAt)}? The current text stays in the history.`)) return;
    try {
      await save.flush(true);
      const p = await api.restore(post.id, rev.id, save.version.current);
      save.rebase(p.version);
      setPost(p);
      setDraft(p.draft);
      setDocRev((n) => n + 1);
      setRevisions(await api.revisions(post.id));
      say("Restored. Saved as a new revision.");
    } catch (e) {
      say(e instanceof Error ? e.message : "Couldn't restore that revision.");
    }
  }

  if (auth === "checking") return <div className={s.loading} aria-busy="true">Opening the desk…</div>;
  const signedOut = save.state.kind === "signed-out";
  if (auth === "out" || signedOut) {
    return (
      <Login
        reason={signedOut ? "Your session ended. Sign in again — your text is safe on this device." : authReason}
        onDone={() => { setAuthReason(undefined); setAuth("in"); if (post) void save.flush(true); }}
      />
    );
  }
  const conflict = save.state.kind === "conflict" ? save.state.current : null;

  const checks = draft ? publishChecks(draft) : [];
  const ready = checks.every((c) => c.ok);
  const status = !post?.published ? "draft" : draft && differs(draft, post.published) ? "changed" : "published";
  const neverPublished = !post?.published && !post?.firstPublishedAt;
  const words = draft ? wordCount(draft.content) : 0;

  return (
    <div className={s.app} data-mode={mode} data-list={listOpen || undefined}>
      <header className={s.top}>
        <button type="button" className={s.ghost} onClick={() => setListOpen((v) => !v)} aria-expanded={listOpen} aria-controls="desk-list">
          {listOpen ? "Hide articles" : "Articles"}
        </button>
        <p className={s.brand}>Writer’s desk</p>
        {post && <SaveLine state={save.state} />}
        <div className={s.topActions}>
          {post && (
            <>
              <div className={s.modes} role="group" aria-label="Layout">
                {(["write", "split", "preview"] as Mode[]).map((m) => (
                  <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>{m[0].toUpperCase() + m.slice(1)}</button>
                ))}
              </div>
              <button type="button" className="button" onClick={makePreviewLink}>Preview link</button>
              {post.published && <button type="button" className="button" onClick={() => setDialog({ kind: "unpublish" })}>Unpublish</button>}
              <button type="button" className="button button--solid" onClick={() => setDialog({ kind: "publish" })} disabled={status === "published"} title={status === "published" ? "Everything here is already live" : undefined}>
                {post.published ? (status === "changed" ? "Publish changes" : "Published") : "Publish"}
              </button>
            </>
          )}
          <button type="button" className={s.ghost} onClick={async () => { await save.flush(); await api.logout().catch(() => {}); await mirror.clearAll(); setAuth("out"); }}>Sign out</button>
        </div>
      </header>

      <aside id="desk-list" className={s.list} hidden={!listOpen}>
        <button type="button" className="button button--solid" onClick={create} disabled={busy}>New article</button>
        <ul role="list">
          {posts.length === 0 && <li className={s.muted}>No articles yet. Start one — it stays private until you publish.</li>}
          {posts.map((p) => (
            <li key={p.id}>
              <button type="button" className={s.item} aria-current={post?.id === p.id || undefined} onClick={() => open(p.id)}>
                <span className={s.itemTitle}>{p.title || "Untitled"}</span>
                <span className={s.badge} data-status={p.status}>{p.status === "draft" ? "Private draft" : p.status === "changed" ? "Published · edits pending" : "Published"}</span>
                <span className="label">{day(p.updatedAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {!post || !draft ? (
        <section className={s.empty}>
          <h1>Write something worth keeping.</h1>
          <p>Choose an article on the left or start a new one. Drafts save as you type and stay private until you publish.</p>
          <button type="button" className="button button--solid" onClick={create} disabled={busy}>New article</button>
        </section>
      ) : (
        <section className={s.work} aria-label="Article editor">
          {recover && (
            <div className={s.banner} role="alert">
              <p>This device has newer text for this article from {time(recover.savedAt)} that didn’t reach the server.</p>
              <button type="button" className="button button--solid" onClick={() => { setDraft(recover.draft); setDocRev((n) => n + 1); save.rebase(recover.baseVersion); save.touch(recover.draft); setRecover(null); }}>Restore it</button>
              <button type="button" className="button" onClick={() => { void mirror.remove(post.id); setRecover(null); }}>Keep the server version</button>
            </div>
          )}
          {paused && (
            <div className={s.banner} role="alert">
              <p>This article is open in another tab. Editing here is paused so the two don’t overwrite each other.</p>
              <button type="button" className="button button--solid" onClick={() => { void open(post.id); }}>Edit here instead</button>
            </div>
          )}

          <div className={s.meta}>
            <input id="f-title" className={s.title} value={draft.title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" aria-label="Title" maxLength={140} />
            <button type="button" className={s.ghost} aria-expanded={details} aria-controls="details" onClick={() => setDetails((v) => !v)}>
              {details ? "Hide details" : "Details: address, summary, cover, tags"}
            </button>
            <div id="details" className={s.details} hidden={!details}>
              <label className={s.field}>
                <span className="label">Address</span>
                <span className={s.slug}>
                  <span className={s.muted}>/blogs/</span>
                  <input value={draft.slug} onChange={(e) => { setSlugTouched(true); update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }); }} aria-invalid={!validSlug(draft.slug) || save.state.kind === "slug-taken" || undefined} spellCheck={false} />
                </span>
                {save.state.kind === "slug-taken" && <span className={s.err}>Another article already uses this address. Choose a different one.</span>}
                {!neverPublished && post.published && draft.slug !== post.published.slug && (
                  <span className={s.hint}>When you publish, /blogs/{post.published.slug} will redirect here permanently.</span>
                )}
              </label>
              <label className={`${s.field} ${s.wide}`}>
                <span className="label">Summary <span className={s.muted}>({draft.excerpt.length}/320 · shown in search results and link previews)</span></span>
                <textarea rows={2} value={draft.excerpt} maxLength={320} onChange={(e) => update({ excerpt: e.target.value })} />
              </label>
              <label className={s.field}>
                <span className="label">Tags <span className={s.muted}>(comma separated)</span></span>
                <input value={(draft.tags ?? []).join(", ")} onChange={(e) => update({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8) })} />
              </label>
              <div className={s.field}>
                <span className="label">Cover image</span>
                {draft.cover ? (
                  <div className={s.cover}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={draft.cover} alt="" />
                    <input value={draft.coverAlt ?? ""} onChange={(e) => update({ coverAlt: e.target.value })} placeholder="Describe the cover image" aria-label="Cover image description" aria-invalid={!draft.coverAlt?.trim() || undefined} />
                    <button type="button" className={s.ghost} onClick={() => update({ cover: undefined, coverAlt: undefined, coverWidth: undefined, coverHeight: undefined })}>Remove cover</button>
                  </div>
                ) : (
                  <div className={s.row}>
                    <label className="button">
                      Upload cover
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/avif" hidden onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; if (f.length) setDialog({ kind: "alt", files: f.slice(0, 1), forCover: true }); }} />
                    </label>
                    <button type="button" className={s.ghost} onClick={() => setPanel("media")}>Choose from library</button>
                  </div>
                )}
              </div>
              <label className={s.check}>
                <input type="checkbox" checked={!!draft.sample} onChange={(e) => update({ sample: e.target.checked })} />
                <span>Illustrated study <span className={s.muted}>(kept out of search, RSS and the sitemap)</span></span>
              </label>
            </div>
          </div>

          <div className={s.toolbar} role="toolbar" aria-label="Formatting">
            <button type="button" onClick={() => editor.current?.linePrefix("## ")} title="Section heading">H2</button>
            <button type="button" onClick={() => editor.current?.linePrefix("### ")} title="Sub-heading">H3</button>
            <button type="button" onClick={() => editor.current?.wrap("**")} title="Bold"><b>B</b></button>
            <button type="button" onClick={() => editor.current?.wrap("_")} title="Italic"><i>I</i></button>
            <button type="button" onClick={() => editor.current?.wrap("`", "`", "code")} title="Inline code">{"<>"}</button>
            <button type="button" onClick={() => editor.current?.wrap("[", "](https://)", "link text")} title="Link">Link</button>
            <button type="button" onClick={() => editor.current?.linePrefix("> ")} title="Quote">Quote</button>
            <button type="button" onClick={() => editor.current?.linePrefix("- ")} title="Bulleted list">List</button>
            <button type="button" onClick={() => editor.current?.insert("```ts\n\n```\n")} title="Code block">Code block</button>
            <button type="button" onClick={() => editor.current?.insert("| Column | Column |\n| --- | --- |\n| Cell | Cell |\n")} title="Table">Table</button>
            <label className={s.toolFile} title="Insert an image">
              Image
              <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" multiple hidden onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ""; if (f.length) setDialog({ kind: "alt", files: f }); }} />
            </label>
            <button type="button" onClick={() => setPanel(panel === "media" ? null : "media")} aria-pressed={panel === "media"}>Library</button>
            <button type="button" onClick={openRevisions} aria-pressed={panel === "revisions"}>History</button>
            <span className={`label ${s.count}`}>{words.toLocaleString("en-IN")} words · {Math.max(1, Math.round(words / 230))} min</span>
          </div>

          <div className={s.panes} inert={paused || undefined}>
            <div className={s.editorPane} hidden={mode === "preview"}>
              <MarkdownEditor ref={editor} docKey={`${post.id}:${docRev}`} initial={draft.content} onChange={(content) => update({ content })} onImages={(files) => setDialog({ kind: "alt", files })} label="Article text in Markdown" />
            </div>
            <div className={s.previewPane} hidden={mode === "write"} aria-label="Preview" data-lenis-prevent>
              <p className="label label--caps">Preview · exactly as published</p>
              <h1 className={s.previewTitle}>{draft.title || "Untitled"}</h1>
              <p className={s.previewExcerpt}>{draft.excerpt}</p>
              <div className={`${article.body} prose`} dangerouslySetInnerHTML={{ __html: preview?.html ?? "" }} />
            </div>
          </div>

          {panel === "media" && (
            <aside className={s.drawer} aria-label="Image library">
              <header><p className="label label--caps">Image library</p><button type="button" className={s.ghost} onClick={() => setPanel(null)}>Close</button></header>
              <p className={s.muted}>Uploaded images are public files at unguessable addresses — fine for drafts, but don’t upload anything private.</p>
              <ul role="list" className={s.media}>
                {media.map((m) => (
                  <li key={m.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="" loading="lazy" />
                    <input defaultValue={m.alt} aria-label="Image description" onBlur={(e) => { if (e.target.value !== m.alt) void api.updateAlt(m.id, e.target.value).then(() => setMedia((l) => l.map((x) => (x.id === m.id ? { ...x, alt: e.target.value } : x)))); }} />
                    <span className={s.row}>
                      <button type="button" className={s.ghost} onClick={() => editor.current?.insert(`![${m.alt}](${m.url})\n`)}>Insert</button>
                      <button type="button" className={s.ghost} onClick={() => update({ cover: m.url, coverAlt: m.alt, coverWidth: m.width ?? undefined, coverHeight: m.height ?? undefined })}>Use as cover</button>
                    </span>
                  </li>
                ))}
                {media.length === 0 && <li className={s.muted}>No images yet. Paste or drop one into the text.</li>}
              </ul>
            </aside>
          )}
          {panel === "revisions" && (
            <aside className={s.drawer} aria-label="History">
              <header><p className="label label--caps">History</p><button type="button" className={s.ghost} onClick={() => setPanel(null)}>Close</button></header>
              <p className={s.muted}>A revision is kept when you press ⌘S, publish, unpublish, and every five minutes while you write.</p>
              <ol role="list" className={s.revs}>
                {revisions.map((r) => (
                  <li key={r.id}>
                    <span>{day(r.createdAt)}</span>
                    <span className="label">{r.reason} · v{r.version}</span>
                    <button type="button" className={s.ghost} onClick={() => restore(r)}>Restore</button>
                  </li>
                ))}
                {revisions.length === 0 && <li className={s.muted}>No revisions yet.</li>}
              </ol>
            </aside>
          )}

          <footer className={s.foot}>
            <span className={s.badge} data-status={status}>{status === "draft" ? "Private draft — only you can see it" : status === "changed" ? "Published · your edits aren’t live yet" : "Published"}</span>
            {post.published && <a href={`/blogs/${post.published.slug}`} target="_blank" rel="noopener">View live article ↗</a>}
            {previewLink && <a href={previewLink} target="_blank" rel="noopener">Open preview link ↗</a>}
            {neverPublished && <button type="button" className={s.danger} onClick={() => setDialog({ kind: "delete" })}>Delete draft</button>}
            <span className={`label ${s.keys}`}>⌘S save · ⌘⇧P publish</span>
          </footer>
        </section>
      )}

      {conflict && (
        <Modal onClose={() => {}} label="Conflict">
          <h2>This article changed somewhere else.</h2>
          <p className={s.muted}>
            Another tab or device saved it at {conflict.updatedAt ? time(conflict.updatedAt) : "a moment ago"}
            {conflict.draft ? ` (${wordCount(conflict.draft.content)} words there, ${words} here)` : ""}. Choose which version to keep — the other stays in History.
          </p>
          <div className={s.row}>
            <button type="button" className="button button--solid" onClick={() => { save.rebase(conflict.version); void save.flush(true); }}>Keep mine</button>
            <button type="button" className="button" onClick={() => { save.rebase(conflict.version); setPost(conflict); setDraft(conflict.draft); setDocRev((n) => n + 1); setRecover(null); save.setState({ kind: "saved", at: Date.now() }); }}>Load theirs</button>
          </div>
        </Modal>
      )}

      {dialog && (
        <Modal onClose={() => setDialog(null)} label={dialog.kind}>
          {dialog.kind === "publish" && draft && post && (
            <>
              <h2>{post.published ? "Publish your changes?" : "Publish this article?"}</h2>
              <p className={s.muted}>It will be live at <code>/blogs/{draft.slug}</code>{draft.sample ? ", kept out of search and feeds." : ", in the sitemap, RSS and search results."}</p>
              <ul role="list" className={s.checks}>
                {checks.map((c) => (
                  <li key={c.label} data-ok={c.ok || undefined}>
                    <span aria-hidden="true">{c.ok ? "✓" : "✕"}</span>
                    <span><b>{c.label}</b>{!c.ok && c.fix ? <> — {c.fix}</> : null}</span>
                  </li>
                ))}
              </ul>
              <div className={s.row}>
                <button type="button" className="button button--solid" disabled={!ready || busy} onClick={doPublish}>{busy ? "Publishing…" : post.published ? "Publish changes" : "Publish"}</button>
                <button type="button" className="button" onClick={() => setDialog(null)}>Keep editing</button>
              </div>
            </>
          )}
          {dialog.kind === "unpublish" && post && (
            <>
              <h2>Unpublish this article?</h2>
              <p className={s.muted}>/blogs/{post.published?.slug} will stop working and leave the sitemap and RSS. Your draft and history stay exactly as they are, and you can publish again later with the original date.</p>
              <div className={s.row}>
                <button type="button" className="button button--solid" disabled={busy} onClick={doUnpublish}>Unpublish</button>
                <button type="button" className="button" onClick={() => setDialog(null)}>Cancel</button>
              </div>
            </>
          )}
          {dialog.kind === "delete" && (
            <>
              <h2>Delete this draft?</h2>
              <p className={s.muted}>It has never been published. It will be removed from your list.</p>
              <div className={s.row}>
                <button type="button" className={`button ${s.dangerButton}`} disabled={busy} onClick={doDelete}>Delete draft</button>
                <button type="button" className="button" onClick={() => setDialog(null)}>Cancel</button>
              </div>
            </>
          )}
          {dialog.kind === "alt" && <AltPrompt count={dialog.files.length} cover={dialog.forCover} onCancel={() => setDialog(null)} onSubmit={(alt, caption) => uploadAll(dialog.files, alt, caption, dialog.forCover)} />}
        </Modal>
      )}

      <p className={s.toast} role="status" aria-live="polite">{toast}</p>
    </div>
  );
}

const FIELDS = ["title", "slug", "excerpt", "content", "cover", "coverAlt", "tags", "sample"] as const;
function differs(a: PostBody, b: PostBody) {
  return FIELDS.some((k) => JSON.stringify(a[k] ?? null) !== JSON.stringify(b[k] ?? null));
}

function SaveLine({ state }: { state: SaveState }) {
  const text =
    state.kind === "saved" ? (state.at ? `Saved ${time(state.at)}` : "All changes saved") :
    state.kind === "dirty" ? "Unsaved changes" :
    state.kind === "saving" ? "Saving…" :
    state.kind === "offline" ? `Offline — kept on this device, retrying in ${state.retryIn}s` :
    state.kind === "conflict" ? "Changed elsewhere — choose a version" :
    state.kind === "slug-taken" ? "Address already in use" :
    state.kind === "signed-out" ? "Signed out — kept on this device" :
    state.message;
  return <p className={s.saveLine} data-kind={state.kind} role="status" aria-live="polite">{text}</p>;
}

function Modal({ children, onClose, label }: { children: React.ReactNode; onClose: () => void; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    const close = () => onClose();
    d?.addEventListener("close", close);
    return () => d?.removeEventListener("close", close);
  }, [onClose]);
  return <dialog ref={ref} className={s.modal} aria-label={label}>{children}</dialog>;
}

function AltPrompt({ count, cover, onSubmit, onCancel }: { count: number; cover?: boolean; onSubmit: (alt: string, caption: string) => void; onCancel: () => void }) {
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (alt.trim()) onSubmit(alt.trim(), caption.trim()); }}>
      <h2>{cover ? "Describe the cover" : count > 1 ? `Describe these ${count} images` : "Describe the image"}</h2>
      <p className={s.muted}>Alt text is read aloud to people who can’t see the image, and used by search engines. Say what it shows and why it matters.</p>
      <label className={s.field}>
        <span className="label">Alt text (required)</span>
        <input value={alt} onChange={(e) => setAlt(e.target.value)} autoFocus placeholder="e.g. Sequence diagram of one sale writing three records" />
      </label>
      {!cover && (
        <label className={s.field}>
          <span className="label">Caption (optional, shown under the image)</span>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} />
        </label>
      )}
      <div className={s.row}>
        <button type="submit" className="button button--solid" disabled={!alt.trim()}>Upload</button>
        <button type="button" className="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
