"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PostBody } from "@/lib/post-types";
import { api, ApiError, type EditorPost } from "./api";
import { mirror } from "./mirror";

export type SaveState =
  | { kind: "saved"; at: number }
  | { kind: "dirty" }
  | { kind: "saving" }
  | { kind: "offline"; retryIn: number }
  | { kind: "conflict"; current: EditorPost }
  | { kind: "slug-taken" }
  | { kind: "signed-out" }
  | { kind: "error"; message: string };

const DEBOUNCE = 1500;
const CHECKPOINT_EVERY = 5 * 60 * 1000;

/**
 * Saves the draft 1.5 s after typing stops. One request at a time: edits made while a save is in
 * flight are coalesced into the next one. Every change is mirrored to this device first.
 */
export function useAutosave(post: EditorPost | null, draft: PostBody | null, onSaved: (p: { version: number; updatedAt: string; slug?: string }) => void) {
  const [state, setState] = useState<SaveState>({ kind: "saved", at: 0 });
  const [prevId, setPrevId] = useState(post?.id);
  const version = useRef(post?.version ?? 0);
  const latest = useRef(draft);
  const dirty = useRef(false);
  const inFlight = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const retry = useRef(0);
  const lastCheckpoint = useRef(0);
  const savedCb = useRef(onSaved);
  const flushRef = useRef<(checkpoint?: boolean) => Promise<boolean>>(async () => true);
  const id = post?.id;

  // Switching articles resets the indicator (derived during render, not in an effect).
  if (prevId !== id) {
    setPrevId(id);
    setState({ kind: "saved", at: 0 });
  }

  useEffect(() => { savedCb.current = onSaved; }, [onSaved]);

  useEffect(() => {
    version.current = post?.version ?? 0;
    dirty.current = false;
    retry.current = 0;
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const flush = useCallback(async (checkpoint = false): Promise<boolean> => {
    window.clearTimeout(timer.current);
    if (!id || !latest.current) return true;
    if (inFlight.current) {
      dirty.current = true;
      return false;
    }
    if (!dirty.current && !checkpoint) return true;
    inFlight.current = true;
    dirty.current = false;
    const sending = latest.current;
    const wantCheckpoint = checkpoint || Date.now() - lastCheckpoint.current > CHECKPOINT_EVERY;
    setState({ kind: "saving" });
    try {
      const res = await api.save(id, sending, version.current, wantCheckpoint);
      version.current = res.version;
      if (wantCheckpoint) lastCheckpoint.current = Date.now();
      retry.current = 0;
      await mirror.put({ id, draft: sending, baseVersion: res.version, savedAt: Date.now() });
      savedCb.current(res);
      inFlight.current = false;
      if (dirty.current) {
        setState({ kind: "dirty" });
        timer.current = window.setTimeout(() => void flushRef.current(), 250);
      } else {
        setState({ kind: "saved", at: Date.now() });
      }
      return true;
    } catch (e) {
      inFlight.current = false;
      dirty.current = true;
      if (e instanceof ApiError) {
        if (e.status === 409 && e.code === "slug_taken") setState({ kind: "slug-taken" });
        else if (e.status === 409) setState({ kind: "conflict", current: (e.data.current ?? e.data.post) as EditorPost });
        else if (e.status === 401) setState({ kind: "signed-out" });
        else if (e.status >= 500 || e.status === 429) scheduleRetry();
        else setState({ kind: "error", message: e.message });
      } else {
        scheduleRetry(); // network: keep it on the device and try again
      }
      return false;
    }
    function scheduleRetry() {
      const wait = [5, 15, 30, 60][Math.min(retry.current++, 3)];
      setState({ kind: "offline", retryIn: wait });
      timer.current = window.setTimeout(() => void flushRef.current(), wait * 1000);
    }
  }, [id]);

  useEffect(() => { flushRef.current = flush; }, [flush]);

  /** Call on every edit. */
  const touch = useCallback((next: PostBody) => {
    latest.current = next;
    if (!id) return;
    dirty.current = true;
    void mirror.put({ id, draft: next, baseVersion: version.current, savedAt: Date.now() });
    setState((s) => (s.kind === "conflict" || s.kind === "signed-out" ? s : { kind: "dirty" }));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flush(), DEBOUNCE);
  }, [id, flush]);

  /** After resolving a conflict, continue from the server's version. */
  const rebase = useCallback((v: number) => { version.current = v; }, []);

  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current || inFlight.current) { e.preventDefault(); }
    };
    const online = () => { if (dirty.current) void flush(); };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("online", online);
      window.clearTimeout(timer.current);
    };
  }, [flush]);

  return { state, setState, touch, flush, rebase, version };
}
