import { XMLParser } from "fast-xml-parser";
import sanitizeHtml from "sanitize-html";
import showsConfig from "@/config/shows.json";

export type ShowConfig = { slug: string; feed: string; apple?: string; spotify?: string };

export type Episode = {
  slug: string;
  guid: string;
  title: string;
  pubDate: string | null;
  summary: string;
  html: string;
  audioUrl: string;
  audioType: string;
  duration: number | null;
  image: string | null;
};

export type Show = {
  slug: string;
  title: string;
  description: string;
  image: string | null;
  apple: string;
  spotify: string;
  episodes: Episode[];
};

export const REVALIDATE_SECONDS = 900;

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

const text = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number") return String(v);
  if (typeof v === "object" && "#text" in (v as object)) return text((v as Record<string, unknown>)["#text"]);
  return "";
};
const arr = <T,>(v: T | T[] | undefined): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

const parseDuration = (v: string): number | null => {
  if (!v) return null;
  const parts = v.split(":").map(Number);
  if (parts.some(isNaN)) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").slice(0, 80).replace(/-+$/, "") || "episode";

const clean = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.filter((t) => t !== "iframe"),
    allowedAttributes: { a: ["href", "target", "rel"] },
    transformTags: { a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }) },
  });

const plain = (html: string) => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();

async function loadXml(url: string): Promise<string> {
  if (url.startsWith("file:")) {
    const { readFile } = await import("fs/promises");
    return readFile(url.slice(5), "utf8");
  }
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { "User-Agent": "InsideAdviserPodcasts/1.0" },
  });
  if (!res.ok) throw new Error(`Feed ${url} returned ${res.status}`);
  return res.text();
}

async function loadShow(cfg: ShowConfig): Promise<Show | null> {
  try {
    const doc = parser.parse(await loadXml(cfg.feed));
    const ch = doc?.rss?.channel;
    if (!ch) throw new Error("No channel in feed");
    const showImage = ch["itunes:image"]?.["@_href"] || text(ch.image?.url) || null;
    const used = new Set<string>();

    const episodes: Episode[] = arr(ch.item)
      .map((it: Record<string, any>): Episode | null => {
        const enc = arr(it.enclosure)[0] as Record<string, string> | undefined;
        if (!enc?.["@_url"]) return null;
        const title = text(it.title) || "Untitled episode";
        let slug = slugify(title);
        let n = 2;
        while (used.has(slug)) slug = `${slugify(title)}-${n++}`;
        used.add(slug);
        const rawHtml = text(it["content:encoded"]) || text(it.description) || text(it["itunes:summary"]);
        const pd = text(it.pubDate);
        return {
          slug,
          guid: text(it.guid) || enc["@_url"],
          title,
          pubDate: pd ? new Date(pd).toISOString() : null,
          summary: plain(rawHtml).slice(0, 220),
          html: clean(rawHtml),
          audioUrl: enc["@_url"],
          audioType: enc["@_type"] || "audio/mpeg",
          duration: parseDuration(text(it["itunes:duration"])),
          image: it["itunes:image"]?.["@_href"] || showImage,
        };
      })
      .filter((e): e is Episode => e !== null)
      .sort((a, b) => (b.pubDate ?? "").localeCompare(a.pubDate ?? ""));

    return {
      slug: cfg.slug,
      title: text(ch.title),
      description: plain(text(ch.description) || text(ch["itunes:summary"])),
      image: showImage,
      apple: cfg.apple || "",
      spotify: cfg.spotify || "",
      episodes,
    };
  } catch (err) {
    console.error(`[feed] ${cfg.slug}:`, err);
    return null;
  }
}

export async function getShows(): Promise<Show[]> {
  const shows = await Promise.all((showsConfig as ShowConfig[]).map(loadShow));
  return shows.filter((s): s is Show => s !== null);
}

export async function getShow(slug: string): Promise<Show | null> {
  const cfg = (showsConfig as ShowConfig[]).find((s) => s.slug === slug);
  return cfg ? loadShow(cfg) : null;
}

export async function getEpisode(showSlug: string, epSlug: string) {
  const show = await getShow(showSlug);
  const episode = show?.episodes.find((e) => e.slug === epSlug);
  return show && episode ? { show, episode } : null;
}

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Melbourne" }) : "";

export const formatDuration = (s: number | null) => {
  if (!s) return "";
  const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
  return h ? `${h} hr ${m} min` : `${m} min`;
};
