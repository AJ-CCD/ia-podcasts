import type { Metadata } from "next";
import { notFound } from "next/navigation";
import showsConfig from "@/config/shows.json";
import { getShow } from "@/lib/feed";
import ShowListing from "@/components/ShowListing";

export const revalidate = 900;
export const dynamicParams = true;

export function generateStaticParams() {
  return showsConfig.map((s) => ({ show: s.slug }));
}

type P = { params: Promise<{ show: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const show = await getShow((await params).show);
  if (!show) return {};
  return { title: show.title, description: show.description, openGraph: { images: show.image ? [show.image] : [] } };
}

export default async function ShowPage({ params }: P) {
  const show = await getShow((await params).show);
  if (!show) notFound();
  return <ShowListing show={show} />;
}
