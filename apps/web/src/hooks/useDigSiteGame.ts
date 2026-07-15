import { useEffect, useRef } from "react";
import { createDigSiteGame, type DigSiteGameHandle } from "@sediment/game";
import type { ToolId } from "@sediment/shared";
import { useSedimentStore } from "@/lib/store";
import { bridge } from "@/lib/devvit-bridge";

export interface UseDigSiteGameOptions {
  artifactImageUrl: string;
  dirtImageUrl?: string;
  onArtifactRevealed?: () => void;
}

export function useDigSiteGame({ artifactImageUrl, dirtImageUrl, onArtifactRevealed }: UseDigSiteGameOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<DigSiteGameHandle | null>(null);
  const activeTool = useSedimentStore((s) => s.activeTool);
  const activeLayer = useSedimentStore((s) => s.activeLayer);
  const setProgressPercent = useSedimentStore((s) => s.setProgressPercent);
  const applyDurabilityCost = useSedimentStore((s) => s.applyDurabilityCost);

  useEffect(() => {
    if (!containerRef.current) return;

    handleRef.current = createDigSiteGame({
      parent: containerRef.current,
      width: containerRef.current.clientWidth || 900,
      height: containerRef.current.clientHeight || 520,
      artifactImageUrl,
      dirtImageUrl,
      initialTool: activeTool,
      onProgress: (percent) => {
        setProgressPercent(percent);

        // Send dig stroke to Devvit backend (throttled: only every ~2% increment)
        if (activeLayer && percent % 2 < 0.5) {
          bridge.send({
            type: "dig_stroke",
            layerId: activeLayer.id,
            toolId: activeTool as ToolId,
            clearedDelta: 0.02, // 2% per batch
          });
        }
      },
      onToolDurabilityUsed: (_tool: ToolId, cost: number) => applyDurabilityCost(cost),
      onArtifactRevealed: () => {
        // Notify backend that a full reveal happened
        if (activeLayer) {
          bridge.send({
            type: "dig_stroke",
            layerId: activeLayer.id,
            toolId: activeTool as ToolId,
            clearedDelta: 1, // full clear
          });
        }
        onArtifactRevealed?.();
      },
    });

    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifactImageUrl, dirtImageUrl]);

  useEffect(() => {
    handleRef.current?.setTool(activeTool);
  }, [activeTool]);

  return containerRef;
}
