import { Fragment } from "react";
import type { Show } from "@/lib/feed";
import AdSlot from "@/components/AdSlot";
import PodcastCard from "@/components/PodcastCard";

// Layout mirrors insideadviser.com.au/captivate-podcast/
export default function ShowListing({ show, heading = "h1" }: { show: Show; heading?: "h1" | "h2" }) {
  const [latest, ...rest] = show.episodes;
  const H = heading;
  return (
    <>
      <section className="heading-filter-category-section tpl-section heading-filter-author-section">
        <div className="container">
          <div className="heading-filter-category-section__header">
            <div className="section-title">
              <H><a className="d-flex">{show.title}</a></H>
              {show.description && <p className="category_description">{show.description}</p>}
            </div>
          </div>
        </div>
      </section>

      {latest && (
        <section className="podcast-hightlight-section tpl-section">
          <div className="container">
            <div className="podcast-horizontal">
              <PodcastCard show={show} ep={latest} highlight />
            </div>
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section className="category-section tpl-section podcast-category-section">
          <div className="container">
            <div className="row">
              <div className="col-lg-9">
                <ul className="ul ul-podcasts">
                  {rest.map((ep, i) => (
                    <Fragment key={ep.guid}>
                      <li><div className="podcast-horizontal"><PodcastCard show={show} ep={ep} /></div></li>
                      {i % 3 === 2 && i < rest.length - 1 && <li><AdSlot name="leaderboard" /></li>}
                    </Fragment>
                  ))}
                </ul>
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
      )}
    </>
  );
}
