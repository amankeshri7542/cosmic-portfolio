import type { Metadata } from "next";
import { Desk } from "@/components/write/Desk";

export const metadata: Metadata = {
  title: "Writer’s desk",
  robots: { index: false, follow: false, nocache: true },
};

/** The private publishing portal. A client app; every action goes through authenticated APIs. */
export default function WritePage() {
  return <Desk />;
}
