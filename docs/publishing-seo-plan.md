# Private Markdown publishing

The approved editor lives at `/write`. It uses the portfolio’s existing Postgres database, with a private draft and a separate published copy per article. Publishing updates the public site immediately; no code deployment is needed for an article change.

## Write and publish

1. Open https://www.amankeshri.com/write, or **Writer’s desk** in the footer.
2. Sign in with the password in the local, ignored `.env.editor-access` file. Store it in your password manager.
3. Choose **New article**. Enter a title and short description. Paste Markdown into the body, or choose **Import .md**. A leading `# Title` becomes the title when that field is empty. Other metadata fields are entered separately; YAML frontmatter is not required.
4. Optionally enter an HTTPS cover image URL and its description. Markdown supports `![Image description](https://example.com/image.jpg)` within the body. Image upload hosting is not included.
5. Use **Preview article**, then **Save draft** to keep it private or **Publish article** to make it public.
6. Select an existing note to edit it. **Save draft** preserves the public version; **Publish changes** replaces it. **Unpublish** removes it from the public blog but retains the draft.
7. Sign out when finished. Sessions expire after eight hours. Unsaved text can be recovered in the same browser tab session; save drafts to retain them across devices.

The article URL becomes fixed after the first save. If another tab has changed the article, stale saves are rejected instead of overwriting newer content. Copy unsaved text before reloading after a conflict.

**Sample article** labels examples and excludes them from search indexing. Leave it unchecked for real writing.

## Operations

- Code: GitHub `amankeshri7542/cosmic-portfolio`, deployed to Vercel project `cosmic-portfolio`.
- Content: Postgres `portfolio_posts`; posts written in the editor are not committed to GitHub. Back up this table with your database provider.
- Setup: configure `POSTGRES_URL` and `EDITOR_PASSWORD_HASH`, then run `node --env-file=.env.local scripts/setup-editor.mjs`. This creates isolated tables and imports repository posts without overwriting existing edits.
- Password configuration: `EDITOR_PASSWORD_HASH` is `saltHex:keyHex`, generated with Node scrypt using a 16-byte random salt and a 64-byte key. Never put the plaintext password in Vercel or Git. To rotate it, generate a new hash, update the environment, redeploy, and clear `portfolio_editor_sessions` to revoke sessions.
- Sessions: random opaque cookies, hashed in Postgres, HttpOnly, Secure on HTTPS, SameSite Strict. Mutations require a matching origin. Persistent sign-in throttling allows eight attempts per address per 15-minute window.
- Preview deployments require their own authorized database/password environment configuration; production secrets are not copied to preview.

## Search visibility

Public pages render crawlable HTML with canonical www.amankeshri.com URLs, individual descriptions and social previews. Real articles include BlogPosting and breadcrumb structured data, publication/update dates, and dynamic sitemap entries. Drafts return 404 publicly; samples, the editor and thank-you page are noindex.

Submit https://www.amankeshri.com/sitemap.xml in Google Search Console for indexing visibility. Search positions depend on useful content, competition and search engine decisions; technical SEO cannot guarantee a rank.

## Verification

`scripts/verify-publishing.mjs` tests auth, origin checks, validation, draft privacy, publication, revisions, concurrency, Markdown safety, metadata, social images, unpublishing and mobile editor layouts. It creates a uniquely named QA article and deletes it in a finally block. Run with `.env.local` loaded and an installed Playwright module in `PLAYWRIGHT_MODULE`. The password comes from the ignored `.env.editor-access` file and is never printed.
