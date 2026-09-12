// Rough Bortle-scale estimate for a point, derived by sampling the brightness
// of NASA's Black Marble night-lights imagery — the same tiles the map
// already serves through /api/gibs. Runs in the browser (canvas pixel reads).
//
// Thresholds were calibrated against known skies (5×5-pixel mean luminance at
// zoom 8): BWCA wilderness ~12, Cherry Springs ~7, rural Iowa ~22, suburbs
// ~145, town centers ~185, metro cores 255 (saturated). It's an ESTIMATE —
// satellite radiance measures light emitted upward at the ground, not the
// glow you see in the sky, so always present it with a "~" and "(est.)".

export type BortleEstimate = {
  bortle: number; // 1–9 (1–2 reported together as 2)
  label: string;
  description: string;
  luminance: number; // raw 0–255 sample mean, for debugging
};

const BINS: { max: number; bortle: number; label: string; description: string }[] = [
  { max: 13, bortle: 2, label: "Bortle 1–2", description: "Pristine dark sky — bright, detailed Milky Way" },
  { max: 18, bortle: 3, label: "Bortle 3", description: "Rural sky — Milky Way clearly visible" },
  { max: 40, bortle: 4, label: "Bortle 4", description: "Rural/suburban — Milky Way visible overhead" },
  { max: 90, bortle: 5, label: "Bortle 5", description: "Suburban — Milky Way faint at best" },
  { max: 160, bortle: 6, label: "Bortle 6", description: "Bright suburban — Milky Way invisible" },
  { max: 220, bortle: 7, label: "Bortle 7", description: "Suburban/urban — light domes all around" },
  { max: 250, bortle: 8, label: "Bortle 8", description: "City sky — only the brightest stars" },
  { max: Infinity, bortle: 9, label: "Bortle 9", description: "Inner city — a handful of stars" },
];

// Same "yesterday" logic the map layer uses, so the tile is already cached.
function latestGibsDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function estimateBortle(lat: number, lng: number): Promise<BortleEstimate | null> {
  try {
    const z = 8; // max native zoom of the GIBS layer (~600 m/px)
    const worldPx = 256 * 2 ** z;
    const xWorld = ((lng + 180) / 360) * worldPx;
    const latRad = (lat * Math.PI) / 180;
    const yWorld =
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * worldPx;
    if (!Number.isFinite(yWorld) || yWorld < 0 || yWorld >= worldPx) return null;

    const tileX = Math.floor(xWorld / 256);
    const tileY = Math.floor(yWorld / 256);
    const px = Math.floor(xWorld % 256);
    const py = Math.floor(yWorld % 256);

    const res = await fetch(`/api/gibs/${z}/${tileX}/${tileY}?date=${latestGibsDate()}`);
    if (!res.ok) return null;
    const bitmap = await createImageBitmap(await res.blob());

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);

    // 5×5 mean luminance around the point (~3 km) smooths pixel noise.
    const x0 = Math.min(251, Math.max(0, px - 2));
    const y0 = Math.min(251, Math.max(0, py - 2));
    const data = ctx.getImageData(x0, y0, 5, 5).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    const luminance = sum / 25;

    const bin = BINS.find((b) => luminance < b.max) ?? BINS[BINS.length - 1];
    return { bortle: bin.bortle, label: bin.label, description: bin.description, luminance };
  } catch {
    return null;
  }
}
