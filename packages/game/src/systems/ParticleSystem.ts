import Phaser from "phaser";

const DUST_TEXTURE_KEY = "__sediment_dust_particle";
const BRUSH_TEXTURE_KEY = "__sediment_brush_stencil";

/** Generates a soft radial-gradient circle used both as a particle sprite and as the erase-brush stencil. */
export function ensureParticleTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists(DUST_TEXTURE_KEY)) {
    const size = 24;
    const canvasTexture = scene.textures.createCanvas(DUST_TEXTURE_KEY, size, size);
    const ctx = canvasTexture!.getContext();
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(214,178,130,0.95)");
    gradient.addColorStop(0.6, "rgba(180,140,95,0.55)");
    gradient.addColorStop(1, "rgba(180,140,95,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    canvasTexture!.refresh();
  }

  if (!scene.textures.exists(BRUSH_TEXTURE_KEY)) {
    const size = 128;
    const canvasTexture = scene.textures.createCanvas(BRUSH_TEXTURE_KEY, size, size);
    const ctx = canvasTexture!.getContext();
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.7, "rgba(255,255,255,0.8)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    canvasTexture!.refresh();
  }
}

export function getBrushStencilKey(): string {
  return BRUSH_TEXTURE_KEY;
}

export function createDustEmitter(scene: Phaser.Scene): Phaser.GameObjects.Particles.ParticleEmitter {
  ensureParticleTextures(scene);
  return scene.add.particles(0, 0, DUST_TEXTURE_KEY, {
    lifespan: { min: 300, max: 700 },
    speed: { min: 20, max: 100 },
    scale: { start: 0.9, end: 0 },
    alpha: { start: 0.9, end: 0 },
    gravityY: 140,
    emitting: false,
    blendMode: Phaser.BlendModes.NORMAL,
  });
}
