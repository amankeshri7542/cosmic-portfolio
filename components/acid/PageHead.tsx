import type { ReactNode } from "react";
import { Drip, Melt, Wobble } from "./Text";

/** The opening of an inner page: dripping kicker, wobbling h1, melting lede. */
export function PageHead({ kicker, title, lede, children, className }: { kicker: string; title: string | string[]; lede?: string; children?: ReactNode; className?: string }) {
  return (
    <header className={className ? `page-head sec in vis ${className}` : "page-head sec in vis"} data-sec="page">
      <Drip as="p" className="kicker" style={{ color: "var(--c2)" }} text={kicker} />
      <Wobble as="h1" className="page-title" text={title} />
      {lede && <Melt className="lede" text={lede} />}
      {children}
    </header>
  );
}
