import type { ReactNode } from "react";

export interface PanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  eyebrow?: string;
  accent?: "bronze" | "gold" | "none";
  action?: ReactNode;
}

/**
 * Panel — the recurring dark, bronze-bordered card that every
 * surface in Sediment is built from (dig site frame, discovery card,
 * live discussions, museum collection strip, etc).
 */
export function Panel({ children, className = "", title, eyebrow, accent = "none", action }: PanelProps) {
  const accentBorder =
    accent === "bronze" ? "border-bronze-700/60" : accent === "gold" ? "border-gold-500/60" : "border-stone-700/60";

  return (
    <section className={`relative rounded-xl border-[3px] ${accentBorder} bg-panel shadow-panel bg-panel-texture bg-cover bg-center bg-no-repeat overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-stone-900/40 mix-blend-multiply pointer-events-none" />
      <div className="relative z-10">
      {(title || eyebrow) && (
        <header className="flex items-center justify-between px-4 pt-3">
          <div>
            {eyebrow && <p className="text-[11px] font-semibold tracking-widest text-gold-400/90 uppercase">{eyebrow}</p>}
            {title && <h2 className="text-lg font-bold text-sand-100">{title}</h2>}
          </div>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
      </div>
    </section>
  );
}
