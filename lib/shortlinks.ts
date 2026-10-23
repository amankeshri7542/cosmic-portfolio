// Six-character short links (amankeshri.com/abc123) come from the public URL-shortener app. Anyone can create
// one there, so a link on this domain could point anywhere — a phishing page wearing amankeshri.com.
// Known destinations redirect straight through; anything else gets a plain "you're leaving" page.

export const SHORTENER = process.env.SHORTENER_ORIGIN ?? "https://url-shortner-woad-tau.vercel.app";

const ALLOWED_HOSTS = new Set([
  "amankeshri.com", "www.amankeshri.com", "arti.amankeshri.com",
  "linkedin.com", "www.linkedin.com", "lnkd.in",
  "github.com", "www.github.com",
  "url-shortner-woad-tau.vercel.app",
  "shiv-cement-app.vercel.app", "shivcementstore.com", "www.shivcementstore.com",
  "foxpop.in", "www.foxpop.in",
  "med-scan-ai-web.vercel.app", "prompt-inhancer.vercel.app",
  "ai-img-uw5tcdkkkrpzafnnaiq8am.streamlit.app",
]);

export const isShortCode = (path: string) => /^\/[A-Za-z0-9_]{6}$/.test(path);

export function trusted(url: URL) {
  return url.protocol === "https:" && ALLOWED_HOSTS.has(url.hostname.toLowerCase()) && !url.username && !url.password;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** A static, script-free warning page. The destination is shown in full and only followed if the visitor chooses. */
export function leavingPage(dest: URL) {
  const href = esc(dest.toString());
  const host = esc(dest.hostname);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>You're leaving amankeshri.com</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#090c12;color:#eef1f6;font:16px/1.6 system-ui,sans-serif}
main{max-width:34rem;padding:2rem}h1{font-size:1.6rem;margin:0 0 .75rem}code{display:block;word-break:break-all;padding:.75rem;border:1px solid #2a3343;border-radius:8px;background:#0e131b;color:#ffb547;margin:1rem 0}
a{color:#eef1f6}.go{display:inline-block;margin-right:1rem;padding:.6rem 1rem;border:1px solid #ff9f1c;border-radius:8px;text-decoration:none}p{color:#a9b3c3}</style></head>
<body><main><h1>This short link leaves amankeshri.com</h1><p>It points to <strong>${host}</strong>, a site I don't run. Only continue if you trust it.</p>
<code>${href}</code><p><a class="go" href="${href}" rel="noopener noreferrer nofollow">Continue to ${host}</a><a href="https://www.amankeshri.com/">Back to amankeshri.com</a></p></main></body></html>`;
}
