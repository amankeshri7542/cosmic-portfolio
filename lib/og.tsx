import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const ogSize = { width: 1200, height: 630 };

const LAYERS = ["Interface", "API", "Data", "Cloud", "AI"];

async function portraitDataUri() {
  const sharp = (await import("sharp")).default;
  const png = await sharp(path.join(process.cwd(), "public/about/aman-sm.webp")).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

export async function ogImage({ eyebrow, title, footer, photo = false }: { eyebrow: string; title: string; footer: string; photo?: boolean }) {
  const font = await readFile(path.join(process.cwd(), "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff"));
  const portrait = photo ? await portraitDataUri() : null;
  const size = title.length > 70 ? 56 : title.length > 40 ? 68 : photo ? 76 : 84;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#eef1f6",
          fontFamily: "Bricolage",
          background: "radial-gradient(circle at 85% 0%, rgba(255,159,28,0.22), rgba(9,12,18,0) 55%), #090c12",
          position: "relative",
        }}
      >
        {portrait && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={portrait} width={360} height={540} alt="" style={{ position: "absolute", right: 40, bottom: -40 }} />
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#a9b3c3" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#3ddc97" }} />
          {eyebrow}
        </div>
        <div style={{ display: "flex", fontSize: size, lineHeight: 1.02, letterSpacing: -2, maxWidth: portrait ? 700 : 1000 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, color: "#a9b3c3" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {LAYERS.map((l, i) => (
              <div key={l} style={{ display: "flex", padding: "8px 16px", borderRadius: 999, border: `1px solid ${i === 0 ? "#ff9f1c" : "rgba(255,255,255,0.18)"}`, color: i === 0 ? "#ff9f1c" : "#a9b3c3" }}>
                {l}
              </div>
            ))}
          </div>
          {!portrait && <div style={{ display: "flex" }}>{footer}</div>}
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Bricolage", data: font, style: "normal", weight: 700 }] },
  );
}
