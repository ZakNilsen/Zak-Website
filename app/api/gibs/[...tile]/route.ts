import { NextRequest, NextResponse } from "next/server";

const NASA_GIBS_BASE = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COORD_RE = /^\d+$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tile: string[] }> }
) {
  const { tile } = await params;
  const date =
    request.nextUrl.searchParams.get("date") ??
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const product = "VIIRS_SNPP_DayNightBand_ENCC";

  const [z, x, yWithExt] = tile;
  if (!z || !x || !yWithExt) {
    return NextResponse.json({ error: "Invalid GIBS tile request" }, { status: 400 });
  }

  if (!DATE_RE.test(date) || !COORD_RE.test(z) || !COORD_RE.test(x) || !COORD_RE.test(yWithExt.replace(/\.(jpe?g|png|webp|gif)$/i, ""))) {
    return NextResponse.json({ error: "Invalid tile parameters" }, { status: 400 });
  }

  const y = yWithExt.replace(/\.(jpe?g|png|webp|gif)$/i, "");
  const targetUrl = `${NASA_GIBS_BASE}/${product}/default/${date}/GoogleMapsCompatible_Level8/${z}/${y}/${x}.jpg`;

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      cache: "force-cache",
    });

    if (!upstream.ok) {
      if (upstream.status === 404 || upstream.status === 403 || upstream.status === 401) {
        return new NextResponse(
          Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAF" +
              "c6k1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJ0UkG" +
              "AAAAAABJRU5ErkJggg==",
            "base64"
          ),
          {
            status: 200,
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "no-store",
            },
          }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch NASA GIBS tile", status: upstream.status },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = Buffer.from(await upstream.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to reach NASA GIBS tile source" }, { status: 502 });
  }
}
