import { useRef, useState } from "react";
import { ArrowUp, Check } from "lucide-react";
import { Modal } from "@/components/Modal";
import { ProgressBar, Button } from "@sediment/ui";
import type { Artifact } from "@sediment/shared";
import type { LocalLoreEntry } from "@/lib/store";
import { sfx } from "@/lib/sound";

export interface ArtifactDetailModalProps {
  open: boolean;
  onClose: () => void;
  artifact: Artifact | null;
  lore: LocalLoreEntry[];
  onVote: (id: string) => void;
  onSubmitLore: (body: string) => void;
}

/** A lightweight drag-to-rotate "3D viewer" placeholder — real production art would swap in a GLTF model viewer. */
function RotatableViewer({ label }: { label: string }) {
  const [rotation, setRotation] = useState({ x: -12, y: 24 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  return (
    <div
      className="relative flex aspect-square cursor-grab items-center justify-center overflow-hidden rounded-lg border border-stone-700/60 bg-gradient-to-b from-stone-800 to-stone-900 active:cursor-grabbing"
      style={{ perspective: "600px" }}
      onPointerDown={(e) => {
        dragging.current = true;
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;
        setRotation((r) => ({ x: r.x - dy * 0.4, y: r.y + dx * 0.4 }));
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      <div
        className="flex h-28 w-28 items-center justify-center rounded-xl bg-gradient-to-br from-bronze-400 to-bronze-700 text-xs font-semibold text-stone-950 shadow-lg"
        style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`, transformStyle: "preserve-3d" }}
      >
        {label}
      </div>
      <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-sand-500">Drag to rotate</p>
    </div>
  );
}

export function ArtifactDetailModal({ open, onClose, artifact, lore, onVote, onSubmitLore }: ArtifactDetailModalProps) {
  const [draft, setDraft] = useState("");

  if (!artifact) return null;

  return (
    <Modal open={open} onClose={onClose} title={artifact.name} width="lg">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <RotatableViewer label={artifact.category} />
          <ProgressBar
            value={artifact.condition}
            color={artifact.condition > 50 ? "teal" : "danger"}
            label="Restoration Quality"
            showPercent
          />
          <dl className="mt-3 space-y-1.5 text-sm">
            <Row label="Material" value={artifact.material ?? "Unknown"} />
            <Row label="Period" value={artifact.period ?? "Unclassified"} />
            <Row label="Discoverers" value={`${artifact.discoveredBy?.length ?? 0} diggers`} />
            <Row label="Status" value={artifact.status.replace("_", " ")} />
          </dl>
          {artifact.aiSummary && (
            <p className="mt-3 rounded-lg border border-stone-700/60 bg-stone-800/60 p-3 text-xs italic text-sand-300">
              {artifact.aiSummary}
            </p>
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold-400/90">Community Lore</h3>
          <ul className="flex-1 space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 240 }}>
            {lore.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-stone-700/50 bg-stone-800/50 p-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-sand-100">{entry.author}</span>
                  {entry.isOfficial && (
                    <span className="flex items-center gap-1 rounded bg-gold-600/20 px-1.5 py-0.5 text-[10px] font-semibold text-gold-300">
                      <Check size={10} /> Official
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-sand-300">{entry.body}</p>
                <button
                  onClick={() => {
                    sfx.click();
                    onVote(entry.id);
                  }}
                  className="mt-1 flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300"
                >
                  <ArrowUp size={12} /> {entry.votes}
                </button>
              </li>
            ))}
            {lore.length === 0 && <p className="text-sm text-sand-500">No lore submitted yet — be the first.</p>}
          </ul>

          <div className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share what you think this artifact means..."
              className="flex-1 rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-sand-100 placeholder:text-sand-500 focus:border-gold-500/60 focus:outline-none"
            />
            <Button
              variant="gold"
              size="sm"
              disabled={draft.trim().length < 3}
              onClick={() => {
                onSubmitLore(draft.trim());
                setDraft("");
              }}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[11px] uppercase tracking-wide text-sand-400">{label}</dt>
      <dd className="font-semibold capitalize text-sand-100">{value}</dd>
    </div>
  );
}
