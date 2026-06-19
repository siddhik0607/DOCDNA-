function color(seed: string): string {
  return `#${seed.slice(0, 6)}`;
}

export function createDnaSvg(hash: string): string {
  const colors = [color(hash), color(hash.slice(6)), color(hash.slice(12))];
  const cells: string[] = [];
  const size = 12;

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const index = (row * 8 + col) * 2;
      const value = Number.parseInt(hash.slice(index, index + 2), 16);
      cells.push(
        `<rect x="${col * size}" y="${row * size}" width="${size - 1}" height="${size - 1}" rx="2" fill="${colors[value % colors.length]}" fill-opacity="${(0.35 + (value % 65) / 100).toFixed(2)}" />`,
      );
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" role="img" aria-label="Doc DNA fingerprint">
      <rect width="96" height="96" rx="16" fill="#0f172a" />
      ${cells.join("")}
    </svg>
  `.trim();

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
