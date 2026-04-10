/** Convert hex color to [h, s, l] where h=0-360, s=0-100, l=0-100 */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    case b: h = ((r - g) / d + 4) / 6; break;
  }
  return [h * 360, s * 100, l * 100];
}

/** Convert [h, s, l] to space-separated RGB channels string "R G B" */
function hslToChannels(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = hue2rgb(h + 1 / 3);
    g = hue2rgb(h);
    b = hue2rgb(h - 1 / 3);
  }
  return `${Math.round(r * 255)} ${Math.round(g * 255)} ${Math.round(b * 255)}`;
}

/**
 * Generate a full primary color palette from a single base hex color.
 * Returns CSS variable values (space-separated RGB channels) for each shade.
 */
export function generatePalette(hex: string): Record<string, string> {
  if (!hex || !hex.startsWith("#") || hex.length < 7) hex = "#2D1B4E";
  const [h, s, l] = hexToHsl(hex);

  return {
    "50":  hslToChannels(h, Math.max(s * 0.3, 12), Math.min(l + 68, 94)),
    "100": hslToChannels(h, Math.max(s * 0.4, 18), Math.min(l + 55, 87)),
    "200": hslToChannels(h, Math.max(s * 0.6, 28), Math.min(l + 40, 77)),
    "300": hslToChannels(h, Math.max(s * 0.75, 38), Math.min(l + 26, 65)),
    "400": hslToChannels(h, Math.max(s * 0.9, 48), Math.min(l + 12, 52)),
    "500": hslToChannels(h, s, l),
    "600": hslToChannels(h, Math.min(s * 1.05, 95), Math.max(l - 6, 6)),
    "700": hslToChannels(h, Math.min(s * 1.1, 95), Math.max(l - 13, 4)),
    "800": hslToChannels(h, Math.min(s * 1.1, 90), Math.max(l - 20, 3)),
    "900": hslToChannels(h, Math.min(s * 1.05, 85), Math.max(l - 26, 2)),
  };
}

/** Apply a primary hex color to the document's CSS variables */
export function applyPrimaryColor(hex: string) {
  const palette = generatePalette(hex);
  const root = document.documentElement;
  Object.entries(palette).forEach(([shade, channels]) => {
    root.style.setProperty(`--cp-${shade}`, channels);
  });
  root.style.setProperty("--cp", palette["500"]);
}
