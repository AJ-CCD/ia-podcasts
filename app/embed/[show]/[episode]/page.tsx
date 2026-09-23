import { notFound } from "next/navigation";
import { getEpisode } from "@/lib/feed";
import Player from "@/components/Player";

export const revalidate = 900;
export const dynamicParams = true;
export const metadata = { robots: { index: false } };

export default async function Embed({ params }: { params: Promise<{ show: string; episode: string }> }) {
  const { show: s, episode: e } = await params;
  const found = await getEpisode(s, e);
  if (!found) notFound();
  const { show, episode: ep } = found;
  return (
    <div className="embed">
      <p className="embed-title">{ep.title}</p>
      <Player directUrl={ep.audioUrl} proxyUrl={`/api/audio/${show.slug}/${ep.slug}`} title={ep.title}
        showTitle={show.title} image={ep.image} apple={show.apple} spotify={show.spotify} />
    </div>
  );
}
