export function Particles() {
  const dots = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(242,141,87,0.12),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(122,191,103,0.08),transparent_52%)]" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#cdbfb4" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {dots.map(i => {
        const top = (i * 37) % 100;
        const left = (i * 53) % 100;
        const delay = (i % 8) * 0.7;
        const dur = 6 + (i % 5);
        const size = 2 + (i % 4);
        return (
          <span
            key={i}
            className="absolute rounded-full bg-primary/60"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: size,
              height: size,
              animation: `float-particle ${dur}s ease-in-out ${delay}s infinite`,
              boxShadow: "0 0 10px rgba(242, 141, 87, 0.24)",
            }}
          />
        );
      })}
    </div>
  );
}
