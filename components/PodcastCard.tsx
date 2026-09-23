import Link from "next/link";
import type { Episode, Show } from "@/lib/feed";
import site from "@/config/site.json";
import CardAudio from "@/components/CardAudio";
import { SpotifyIcon } from "@/components/ia/icons";

// Card markup mirrors the insideadviser.com.au podcast archive
export default function PodcastCard({ show, ep, highlight }: { show: Show; ep: Episode; highlight?: boolean }) {
  const href = `/${show.slug}/${ep.slug}`;
  const audio = { directUrl: ep.audioUrl, proxyUrl: `/api/audio/${show.slug}/${ep.slug}`, title: ep.title, showTitle: show.title };

  // desktop: shown beside the artwork on large screens; false: below it on small screens;
  // null: the highlight card, which uses one block at every size
  const info = (desktop: boolean | null) => (
    <div className={`podcast-horizontal__info ${desktop === null ? "" : desktop ? "d-none d-lg-flex" : "d-lg-none"}`.trim()}>
      <div>
        <h2 className="card-title"><Link href={href} title={ep.title}>{ep.title}</Link></h2>
        {ep.summary && <p className="card-text">{ep.summary.length >= 150 ? ep.summary.slice(0, 150).trimEnd() + "..." : ep.summary}</p>}
        {desktop !== false && <CardAudio {...audio} />}
        <div className="wrap-original-source">
          <div className="article-info">
            <p className="article-cat mb-0"><Link href="/">PODCAST</Link></p>
            <p className="article-author mb-0"><a href={site.parentUrl}>{site.parentName}</a></p>
          </div>
          <div className="original-source">
            {show.spotify && (
              <a href={show.spotify} title={`Spotify link - ${ep.title}`} target="_blank" rel="noopener noreferrer"><SpotifyIcon /></a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="article-card">
      <div className="wrap-audio">
        <div className="thumb-art">
          <Link className="thumb thumb-1x1" href={href} title={ep.title}>
            {ep.image && <img src={ep.image} className="img-fluid object-cover" alt={ep.title} loading="lazy" />}
          </Link>
        </div>
        {highlight ? info(null) : <><CardAudio {...audio} className="d-lg-none" />{info(true)}</>}
      </div>
      {!highlight && info(false)}
    </div>
  );
}
