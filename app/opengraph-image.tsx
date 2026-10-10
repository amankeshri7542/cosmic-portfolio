import { cachedOgPng, ogSize, pngResponse } from "@/lib/og";

export const alt = "Aman Kumar — Let’s build a product, together.";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return pngResponse(await cachedOgPng({ eyebrow: "Aman Kumar · full-stack engineer · Bengaluru", title: "Let’s build a product, together.", footer: "amankeshri.com", photo: true }));
}
