import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="reading-page section-shell">
      <header className="page-heading">
        <p className="eyebrow">404 / Off the path</p>
        <h1>
          Nothing here.
          <br />
          <em>Yet.</em>
        </h1>
        <p>
          This page doesn’t exist. The work and the rest of the notebook are
          still here.
        </p>
      </header>
      <Link className="primary-link" href="/">
        Return home ↗
      </Link>
    </main>
  );
}
