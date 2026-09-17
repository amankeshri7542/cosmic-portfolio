import Link from "next/link";
import { profile } from "@/lib/portfolio";
export default function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Link href="/">Aman Kumar</Link>
        <span>Made with attention. Kept with curiosity.</span>
      </div>
      <nav aria-label="Social links">
        <a href={profile.github} target="_blank" rel="noopener noreferrer">
          GitHub ↗
        </a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn ↗
        </a>
        <a href={`mailto:${profile.email}`}>Email ↗</a>
        <Link href="/write">Writer’s desk</Link>
      </nav>
      <span className="micro">© {new Date().getFullYear()}</span>
    </footer>
  );
}
