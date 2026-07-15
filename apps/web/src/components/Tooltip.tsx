import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface TooltipProps {
  label: string;
  children: ReactNode;
  side?: "top" | "right";
}

/** A small hover/focus tooltip. Works with keyboard focus too, not just mouse hover, for accessibility. */
export function Tooltip({ label, children, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  const positionClasses =
    side === "top" ? "bottom-full left-1/2 mb-1.5 -translate-x-1/2" : "left-full top-1/2 ml-1.5 -translate-y-1/2";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span aria-describedby={id}>{children}</span>
      <AnimatePresence>
        {visible && (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: side === "top" ? 4 : 0, x: side === "right" ? -4 : 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-stone-700 bg-stone-950 px-2 py-1 text-[11px] text-sand-200 shadow-panel ${positionClasses}`}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
