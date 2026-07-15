import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSedimentStore } from "@/lib/store";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: "sm" | "md" | "lg";
}

const WIDTH_MAP = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };

export function Modal({ open, onClose, title, children, width = "md" }: ModalProps) {
  const reducedMotion = useSedimentStore((s) => s.settings.reducedMotion);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={`w-full ${WIDTH_MAP[width]} max-h-[85vh] overflow-y-auto rounded-2xl border border-stone-700/60 bg-stone-900 shadow-panel`}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-stone-800 px-5 py-3.5">
              <h2 className="font-display text-lg font-bold text-sand-50">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1.5 text-sand-400 hover:bg-stone-800 hover:text-sand-100"
              >
                <X size={18} />
              </button>
            </header>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
