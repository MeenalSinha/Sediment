import { useMemo } from "react";
import { Lock, MapPin } from "lucide-react";
import { Modal } from "@/components/Modal";
import { sfx } from "@/lib/sound";

export interface MapModalProps {
  open: boolean;
  onClose: () => void;
  currentChamber: string;
  onSelectChamber: (chamber: string) => void;
}

const CHAMBERS = [
  { id: "temple", label: "Temple", unlocked: true },
  { id: "village", label: "Village", unlocked: true },
  { id: "necropolis", label: "Necropolis", unlocked: true },
  { id: "marketplace", label: "Marketplace", unlocked: true },
  { id: "library", label: "Library", unlocked: false },
  { id: "palace", label: "Palace", unlocked: false },
  { id: "harbor", label: "Harbor", unlocked: true },
  { id: "catacombs", label: "Catacombs", unlocked: false },
  { id: "ruins", label: "Ruins", unlocked: true },
  { id: "hidden_cave", label: "Hidden Cave", unlocked: false },
];

// Fixed layout positions (percent) so the map reads as a coherent site rather than a grid.
const POSITIONS: Record<string, { top: string; left: string }> = {
  temple: { top: "18%", left: "48%" },
  village: { top: "30%", left: "20%" },
  necropolis: { top: "62%", left: "15%" },
  marketplace: { top: "40%", left: "62%" },
  library: { top: "22%", left: "78%" },
  palace: { top: "12%", left: "70%" },
  harbor: { top: "78%", left: "58%" },
  catacombs: { top: "80%", left: "30%" },
  ruins: { top: "55%", left: "45%" },
  hidden_cave: { top: "68%", left: "82%" },
};

export function MapModal({ open, onClose, currentChamber, onSelectChamber }: MapModalProps) {
  const chambers = useMemo(() => CHAMBERS, []);

  return (
    <Modal open={open} onClose={onClose} title="Excavation Map — The Sunken Courtyard" width="lg">
      <div
        className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-stone-700/60"
        style={{
          background: "radial-gradient(circle at 50% 40%, #5b4632 0%, #3a2c1c 55%, #241a10 100%)",
        }}
      >
        {chambers.map((chamber) => {
          const pos = POSITIONS[chamber.id];
          const isCurrent = currentChamber === chamber.id;
          return (
            <button
              key={chamber.id}
              disabled={!chamber.unlocked}
              onClick={() => {
                sfx.click();
                onSelectChamber(chamber.id);
              }}
              style={{ top: pos.top, left: pos.left }}
              className={`group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 ${
                chamber.unlocked ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-panel transition-transform group-hover:scale-110 ${
                  isCurrent ? "border-gold-400 bg-gold-500/30" : "border-bronze-500/70 bg-stone-900/80"
                }`}
              >
                {chamber.unlocked ? (
                  <MapPin size={18} className={isCurrent ? "text-gold-200" : "text-sand-200"} />
                ) : (
                  <Lock size={16} className="text-sand-500" />
                )}
              </span>
              <span className="rounded bg-stone-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-sand-200">
                {chamber.label}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-sand-500">
        Locked chambers unlock as the community clears deeper layers. Fog lifts permanently once a chamber is first
        entered by any digger.
      </p>
    </Modal>
  );
}
