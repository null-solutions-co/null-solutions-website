"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(REDUCE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

/**
 * Types a line out one character at a time (optionally cycling through
 * several), with a blinking cursor. From the 21st.dev auth-ui the user picked
 * for the portal sign-in. Screen readers get the whole line at once; the
 * typing itself is decorative. Reduced motion: the line appears whole.
 */
export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const lines = Array.isArray(text) ? text : [text];
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const still = useSyncExternalStore(subscribe, () => window.matchMedia(REDUCE).matches, () => false);
  // Don't type behind the loading screen: start once it has lifted.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = window.setInterval(() => {
      if (!document.documentElement.classList.contains("ns-loading")) {
        window.clearInterval(check);
        setReady(true);
      }
    }, 150);
    return () => window.clearInterval(check);
  }, []);

  const currentText = lines[lineIndex] || "";

  useEffect(() => {
    if (!currentText || still || !ready) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else if (displayText.length > 0) {
          setDisplayText((prev) => prev.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentIndex(0);
          setLineIndex((prev) => (prev + 1) % lines.length);
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [currentIndex, isDeleting, currentText, loop, speed, deleteSpeed, delay, displayText, lines.length, still, ready]);

  return (
    <span className={className}>
      <span className="sr-only">{currentText}</span>
      <span aria-hidden="true">
        {still ? currentText : displayText}
        <span className="animate-pulse">{cursor}</span>
      </span>
    </span>
  );
}
