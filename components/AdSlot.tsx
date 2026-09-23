"use client";

import { useEffect, useId, useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!cfg.path) return;
    // No sizes for this screen width: leave the slot collapsed, like the parent site does
    const sizes = window.matchMedia("(min-width: 992px)").matches ? cfg.desktopSizes : cfg.mobileSizes;
    if (!sizes.length) { setCollapsed(true); return; }
    loadGpt();
    const gt = window.googletag;
    let slot: any;
    let rendered = false;
    // Collapse slots that never render (ad blockers, no fill), as the parent site does
    const timer = window.setTimeout(() => { if (!rendered) setCollapsed(true); }, 5000);
    gt.cmd.push(() => {
      const mapping = gt.sizeMapping().addSize([992, 0], cfg.desktopSizes).addSize([0, 0], cfg.mobileSizes).build();
      slot = gt.defineSlot(cfg.path, [...cfg.desktopSizes, ...cfg.mobileSizes], id);
      if (!slot) return;
      slot.defineSizeMapping(mapping).addService(gt.pubads());
      gt.pubads().addEventListener("slotRenderEnded", (e: any) => { if (e.slot === slot) { rendered = true; setCollapsed(e.isEmpty); } });
      gt.pubads().setTargeting("site", "podcasts");
      gt.pubads().setTargeting("UrlHost", window.location.hostname);
      gt.pubads().enableSingleRequest();
      gt.enableServices();
      gt.display(id);
    });
    return () => { window.clearTimeout(timer); gt.cmd.push(() => slot && gt.destroySlots([slot])); };
  }, [cfg, id]);

  if (!cfg.path) return null;
  // Same wrapper markup as insideadviser.com.au so the theme CSS sizes it
  const [w, h] = cfg.desktopSizes[0] ?? [0, 0];
  return (
    <div className={`ad-slot ad-slot--loaded${collapsed ? " ad-slot--collapsed" : ""}`} data-ad={`${w}x${h}`} aria-label="Advertisement">
      <div className={`adv-ia adv-ia_${w}x${h}${collapsed ? " adv-ia--collapsed" : ""}`} data-ad-w={w} data-ad-h={h}>
        <div id={id} className="adv-ia__gpt" style={{ maxWidth: "100%" }} />
      </div>
    </div>
  );
}
