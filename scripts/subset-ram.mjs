// Builds a tiny Anek Devanagari subset containing only the glyphs needed to set "राम".
// Source: the Anek Devanagari variable font (Ek Type, OFL-1.1). Usage: node scripts/subset-ram.mjs <source.woff2>
import { readFileSync, writeFileSync } from "node:fs";
import subsetFont from "subset-font";

const src = readFileSync(process.argv[2]);
const out = await subsetFont(src, "राम", { targetFormat: "woff2", variationAxes: { wght: 500, wdth: 100 } });
writeFileSync("assets/fonts/anek-devanagari-ram.woff2", out);
console.log(`${out.length} bytes`);
