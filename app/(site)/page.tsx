import { getShows } from "@/lib/feed";
import ShowListing from "@/components/ShowListing";

export const revalidate = 900;

export default async function Home() {
  const shows = await getShows();
  if (!shows.length) return <div className="container"><p className="empty">Episodes are not available right now. Please try again shortly.</p></div>;
  return <>{shows.map((show, i) => <ShowListing key={show.slug} show={show} heading={i ? "h2" : "h1"} />)}</>;
}
