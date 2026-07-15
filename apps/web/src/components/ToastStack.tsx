import { AnimatePresence, motion } from "framer-motion";
import { Trophy, Sparkles, Gem, Info, X } from "lucide-react";
import { useSedimentStore } from "@/lib/store";

const ICONS = {
  achievement: Trophy,
  discovery: Sparkles,
  legendary: Gem,
  info: Info,
};

const TONE = {
  achievement: "border-gold-500/60 text-gold-300",
  discovery: "border-teal-500/60 text-teal-300",
  legendary: "border-purple-400/60 text-purple-300",
  info: "border-stone-600/60 text-sand-300",
};

export function ToastStack() {
  const toasts = useSedimentStore((s) => s.toasts);
  const dismissToast = useSedimentStore((s) => s.dismissToast);
  const reducedMotion = useSedimentStore((s) => s.settings.reducedMotion);

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[60] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.kind];
          return (
            <motion.div
              key={toast.id}
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 60 }}
              transition={{ duration: reducedMotion ? 0.1 : 0.3, ease: "easeOut" }}
              className={`pointer-events-auto flex w-72 items-start gap-3 rounded-xl border bg-stone-900/95 p-3 shadow-panel ${TONE[toast.kind]}`}
            >
              <Icon size={20} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-sand-50">{toast.title}</p>
                <p className="text-xs text-sand-400">{toast.body}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 text-sand-500 hover:text-sand-200"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
