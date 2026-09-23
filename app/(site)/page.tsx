import Link from "next/link";
import { getShows } from "@/lib/feed";
import EpisodeList from "@/components/EpisodeList";
import AdSlot from "@/components/AdSlot";

export const revalidate = 900;

export default async function Home() {
  const shows = await getShows();
  if (!shows.length) return <p className="empty">Episodes are not available right now. Please try again shortly.</p>;

  return (
    <>
      <AdSlot name="leaderboard" />
      {shows.map((show) => (
        <section key={show.slug} className="show-block">
          <h1 className="show-title"><Link href={`/${show.slug}`}>{show.title}</Link></h1>
          {show.description && <p className="show-desc">{show.description}</p>}
          <EpisodeList show={show} limit={shows.length > 1 ? 5 : undefined} />
          {shows.length > 1 && <Link className="more" href={`/${show.slug}`}>All episodes</Link>}
        </section>
      ))}
    </>
  );
}
