/**
 * Client-side background removal for logos with solid-color backgrounds.
 *
 * Algorithm:
 *  1. Sample the background color from all 4 corners (median, noise-resistant)
 *  2. BFS flood-fill from every corner — marks pixels "connected to background
 *     AND similar in color" as transparent
 *  3. Soft-edge pass — any surviving pixel that borders a removed pixel gets
 *     its alpha feathered based on how close it is to the background color,
 *     producing smooth, anti-aliased edges instead of a hard staircase
 *
 * Works great for logos with white, colored, or slightly uneven solid
 * backgrounds (including JPEG compression artifacts).
 */

interface RemoveBgOptions {
  /** 0–255 color-distance threshold. Higher = more aggressive. Default 40. */
  tolerance?: number;
  /**
   * Feather range beyond `tolerance` used for the soft-edge pass.
   * 0.4 means pixels up to `tolerance * 1.4` away from bg color
   * get partial transparency. Default 0.4.
   */
  feather?: number;
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? Math.round((s[m - 1] + s[m]) / 2) : s[m];
}

function colorDist(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function removeBackground(
  dataUrl: string,
  options: RemoveBgOptions = {}
): Promise<string> {
  const { tolerance = 40, feather = 0.4 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      // ── Step 1: Sample background color from corners ───────────────────────
      // Use a patch of up to 8 pixels from each corner for noise resistance.
      const patchR = Math.max(1, Math.min(8, Math.floor(Math.min(w, h) * 0.025)));
      const rs: number[] = [], gs: number[] = [], bs: number[] = [];

      for (let dy = 0; dy < patchR; dy++) {
        for (let dx = 0; dx < patchR; dx++) {
          const coords: [number, number][] = [
            [dx, dy],
            [w - 1 - dx, dy],
            [dx, h - 1 - dy],
            [w - 1 - dx, h - 1 - dy],
          ];
          for (const [cx, cy] of coords) {
            const pi = (cy * w + cx) * 4;
            rs.push(d[pi]);
            gs.push(d[pi + 1]);
            bs.push(d[pi + 2]);
          }
        }
      }

      const bgR = median(rs);
      const bgG = median(gs);
      const bgB = median(bs);

      // ── Step 2: BFS flood-fill from all 4 corners ────────────────────────
      const removed = new Uint8Array(w * h); // 1 = removed (transparent)
      const inQueue = new Uint8Array(w * h); // 1 = already queued

      const queue: number[] = [];

      const enqueue = (x: number, y: number) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const idx = y * w + x;
        if (inQueue[idx]) return;
        inQueue[idx] = 1;
        queue.push(idx);
      };

      enqueue(0, 0);
      enqueue(w - 1, 0);
      enqueue(0, h - 1);
      enqueue(w - 1, h - 1);

      let head = 0;
      while (head < queue.length) {
        const idx = queue[head++];
        const x = idx % w;
        const y = (idx / w) | 0;
        const pi = idx * 4;

        // Already transparent (e.g. PNG with existing transparency) — treat as bg
        if (d[pi + 3] === 0) {
          removed[idx] = 1;
          enqueue(x - 1, y); enqueue(x + 1, y);
          enqueue(x, y - 1); enqueue(x, y + 1);
          continue;
        }

        const dist = colorDist(d[pi], d[pi + 1], d[pi + 2], bgR, bgG, bgB);
        if (dist > tolerance) continue; // foreground — stop expanding

        removed[idx] = 1;
        enqueue(x - 1, y); enqueue(x + 1, y);
        enqueue(x, y - 1); enqueue(x, y + 1);
      }

      // ── Step 3: Apply transparency + soft-edge feathering ────────────────
      const softLimit = tolerance * (1 + feather);

      for (let idx = 0; idx < w * h; idx++) {
        const pi = idx * 4;
        const x = idx % w;
        const y = (idx / w) | 0;

        if (removed[idx]) {
          d[pi + 3] = 0;
          continue;
        }

        // Check 4-neighbour adjacency to a removed pixel
        const nextTo =
          (x > 0     && removed[idx - 1]) ||
          (x < w - 1 && removed[idx + 1]) ||
          (y > 0     && removed[idx - w]) ||
          (y < h - 1 && removed[idx + w]);

        if (!nextTo) continue; // interior foreground — leave fully opaque

        // Edge pixel: feather alpha based on distance to background color
        const dist = colorDist(d[pi], d[pi + 1], d[pi + 2], bgR, bgG, bgB);
        if (dist >= softLimit) continue; // clearly foreground, leave opaque

        // dist is in range [0, softLimit]; map to alpha [0, 1]
        const alpha = dist <= tolerance
          ? dist / tolerance          // inside the bg zone → nearly transparent
          : (dist - tolerance) / (tolerance * feather); // feather zone → ramp up

        d[pi + 3] = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}
