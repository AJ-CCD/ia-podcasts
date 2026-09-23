"use client";

import { useEffect, useId } from "react";
import ads from "@/config/ads.json";

type SlotName = keyof typeof ads.slots;

declare global {
  interface Window { googletag?: any }
}

let gptLoaded = false;
const loadGpt = () => {
  if (gptLoaded) return;
  gptLoaded = true;
  window.googletag = window.googletag || { cmd: [] };
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
  document.head.appendChild(s);
};

export default function AdSlot({ name }: { name: SlotName }) {
  const cfg = ads.slots[name];
  const id = `ad-${name}-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    if (!cfg.path) return;
    loadGpt();
    const gt = window.googletag;
    let slot: any;
    gt.cmd.push(() => {
      const mapping = gt.sizeMapping().addSize([768, 0], cfg.desktopSizes).addSize([0, 0], cfg.mobileSizes).build();
      slot = gt.defineSlot(cfg.path, [...cfg.desktopSizes, ...cfg.mobileSizes], id);
      if (!slot) return;
      slot.defineSizeMapping(mapping).addService(gt.pubads());
      gt.pubads().setTargeting("site", "podcasts");
      gt.pubads().setTargeting("UrlHost", window.location.hostname);
      gt.pubads().enableSingleRequest();
      gt.enableServices();
      gt.display(id);
    });
    return () => { gt.cmd.push(() => slot && gt.destroySlots([slot])); };
  }, [cfg, id]);

  if (!cfg.path) return null;
  return <div className={`ad ad-${name}`}><div id={id} /></div>;
}
