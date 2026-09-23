import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisode, getShows, formatDate, formatDuration } from "@/lib/feed";
import Player from "@/components/Player";
import AdSlot from "@/components/AdSlot";
import site from "@/config/site.json";

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
    <section className="category-section tpl-section single-podcast">
      <div className="container">
        <div className="row">
          <div className="col-lg-9">
            <article className="single-article__content episode">
              <div className="single-article__breadcrumbs">
                <div className="article-info">
                  <p className="article-cat mb-0"><Link href={`/${show.slug}`}>PODCAST</Link></p>
                </div>
              </div>
              <div className="section-title"><h1>{ep.title}</h1></div>
              <div className="single-article-info">
                <p className="single-article-author mb-0"><a href={site.parentUrl}>{site.parentName}</a></p>
                <p className="single-article-date mb-0">{[formatDate(ep.pubDate), formatDuration(ep.duration)].filter(Boolean).join(", ")}</p>
              </div>
              <Player
                directUrl={ep.audioUrl}
                proxyUrl={`/api/audio/${show.slug}/${ep.slug}`}
                title={ep.title}
                showTitle={show.title}
                image={ep.image}
                apple={show.apple}
                spotify={show.spotify}
              />
              <div className="article-content notes" dangerouslySetInnerHTML={{ __html: ep.html }} />
            </article>
          </div>
          <div className="col-lg-3 d-none d-lg-block">
            <aside className="sidebar single-article__sidebar">
              <AdSlot name="halfpage" />
              <AdSlot name="mrec" />
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
