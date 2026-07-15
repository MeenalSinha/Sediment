import { Modal } from "@/components/Modal";
import { useSedimentStore } from "@/lib/store";

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-stone-700/50 bg-stone-800/50 p-3">
      <div>
        <p className="text-sm font-semibold text-sand-100">{label}</p>
        <p className="text-xs text-sand-400">{description}</p>
      </div>
      <span
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-teal-600" : "bg-stone-700"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-sand-50 transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </span>
    </label>
  );
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const settings = useSedimentStore((s) => s.settings);
  const updateSettings = useSedimentStore((s) => s.updateSettings);

  return (
    <Modal open={open} onClose={onClose} title="Accessibility & Settings" width="sm">
      <div className="flex flex-col gap-2.5">
        <Toggle
          label="Colorblind Mode"
          description="Adjusts palette contrast for common color-vision differences."
          checked={settings.colorblindMode}
          onChange={(v) => updateSettings({ colorblindMode: v })}
        />
        <Toggle
          label="Reduced Motion"
          description="Removes non-essential animation and transitions."
          checked={settings.reducedMotion}
          onChange={(v) => updateSettings({ reducedMotion: v })}
        />
        <Toggle
          label="Sound Effects"
          description="Brush, restoration, and discovery sound effects."
          checked={settings.soundEnabled}
          onChange={(v) => updateSettings({ soundEnabled: v })}
        />
        <Toggle
          label="Subtitles for Audio Cues"
          description="Shows a text caption whenever a sound effect plays."
          checked={settings.subtitles}
          onChange={(v) => updateSettings({ subtitles: v })}
        />
        <p className="mt-1 text-[11px] text-sand-500">
          Keyboard: press 1–5 anywhere on the dig site to switch tools without a mouse. Full screen-reader labeling is
          applied to every interactive control.
        </p>
      </div>
    </Modal>
  );
}
