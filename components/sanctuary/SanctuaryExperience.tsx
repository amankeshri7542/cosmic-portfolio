"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
const World = dynamic(() => import("./SanctuaryWorld"), { ssr: false });
class WorldBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function SanctuaryExperience() {
  const [mode, setMode] = useState<"still" | "live">("still");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inspect, setInspect] = useState(false);
  const [angle, setAngle] = useState(0);
  const [chapter, setChapter] = useState(0);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => {
    setFailed(true);
    setMode("still");
    setInspect(false);
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    const change = () => {
      setMode(media.matches || connection?.saveData ? "still" : "live");
      setInspect(false);
    };
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setChapter(Number((entry.target as HTMLElement).dataset.chapter));
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
    );
    document
      .querySelectorAll("[data-chapter]")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInspect(false);
    };
    const scroll = () => setInspect(false);
    window.addEventListener("keydown", escape);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      window.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", scroll);
    };
  }, []);
  return (
    <>
      <div
        className={`sanctuary-backdrop${ready && mode === "live" ? " world-ready" : ""}${inspect ? " is-inspecting" : ""}`}
        aria-hidden="true"
        data-active-chapter={chapter}
        data-world-mode={mode}
        data-world-ready={ready}
      >
        <div className="sanctuary-still">
          <Image
            src="/sanctuary/quiet-engine.webp"
            alt=""
            fill
            sizes="100vw"
            priority
            quality={85}
          />
        </div>
        {mode === "live" && !failed && (
          <WorldBoundary onError={onError}>
            <World
              onReady={onReady}
              onError={onError}
              inspect={inspect}
              angle={angle}
            />
          </WorldBoundary>
        )}
        <div className="world-shade" />
      </div>
      <div className="world-controls">
        <span className="world-location micro">
          {[
            "Threshold",
            "The foundation",
            "The mechanism",
            "The network",
            "The garden",
            "Still water",
          ][chapter] || "Threshold"}
        </span>
        {mode === "live" && ready && (
          <button aria-pressed={inspect} onClick={() => setInspect(!inspect)}>
            {inspect ? "Return to reading" : "Inspect the instrument"}{" "}
            <span aria-hidden="true">{inspect ? "×" : "↗"}</span>
          </button>
        )}
        <button
          disabled={failed}
          onClick={() => {
            setMode(mode === "live" ? "still" : "live");
            setInspect(false);
          }}
          aria-pressed={mode === "still"}
        >
          {failed ? "Still view" : mode === "live" ? "Still view" : "Enable 3D"}
        </button>
        {inspect && (
          <label className="inspection-angle">
            View angle
            <input
              type="range"
              min="-60"
              max="60"
              value={angle}
              onChange={(event) => setAngle(Number(event.target.value))}
            />
          </label>
        )}
      </div>
    </>
  );
}
