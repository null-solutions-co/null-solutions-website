"use client";

import { useEffect } from "react";
import { onScrollFrame } from "@/lib/scroll";

/**
 * Flips the fixed header to dark ink while a light section (`data-header="light"`)
 * sits under it. Reads a handful of section rects per frame — no blend modes,
 * which cost a full-page composite on the integrated-GPU target.
 *
 * On phones it also tucks the header away while you scroll down and brings it
 * back as soon as you scroll up (never while the menu is open).
 */
export function HeaderTone() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;
    const probe = 34;
    const phone = window.matchMedia("(max-width: 767px)");
    let lastY = window.scrollY;

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

      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      const hide = phone.matches && !document.documentElement.dataset.menu && y > 140 && dy > 4;
      const show = !phone.matches || y < 140 || dy < -4 || !!document.documentElement.dataset.menu;
      if (hide && header.dataset.hidden !== "") header.dataset.hidden = "";
      else if (show && header.dataset.hidden === "") delete header.dataset.hidden;
    });
  }, []);

  return null;
}
