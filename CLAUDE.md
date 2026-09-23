# The Inside Adviser Podcasts (podcasts.insideadviser.com.au)

Next.js 15 on Vercel. Replaces the Captivate iframe player, which fails for some listeners.

- Data: Captivate RSS feeds listed in `config/shows.json`. Never hardcode episode pages.
- Player: `components/Player.tsx`, native HTML5 audio. Plays direct from Captivate (keeps Captivate stats accurate). If that fails, retries via `/api/audio/[show]/[episode]` on our own domain.
- Ads: GAM slots in `config/ads.json`, same ad units as insideadviser.com.au. Empty `path` means the slot is not rendered; empty `mobileSizes` means desktop only.
- Analytics: set `NEXT_PUBLIC_GTM_ID`. dataLayer events: podcast_play, podcast_progress, podcast_complete, podcast_fallback, podcast_error.
- Look and feel: header, footer and page markup in `components/ia/`, `components/ShowListing.tsx` and `components/PodcastCard.tsx` copy insideadviser.com.au's markup and class names. Styling comes from their real theme CSS in `styles/ia-theme.css` (fonts in `public/ia-fonts/`), synced weekly by `.github/workflows/sync-ia-theme.yml`. Never edit `styles/ia-theme.css` by hand. `app/globals.css` only covers the episode player and small gaps.
- Header links, footer text and logos: `config/site.json`.
- Feeds revalidate every 15 minutes.
- Test locally with `"feed": "file:fixtures/sample.xml"`. Do not commit that.
