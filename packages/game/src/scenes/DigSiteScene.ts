import Phaser from "phaser";
import type { ToolId } from "@sediment/shared";
import { getToolBehavior } from "../tools/ToolController";
import { DustGrid } from "../systems/DustGrid";
import { createDustEmitter, ensureParticleTextures, getBrushStencilKey } from "../systems/ParticleSystem";
import { DebrisField } from "../systems/DebrisField";

export interface DigSiteSceneData {
  artifactImageUrl: string;
  dirtImageUrl?: string;
  initialTool: ToolId;
  onProgress?: (percent: number) => void;
  onToolDurabilityUsed?: (toolId: ToolId, cost: number) => void;
  onDamage?: (amount: number) => void;
  onArtifactRevealed?: () => void;
  revealThreshold?: number;
}

const ARTIFACT_KEY = "dig_artifact";
const DIRT_KEY = "dig_dirt";

export class DigSiteScene extends Phaser.Scene {
  private data_!: DigSiteSceneData;
  private currentTool: ToolId = "brush";
  private dustGrid!: DustGrid;
  private overlay!: Phaser.GameObjects.RenderTexture;
  private debris!: DebrisField;
  private dustEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  private isPointerDown = false;
  private revealed = false;
  private condition = 100;

  constructor() {
    super("DigSiteScene");
  }

  init(data: DigSiteSceneData) {
    this.data_ = { revealThreshold: 82, ...data };
    this.currentTool = data.initialTool ?? "brush";
    this.revealed = false;
    this.condition = 100;
  }

  preload() {
    this.load.image(ARTIFACT_KEY, this.data_.artifactImageUrl);
    if (this.data_.dirtImageUrl) {
      this.load.image(DIRT_KEY, this.data_.dirtImageUrl);
    }
  }

  create() {
    const { width, height } = this.scale;
    ensureParticleTextures(this);

    // Artifact sits beneath the sediment overlay.
    const artifact = this.add.image(width / 2, height / 2, ARTIFACT_KEY);
    artifact.setDepth(1);
    const scale = Math.min((width * 0.75) / artifact.width, (height * 0.75) / artifact.height);
    artifact.setScale(scale);

    // Procedural dirt overlay if no dirt texture was supplied.
    if (!this.textures.exists(DIRT_KEY)) {
      this.generateProceduralDirtTexture(width, height);
    }

    this.overlay = this.add.renderTexture(0, 0, width, height).setOrigin(0, 0).setDepth(10);
    this.overlay.draw(DIRT_KEY, 0, 0);

    this.dustGrid = new DustGrid(width, height, 56);
    this.debris = new DebrisField(this, width, height, 70);
    this.dustEmitter = createDustEmitter(this);
    this.dustEmitter.setDepth(20);

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.isPointerDown = true;
      this.applyToolAt(p.x, p.y);
    });
    this.input.on("pointerup", () => (this.isPointerDown = false));
    this.input.on("pointerupoutside", () => (this.isPointerDown = false));
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (this.isPointerDown) this.applyToolAt(p.x, p.y);
    });
  }

  setTool(tool: ToolId) {
    this.currentTool = tool;
  }

  private applyToolAt(x: number, y: number) {
    if (this.revealed) return;
    const behavior = getToolBehavior(this.currentTool);

    // Erase the sediment overlay using a soft circular stencil, revealing the artifact beneath.
    const stencilKey = getBrushStencilKey();
    this.overlay.erase(stencilKey, x - 64 + (64 - behavior.brushRadius), y - 64 + (64 - behavior.brushRadius));

    // Track logical progress independent of the erase (used for community % and gating reveal).
    const delta = this.dustGrid.applyStroke(x, y, behavior.brushRadius, behavior.eraseStrength);

    // Dust particles kick up where the tool touches.
    this.dustEmitter.emitParticleAt(x, y, behavior.particleCount);

    // Physically disturb nearby pebble/rock debris.
    this.debris.disturb(x, y, behavior.brushRadius * 1.4, behavior.debrisForce);

    // Risk of damaging the artifact with aggressive tools.
    if (behavior.damageRisk > 0 && Math.random() < behavior.damageRisk) {
      this.condition = Math.max(0, this.condition - Phaser.Math.Between(2, 6));
      this.data_.onDamage?.(this.condition);
      this.cameras.main.shake(120, 0.002);
    }

    if (delta > 0) {
      this.data_.onToolDurabilityUsed?.(this.currentTool, 0.01 + delta * 2);
    }

    const percent = this.dustGrid.getClearedPercent();
    this.data_.onProgress?.(percent);

    if (!this.revealed && percent >= (this.data_.revealThreshold ?? 82)) {
      this.revealed = true;
      this.data_.onArtifactRevealed?.();
      this.tweens.add({
        targets: this.overlay,
        alpha: 0,
        duration: 900,
        ease: "Sine.easeOut",
      });
    }
  }

  private generateProceduralDirtTexture(width: number, height: number) {
    const g = this.add.graphics();
    g.fillStyle(0x5b4632, 1);
    g.fillRect(0, 0, width, height);

    const tones = [0x6b543a, 0x4a3826, 0x7a6247, 0x54402c];
    for (let i = 0; i < 900; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const r = Phaser.Math.FloatBetween(1, 4);
      g.fillStyle(Phaser.Utils.Array.GetRandom(tones), Phaser.Math.FloatBetween(0.3, 0.8));
      g.fillCircle(x, y, r);
    }

    g.generateTexture(DIRT_KEY, width, height);
    g.destroy();
  }
}
