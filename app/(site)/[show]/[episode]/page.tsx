import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisode, getShows, formatDate, formatDuration } from "@/lib/feed";
import Player from "@/components/Player";
import AdSlot from "@/components/AdSlot";

export const revalidate = 900;
export const dynamicParams = true;

export async function generateStaticParams() {
  const shows = await getShows();
  return shows.flatMap((s) => s.episodes.slice(0, 50).map((e) => ({ show: s.slug, episode: e.slug })));
}

type P = { params: Promise<{ show: string; episode: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { show, episode } = await params;
  const found = await getEpisode(show, episode);
  if (!found) return {};
  const { episode: ep } = found;
  return {
    title: ep.title,
    description: ep.summary,
    alternates: { canonical: `/${show}/${episode}` },
    openGraph: { type: "article", title: ep.title, description: ep.summary, images: ep.image ? [ep.image] : [] },
  };
}

export default async function EpisodePage({ params }: P) {
  const { show: showSlug, episode: epSlug } = await params;
  const found = await getEpisode(showSlug, epSlug);
  if (!found) notFound();
  const { show, episode: ep } = found;

  return (
    <>
      <AdSlot name="leaderboard" />
      <article className="episode">
        <Link className="back" href={`/${show.slug}`}>{show.title}</Link>
        <h1>{ep.title}</h1>
        <p className="meta">{[formatDate(ep.pubDate), formatDuration(ep.duration)].filter(Boolean).join(", ")}</p>
        <Player
          directUrl={ep.audioUrl}
          proxyUrl={`/api/audio/${show.slug}/${ep.slug}`}
          title={ep.title}
          showTitle={show.title}
          image={ep.image}
          apple={show.apple}
          spotify={show.spotify}
        />
        <div className="episode-body">
          <div className="notes" dangerouslySetInnerHTML={{ __html: ep.html }} />
          <aside><AdSlot name="mrec" /></aside>
        </div>
      </article>
    </>
  );
}
