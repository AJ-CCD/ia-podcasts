# Inside Adviser Podcasts (podcasts.insideadviser.com.au)

Next.js 15 on Vercel. Replaces the Captivate iframe player, which fails for some listeners.

- Data: Captivate RSS feeds listed in `config/shows.json`. Never hardcode episode pages.
- Player: `components/Player.tsx`, native HTML5 audio. Plays direct from Captivate (keeps Captivate stats accurate). If that fails, retries via `/api/audio/[show]/[episode]` on our own domain.
- Ads: GAM slots in `config/ads.json`. Empty `path` means the slot is not rendered.
- Analytics: set `NEXT_PUBLIC_GTM_ID`. dataLayer events: podcast_play, podcast_progress, podcast_complete, podcast_fallback, podcast_error.
- Brand tokens: top of `app/globals.css`.
- Feeds revalidate every 15 minutes.
- Test locally with `"feed": "file:fixtures/sample.xml"`. Do not commit that.
