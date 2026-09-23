import { getEpisode } from "@/lib/feed";

// Fallback audio stream served from our own domain, used only when the
// listener's browser or network cannot reach Captivate directly.
// Looks up the enclosure server-side so this is never an open proxy.
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: Request, { params }: { params: Promise<{ show: string; episode: string }> }) {
  const { show, episode } = await params;
  const found = await getEpisode(show, episode);
  if (!found) return new Response("Not found", { status: 404 });

  const headers: Record<string, string> = { "User-Agent": req.headers.get("user-agent") || "InsideAdviserPodcasts/1.0" };
  const range = req.headers.get("range");
  if (range) headers.Range = range;
  const ip = req.headers.get("x-forwarded-for");
  if (ip) headers["X-Forwarded-For"] = ip.split(",")[0].trim();

  const upstream = await fetch(found.episode.audioUrl, { headers, redirect: "follow", cache: "no-store" });
  if (!upstream.ok && upstream.status !== 206) return new Response("Audio unavailable", { status: 502 });

  const out = new Headers({
    "Content-Type": upstream.headers.get("content-type") || found.episode.audioType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
  });
  for (const h of ["content-length", "content-range"]) {
    const v = upstream.headers.get(h);
    if (v) out.set(h, v);
  }
  return new Response(upstream.body, { status: upstream.status, headers: out });
}
