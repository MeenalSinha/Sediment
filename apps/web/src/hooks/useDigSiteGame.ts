import { useEffect, useRef } from "react";
import { createDigSiteGame, type DigSiteGameHandle } from "@sediment/game";
import type { ToolId } from "@sediment/shared";
import { useSedimentStore } from "@/lib/store";

export interface UseDigSiteGameOptions {
  artifactImageUrl: string;
  dirtImageUrl?: string;
  onArtifactRevealed?: () => void;
}

export function useDigSiteGame({ artifactImageUrl, dirtImageUrl, onArtifactRevealed }: UseDigSiteGameOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<DigSiteGameHandle | null>(null);
  const activeTool = useSedimentStore((s) => s.activeTool);
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
      onProgress: setProgressPercent,
      onToolDurabilityUsed: (_tool: ToolId, cost: number) => applyDurabilityCost(cost),
      onArtifactRevealed,
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
