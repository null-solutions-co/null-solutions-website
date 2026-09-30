"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Toast = { id: number; title: string; tone?: "info" | "ok" };
type Ctx = { push: (t: Omit<Toast, "id">) => void };

const ToastContext = createContext<Ctx>({ push: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { ...t, id }]);
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 rounded-md border border-line bg-surface px-4 py-2.5 text-sm text-fg shadow-[var(--shadow-float)]"
          >
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ background: t.tone === "ok" ? "var(--ok)" : "var(--signal)" }}
            />
            {t.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
