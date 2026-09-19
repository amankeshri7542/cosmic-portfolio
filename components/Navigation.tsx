"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CommandPalette from "@/components/CommandPalette";
const links = [
  { name: "Work", href: "/work" },
  { name: "Stack", href: "/#stack" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blogs" },
  { name: "Contact", href: "/contact" },
];
export default function Navigation() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 40);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  return (
    <header
      className={`site-header${scrolled || pathname !== "/" ? " header-solid" : ""}`}
    >
      <Link href="/" aria-label="Aman Kumar — home" className="wordmark">
        <span className="name-script">ak.</span><span className="wordmark-name">Aman Kumar<span>Full-stack · AI · Cloud</span></span>
      </Link>
      <nav aria-label="Main navigation" className="desktop-nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href || (link.href === "/blogs" && pathname.startsWith("/blogs/")) ? "page" : undefined}
          >
            {link.name}
          </Link>
        ))}
      </nav>
      <div className="header-right">
        <CommandPalette />
        <span className="header-location micro">Bengaluru, India</span>
        <a
          className="header-resume"
          href="/amankeshridotcom.pdf"
          target="_blank"
          rel="noopener noreferrer"
        >
          Resume ↗
        </a>
        <button
          className="menu-button"
          aria-label="Open navigation"
          onClick={() => dialog.current?.showModal()}
        >
          <span />
          <span />
        </button>
      </div>
      <dialog className="mobile-menu" ref={dialog}>
        <div className="menu-top">
          <span className="micro">Find your way</span>
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => dialog.current?.close()}
            >
              {link.name}
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </nav>
        <a href="/amankeshridotcom.pdf" className="text-link">
          Read the resume ↗
        </a>
      </dialog>
    </header>
  );
}
