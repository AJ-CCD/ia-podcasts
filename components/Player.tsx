"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";

type Props = {
  directUrl: string;
  proxyUrl: string;
  title: string;
  showTitle: string;
  image: string | null;
  apple?: string;
  spotify?: string;
};


const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? h + ":" : ""}${mm}:${String(sec).padStart(2, "0")}`;
};

const SPEEDS = [1, 1.25, 1.5, 2];

export default function Player({ directUrl, proxyUrl, title, showTitle, image, apple, spotify }: Props) {
  const audio = useRef<HTMLAudioElement>(null);
  const [src, setSrc] = useState(directUrl);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const resumeAt = useRef(0);
  const wantPlay = useRef(false);
  const milestones = useRef(new Set<number>());

  const meta = { podcast_show: showTitle, podcast_episode: title };

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title, artist: showTitle, artwork: image ? [{ src: image, sizes: "512x512" }] : [],
    });
    navigator.mediaSession.setActionHandler("seekbackward", () => skip(-15));
    navigator.mediaSession.setActionHandler("seekforward", () => skip(30));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, showTitle, image]);

  const toggle = async () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) {
      wantPlay.current = true;
      setLoading(true);
      try { await a.play(); } catch { if (a.error) onError(); else setLoading(false); }
    } else { wantPlay.current = false; a.pause(); }
  };

  const skip = (d: number) => {
    const a = audio.current;
    if (a) a.currentTime = Math.max(0, Math.min((a.duration || Infinity), a.currentTime + d));
  };

  const onError = () => {
    // Direct Captivate URL blocked or failed: retry through our own domain
    if (src === directUrl) {
      resumeAt.current = audio.current?.currentTime || 0;
      track("podcast_fallback", meta);
      setSrc(proxyUrl);
      return;
    }
    setLoading(false);
    setPlaying(false);
    setFailed(true);
    track("podcast_error", meta);
  };

  useEffect(() => {
    // The metadata request can fail before React hydrates and attaches onError
    if (audio.current?.error) onError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // After switching to the proxy source, resume and play
    const a = audio.current;
    if (!a || src === directUrl) return;
    a.load();
    const onReady = () => {
      if (resumeAt.current) a.currentTime = resumeAt.current;
      if (wantPlay.current) a.play().catch(() => setLoading(false));
    };
    a.addEventListener("loadedmetadata", onReady, { once: true });
    return () => a.removeEventListener("loadedmetadata", onReady);
  }, [src, directUrl]);

  const onTime = () => {
    const a = audio.current!;
    setTime(a.currentTime);
    if (!a.duration) return;
    const pct = Math.floor((a.currentTime / a.duration) * 100);
    for (const m of [25, 50, 75]) {
      if (pct >= m && !milestones.current.has(m)) {
        milestones.current.add(m);
        track("podcast_progress", { ...meta, percent: m });
      }
    }
  };

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
    setSpeed(next);
    if (audio.current) audio.current.playbackRate = next;
  };

  return (
    <div className="player">
      <audio
        ref={audio}
        src={src}
        preload="metadata"
        onPlay={() => { setPlaying(true); track("podcast_play", meta); }}
        onPlaying={() => setLoading(false)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onLoadedMetadata={(e) => { setDuration(e.currentTarget.duration); e.currentTarget.playbackRate = speed; }}
        onTimeUpdate={onTime}
        onEnded={() => { setPlaying(false); track("podcast_complete", meta); }}
        onError={onError}
      />

      {failed ? (
        <div className="player-failed" role="alert">
          <p>This episode could not play in your browser. It may be blocked by your network.</p>
          <p>Listen instead on{" "}
            {apple && <><a href={apple} target="_blank" rel="noopener noreferrer">Apple Podcasts</a>{spotify ? ", " : " or "}</>}
            {spotify && <><a href={spotify} target="_blank" rel="noopener noreferrer">Spotify</a> or </>}
            <a href={directUrl} download>download the MP3</a>.
          </p>
        </div>
      ) : (
        <>
          <div className="player-main">
            <button className="play" onClick={toggle} aria-label={playing ? "Pause" : "Play"} data-loading={loading || undefined}>
              {playing ? (
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>
              )}
            </button>
            <div className="scrub">
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={1}
                value={time}
                onChange={(e) => { if (audio.current) audio.current.currentTime = Number(e.target.value); }}
                aria-label="Seek"
                style={{ ["--p" as string]: duration ? `${(time / duration) * 100}%` : "0%" }}
              />
              <div className="times"><span>{fmt(time)}</span><span>{duration ? `-${fmt(duration - time)}` : ""}</span></div>
            </div>
          </div>
          <div className="player-controls">
            <button onClick={() => skip(-15)} aria-label="Back 15 seconds">Back 15s</button>
            <button onClick={() => skip(30)} aria-label="Forward 30 seconds">Forward 30s</button>
            <button onClick={cycleSpeed} aria-label={`Playback speed ${speed}x`}>{speed}x</button>
          </div>
        </>
      )}

      <div className="elsewhere">
        {apple && <a href={apple} target="_blank" rel="noopener noreferrer">Apple Podcasts</a>}
        {spotify && <a href={spotify} target="_blank" rel="noopener noreferrer">Spotify</a>}
        <a href={directUrl} download>Download MP3</a>
      </div>
    </div>
  );
}
