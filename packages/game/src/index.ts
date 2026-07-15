import Phaser from "phaser";
import type { ToolId } from "@sediment/shared";
import { DigSiteScene, type DigSiteSceneData } from "./scenes/DigSiteScene";

export interface CreateDigSiteGameOptions extends DigSiteSceneData {
  parent: HTMLElement;
  width?: number;
  height?: number;
}

export interface DigSiteGameHandle {
  game: Phaser.Game;
  setTool: (tool: ToolId) => void;
  destroy: () => void;
}

/**
 * Boots the Sediment dig-site mini-game (Phaser 3 + Matter physics) into the
 * given DOM container and returns a small handle the React layer can use to
 * change tools and tear the game down on unmount.
 */
export function createDigSiteGame(options: CreateDigSiteGameOptions): DigSiteGameHandle {
  const { parent, width = 900, height = 520, ...sceneData } = options;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    transparent: true,
    physics: {
      default: "matter",
      matter: {
        gravity: { x: 0, y: 0.6 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [DigSiteScene],
  };

  const game = new Phaser.Game(config);
  game.scene.start("DigSiteScene", sceneData);

  return {
    game,
    setTool: (tool: ToolId) => {
      const scene = game.scene.getScene("DigSiteScene") as DigSiteScene | undefined;
      scene?.setTool(tool);
    },
    destroy: () => {
      game.destroy(true);
    },
  };
}

export { DigSiteScene } from "./scenes/DigSiteScene";
export { getToolBehavior, TOOL_BEHAVIORS } from "./tools/ToolController";
export { DustGrid } from "./systems/DustGrid";
export { DebrisField } from "./systems/DebrisField";
