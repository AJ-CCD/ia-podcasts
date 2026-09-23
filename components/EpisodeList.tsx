import Link from "next/link";
import type { Show } from "@/lib/feed";
import { formatDate, formatDuration } from "@/lib/feed";

export default function EpisodeList({ show, limit }: { show: Show; limit?: number }) {
  const eps = limit ? show.episodes.slice(0, limit) : show.episodes;
  return (
    <ol className="episodes">
      {eps.map((ep) => (
        <li key={ep.guid}>
          <Link href={`/${show.slug}/${ep.slug}`}>
            <h2>{ep.title}</h2>
            <p className="meta">{[formatDate(ep.pubDate), formatDuration(ep.duration)].filter(Boolean).join(", ")}</p>
            {ep.summary && <p className="summary">{ep.summary}</p>}
          </Link>
        </li>
      ))}
    </ol>
  );
}
