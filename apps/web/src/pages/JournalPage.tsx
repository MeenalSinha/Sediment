import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Panel, Button } from "@sediment/ui";
import { useSedimentStore } from "@/lib/store";
import { bridge } from "@/lib/devvit-bridge";

export function JournalPage() {
  const journal = useSedimentStore((s) => s.journal);
  const addJournalEntry = useSedimentStore((s) => s.addJournalEntry);
  const reducedMotion = useSedimentStore((s) => s.settings.reducedMotion);
  const [draft, setDraft] = useState("");

  // Load journal entries from Devvit Redis on mount
  useEffect(() => {
    bridge.send({ type: "get_journal" });
    const off = bridge.on("journal_list", (msg) => {
      // Sync Redis entries into local store (entries from other sessions)
      for (const entry of msg.entries) {
        addJournalEntry(entry.body);
      }
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSave() {
    const body = draft.trim();
    if (!body) return;
    addJournalEntry(body);
    bridge.send({ type: "add_journal_entry", body }); // persist to Redis
    setDraft("");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <Panel eyebrow="Your Journal" title="Daily Excavation Log">
        <p className="mb-3 text-sm text-sand-400">
          A private record of what you personally uncovered, restored, and theorized about — separate from the public
          museum and live feed.
        </p>
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a private note about today's dig..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-sand-100 placeholder:text-sand-500 focus:border-gold-500/60 focus:outline-none"
          />
          <Button
            variant="gold"
            size="sm"
            disabled={!draft.trim()}
            onClick={handleSave}
          >
            Save Entry
          </Button>
        </div>
      </Panel>

      <Panel eyebrow="Entries" className="flex-1">
        {journal.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-sand-500">
            <BookOpen size={28} />
            <p className="text-sm">Your journal is empty. Write your first entry above.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {journal.map((entry, i) => (
              <motion.li
                key={entry.id}
                initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: reducedMotion ? 0 : i * 0.02 }}
                className="rounded-lg border border-stone-700/50 bg-stone-800/50 p-3"
              >
                <p className="mb-1 text-[11px] text-sand-500">{new Date(entry.createdAt).toLocaleString()}</p>
                <p className="text-sm text-sand-200">{entry.body}</p>
              </motion.li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

