"use client";

// Native audio bar used on listing cards, styled by the theme's .podcast-div-audio.
// Falls back to our own domain like Player does, and sends the same events.
import { useRef, useState } from "react";
import { track } from "@/lib/track";

type Props = { directUrl: string; proxyUrl: string; title: string; showTitle: string; className?: string };

export default function CardAudio({ directUrl, proxyUrl, title, showTitle, className = "" }: Props) {
  const [src, setSrc] = useState(directUrl);
  const done = useRef(new Set<number>());
  const meta = { podcast_show: showTitle, podcast_episode: title };

  return (
    <div className={`podcast-div-audio ${className}`.trim()}>
      <audio
        src={src}
        controls
        preload="none"
        aria-label={`Play ${title}`}
        onPlay={() => track("podcast_play", meta)}
        onEnded={() => track("podcast_complete", meta)}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          if (!a.duration) return;
          const pct = (a.currentTime / a.duration) * 100;
          for (const m of [25, 50, 75]) {
            if (pct >= m && !done.current.has(m)) { done.current.add(m); track("podcast_progress", { ...meta, percent: m }); }
          }
        }}
        onError={(e) => {
          if (src === directUrl) {
            track("podcast_fallback", meta);
            const a = e.currentTarget;
            setSrc(proxyUrl);
            a.addEventListener("loadedmetadata", () => a.play().catch(() => {}), { once: true });
          } else {
            track("podcast_error", meta);
          }
        }}
      />
    </div>
  );
}
