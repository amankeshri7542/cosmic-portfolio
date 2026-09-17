import sharp from "sharp";
for (const kind of ["circuit", "satellite", "prism"]) {
  await sharp({ create: { width: 6600, height: 507, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(Array.from({ length: 11 }, (_, i) => ({ input: `/tmp/portfolio-control-views/${kind}-${i}.png`, left: i * 600, top: 0 })))
    .webp({ quality: 85 }).toFile(`public/observatory/${kind}-views.webp`);
}
