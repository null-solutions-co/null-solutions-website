"use client";

import { useEffect } from "react";
import { onScrollFrame } from "@/lib/scroll";

/**
 * Flips the fixed header to dark ink while a light section (`data-header="light"`)
 * sits under it. Reads a handful of section rects per frame — no blend modes,
 * which cost a full-page composite on the integrated-GPU target.
 */
export function HeaderTone() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;
    const probe = 34;

    return onScrollFrame(() => {
      let light = false;
      for (const el of document.querySelectorAll<HTMLElement>('[data-header="light"]')) {
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          light = true;
          break;
        }
      }
      const tone = light ? "light" : "dark";
      if (header.dataset.tone !== tone) header.dataset.tone = tone;
    });
  }, []);

  return null;
}
