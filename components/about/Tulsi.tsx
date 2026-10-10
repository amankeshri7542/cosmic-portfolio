// A tulsi sprig as a photogram: the plant laid on sensitised paper, its shadow left white.
// Hand-built leaf geometry (opposite, ovate, serrated leaves on a square stem, with a flower spike).
function leaf(x: number, y: number, angle: number, len: number) {
  const w = len * 0.46;
  const teeth = 6;
  let right = "";
  let left = "";
  for (let i = 1; i <= teeth; i++) {
    const t = i / (teeth + 1);
    const half = Math.sin(Math.PI * Math.pow(t, 0.8)) * w * 0.5;
    const ty = -len * t;
    right += ` L${(half + 1.6).toFixed(1)} ${(ty - 1.2).toFixed(1)} L${half.toFixed(1)} ${(ty + 1.4).toFixed(1)}`;
    left = ` L${(-half).toFixed(1)} ${(ty + 1.4).toFixed(1)} L${(-half - 1.6).toFixed(1)} ${(ty - 1.2).toFixed(1)}` + left;
  }
  const d = `M0 0${right} L0 ${-len}${left} Z`;
  return <path key={`${x}-${y}-${angle}`} d={d} transform={`translate(${x} ${y}) rotate(${angle})`} />;
}

export function Tulsi() {
  const nodes = [
    { y: 300, len: 62, spread: 58 },
    { y: 236, len: 56, spread: 52 },
    { y: 178, len: 46, spread: 46 },
    { y: 128, len: 36, spread: 40 },
  ];
  const spike = Array.from({ length: 9 }, (_, i) => 92 - i * 8.5);
  return (
    <svg viewBox="0 0 220 380" className="tulsi" role="img" aria-label="Photogram of a tulsi sprig" style={{ width: "min(100%, 240px)", color: "var(--paper)" }}>
      <g fill="currentColor" opacity="0.92">
        <path d="M108 372 C 109 300, 111 200, 110 40 L 113 40 C 114 200, 113 300, 112 372 Z" />
        {nodes.flatMap((n, i) => [leaf(111, n.y, -n.spread - i * 3, n.len), leaf(111, n.y, n.spread + i * 3, n.len)])}
        {spike.map((y, i) => (
          <g key={y}>
            <ellipse cx={104 - (i % 2)} cy={y} rx="4.2" ry="2.2" transform={`rotate(-30 ${104} ${y})`} />
            <ellipse cx={118 + (i % 2)} cy={y + 2} rx="4.2" ry="2.2" transform={`rotate(30 ${118} ${y + 2})`} />
          </g>
        ))}
      </g>
    </svg>
  );
}
