/* Author-supplied image URLs load in the browser, avoiding server-side fetches of arbitrary URLs. */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, type FormEvent } from "react";
import MarkdownArticle from "@/components/MarkdownArticle";
import type { BlogPost, EditorPost } from "@/lib/blog-types";

const empty: BlogPost = {slug:"",title:"",excerpt:"",content:"",cover:"",coverAlt:"",sample:false,date:"Draft",dateISO:""};
const slugify = (title: string) => title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100);

export default function Writer({ authenticated, initialPosts }: { authenticated: boolean; initialPosts: EditorPost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState<BlogPost>(empty);
  const [current, setCurrent] = useState<EditorPost | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const [recovery, setRecovery] = useState<{draft:BlogPost;current:EditorPost|null} | null>(null);
  useEffect(() => {
    if (!authenticated) return;
    try { const value = sessionStorage.getItem("writer-recovery"); if (value) { const saved = JSON.parse(value); if (saved?.draft && typeof saved.draft.title === "string" && typeof saved.draft.content === "string" && (saved.current === null || typeof saved.current?.version === "number")) setRecovery(saved); } } catch { /* A unavailable browser store doesn't block writing. */ }
  }, [authenticated]);
  useEffect(() => {
    if (!dirty) return;
    try { sessionStorage.setItem("writer-recovery", JSON.stringify({draft,current})); } catch { /* Explicit saves remain available. */ }
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload",warn);
    return () => window.removeEventListener("beforeunload",warn);
  }, [draft,current,dirty]);
  function clearRecovery() { try { sessionStorage.removeItem("writer-recovery"); } catch { /* Writing works without browser storage. */ } }
  function change<K extends keyof BlogPost>(key: K, value: BlogPost[K]) { setDraft(d => ({...d,[key]:value})); setDirty(true); setNotice(""); }
  function open(post: EditorPost | null) {
    if (dirty && !confirm("Leave this unsaved draft? Save it first to keep it on the server.")) return;
    setCurrent(post); setDraft(post ? {...empty,...post.draft} : {...empty}); setDirty(false); setNotice(""); setPreview(false);
    clearRecovery(); setRecovery(null);
  }
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setNotice("");
    const password = new FormData(event.currentTarget).get("password");
    try {
      const response = await fetch("/api/editor/session", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      window.location.reload();
    } catch(error) { setNotice(error instanceof Error ? error.message : "Could not sign in."); setBusy(false); }
  }
  async function save(intent: string) {
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/editor/posts", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...draft,cover:draft.cover || "",coverAlt:draft.coverAlt || "",version:current?.version ?? 0,intent})});
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const post = result.post as EditorPost;
      setCurrent(post); setDraft({...empty,...post.draft}); setPosts(items => [post,...items.filter(item => item.slug !== post.slug)]); setDirty(false);
      clearRecovery(); setRecovery(null);
      setNotice(intent === "publish" ? "Published. Your article is now on the blog." : intent === "unpublish" ? "Unpublished. The draft is still here." : "Draft saved. The public article is unchanged.");
    } catch(error) { setNotice(error instanceof Error ? error.message : "Could not save. Your text is still here."); }
    finally { setBusy(false); }
  }
  async function signOut() {
    if (dirty && !confirm("Sign out without saving this draft?")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/editor/session", {method:"DELETE"});
      if (!response.ok) throw new Error("Could not sign out. Try again.");
      clearRecovery(); setDirty(false); window.location.reload();
    } catch(error) { setNotice(error instanceof Error ? error.message : "Could not sign out."); setBusy(false); }
  }
  if (!authenticated) return <div className="writer-login"><p className="eyebrow">Private / for the author</p><h1>Back to<br /><em>the workbench.</em></h1><p>A quiet place to turn your Markdown into a published field note.</p><form onSubmit={signIn}><label htmlFor="editor-password">Editor password</label><input id="editor-password" name="password" type="password" autoComplete="current-password" required maxLength={200} /><button className="primary-link" disabled={busy}>{busy ? "Signing in…" : "Open the writer’s desk"}</button><p role="status">{notice}</p></form></div>;
  return <>
    <header className="writer-heading"><div><p className="eyebrow">Private / Writer’s desk</p><h1>A thought, <em>taking shape.</em></h1></div><button className="text-link" onClick={signOut} disabled={busy}>Sign out</button></header>
    {recovery && <div className="writer-recovery">There’s an unsaved draft from this browser session. <button className="text-link" onClick={() => {setDraft(recovery.draft);setCurrent(recovery.current);setDirty(true);setRecovery(null);}}>Recover it</button><button className="text-link" onClick={() => {clearRecovery();setRecovery(null);}}>Discard recovery</button></div>}
    <div className="writer-layout">
      <aside className="writer-library"><button className="primary-link" onClick={() => open(null)} disabled={busy}>New article <span>+</span></button><h2>Your notebook</h2>{posts.map(post => <button key={post.slug} onClick={() => open(post)} disabled={busy} aria-pressed={current?.slug === post.slug}><span>{post.draft.title}</span><small>{post.published ? "Published · draft editable" : "Private draft"}</small></button>)}</aside>
      <form className="writer-form" onSubmit={event => {event.preventDefault(); void save((event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") || "save");}}>
        <fieldset disabled={busy} className="writer-fields">
        <div className="writer-state"><span className="micro">{dirty ? "Unsaved changes" : current ? "Saved" : "New draft"}</span>{current?.published && <a href={`/blogs/${current.slug}`} target="_blank" rel="noopener noreferrer" className="text-link">View published article ↗</a>}</div>
        <label htmlFor="post-title">Title</label><input id="post-title" value={draft.title} required minLength={3} maxLength={140} placeholder="What have you been thinking about?" onChange={e => {change("title",e.target.value);if (!current) setDraft(d => ({...d,slug:slugify(e.target.value)}));}} />
        <label htmlFor="post-slug">Article URL <span>/blogs/</span></label><input id="post-slug" value={draft.slug} readOnly={!!current} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} onChange={e => change("slug",e.target.value)} /><p className="writer-hint">The URL stays fixed after your first save, so shared links keep working.</p>
        <label htmlFor="post-excerpt">Short description</label><textarea id="post-excerpt" value={draft.excerpt} required minLength={20} maxLength={320} rows={3} placeholder="A useful summary for the blog page and search engines." onChange={e => change("excerpt",e.target.value)} />
        <div className="writer-cover-fields"><div><label htmlFor="post-cover">Cover image URL <span>optional</span></label><input id="post-cover" value={draft.cover || ""} placeholder="https://… or /observatory/cosmic-landscape-v2.png" onChange={e => change("cover",e.target.value)} /></div><div><label htmlFor="post-cover-alt">Describe the image</label><input id="post-cover-alt" value={draft.coverAlt || ""} required={!!draft.cover} maxLength={300} onChange={e => change("coverAlt",e.target.value)} /></div></div>
        <div className="writer-tabs"><button type="button" aria-pressed={!preview} onClick={() => setPreview(false)}>Write Markdown</button><button type="button" aria-pressed={preview} onClick={() => setPreview(true)}>Preview article</button><label className="writer-import">Import .md<input type="file" accept=".md,.markdown,text/markdown,text/plain" onChange={async e => {const file=e.target.files?.[0];if (!file) return;if(file.size>150_000){setNotice("Keep the Markdown file below 150 KB.");return;}const text=await file.text();change("content",text);if(!draft.title){const title=text.match(/^#\s+(.+)$/m)?.[1];if(title){change("title",title);change("slug",slugify(title));}}e.target.value="";}} /></label></div>
        <label htmlFor="post-content" className={preview ? "sr-only" : "writer-hint"}>Body · # headings, paragraphs, lists, links, images and fenced code are supported.</label><textarea id="post-content" onInvalid={() => setPreview(false)} className={`writer-markdown${preview ? " writer-hidden" : ""}`} value={draft.content} required minLength={20} maxLength={150000} placeholder={"# Your title\n\nStart with the thing you want to say.\n\n## A main point\n\nYour paragraph…"} onChange={e => change("content",e.target.value)} />
        {preview && <section className="writer-preview"><p className="eyebrow">Private preview</p><h2>{draft.title || "Untitled draft"}</h2>{draft.cover && <img src={draft.cover} alt={draft.coverAlt || ""} referrerPolicy="no-referrer" />}<MarkdownArticle content={draft.content} /></section>}
        <label className="writer-sample"><input type="checkbox" checked={draft.sample} onChange={e => change("sample",e.target.checked)} /> Sample article · visible on the blog, excluded from Google indexing</label>
        <div className="writer-actions"><button name="intent" value="save" disabled={busy} className="writer-save">Save draft</button><button name="intent" value="publish" disabled={busy} className="primary-link">{busy ? "Saving…" : current?.published ? "Publish changes" : "Publish article"}</button>{current?.published && <button type="button" className="text-link" disabled={busy} onClick={() => {if(confirm("Remove this article from the public blog? Its draft will remain here.")) void save("unpublish");}}>Unpublish</button>}</div>
        <p role="status" className="writer-notice">{notice}</p>
        </fieldset>
      </form>
    </div>
  </>;
}
