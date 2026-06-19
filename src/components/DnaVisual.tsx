interface Props { hash: string; size?: number; }

function fixed(value: number) {
  return Number(value.toFixed(6));
}

export function DnaVisual({ hash, size = 220 }: Props) {
  // Build a deterministic helix from hash bytes
  const h = hash || "0".repeat(64);
  const points = 32;
  const rows = Array.from({ length: points }, (_, i) => {
    const byte = parseInt(h.slice((i * 2) % 64, ((i * 2) % 64) + 2) || "00", 16);
    return byte / 255;
  });
  const w = size, ht = size;
  const cx = w / 2;
  const amp = w * 0.32;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: w, height: ht }}>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(234,164,137,0.18),transparent_70%)] blur-xl" />
      <svg width={w} height={ht} viewBox={`0 0 ${w} ${ht}`} className="relative">
        <defs>
          <linearGradient id="dna-a" x1="0" x2="1">
            <stop offset="0" stopColor="#EAA489" />
            <stop offset="1" stopColor="#D98A70" />
          </linearGradient>
          <linearGradient id="dna-b" x1="1" x2="0">
            <stop offset="0" stopColor="#F0B19A" />
            <stop offset="1" stopColor="#EAA489" />
          </linearGradient>
        </defs>
        {rows.map((r, i) => {
          const y = fixed((i / (points - 1)) * (ht - 20) + 10);
          const phase = (i / points) * Math.PI * 4 + r * Math.PI;
          const x1 = fixed(cx + Math.sin(phase) * amp);
          const x2 = fixed(cx + Math.sin(phase + Math.PI) * amp);
          return (
            <g key={i} opacity={0.85}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={i % 2 ? "url(#dna-a)" : "url(#dna-b)"} strokeWidth="1.5" opacity="0.5" />
              <circle cx={x1} cy={y} r={2.5 + r * 2} fill="url(#dna-a)" />
              <circle cx={x2} cy={y} r={2.5 + (1 - r) * 2} fill="url(#dna-b)" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
