import Link from "next/link";
export default function ThankYouContent() {
  return (
    <main
      id="main-content"
      className="reading-page section-shell thank-you-page"
    >
      <div>
        <p className="eyebrow">Message received</p>
        <h1>
          Thank you
          <br />
          <em>for reaching out.</em>
        </h1>
        <p>
          Your message has been sent. I’ll get back to you soon. In the
          meantime, there’s more work to explore.
        </p>
        <div className="text-links">
          <Link href="/work">Explore the work ↗</Link>
          <Link href="/">Return to the notebook ↗</Link>
        </div>
      </div>
    </main>
  );
}
