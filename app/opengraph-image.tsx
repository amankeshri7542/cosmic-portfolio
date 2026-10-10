import { ogImage, ogSize } from "@/lib/og";

export const alt = "Aman Kumar — Let’s build a product, together.";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ eyebrow: "Aman Kumar · full-stack engineer · Bengaluru", title: "Let’s build a product, together.", footer: "amankeshri.com", photo: true });
}
