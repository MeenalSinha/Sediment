import Phaser from "phaser";

export interface DebrisPiece {
  body: MatterJS.BodyType;
  gameObject: Phaser.GameObjects.Arc;
}

/**
 * Scatters small pebble/rock-fragment bodies across the dig canvas using
 * Matter physics so that brush and pickaxe strokes visibly, satisfyingly
 * knock debris out of the way instead of just erasing a texture.
 */
export class DebrisField {
  private pieces: DebrisPiece[] = [];

  constructor(
    private scene: Phaser.Scene,
    private worldWidth: number,
    private worldHeight: number,
    count = 60,
  ) {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(20, worldWidth - 20);
      const y = Phaser.Math.Between(20, worldHeight - 20);
      const radius = Phaser.Math.FloatBetween(2, 6);
      const tone = Phaser.Math.Between(0, 2);
      const colors = [0xa9825c, 0x8a6a48, 0xc9a878];

      const circle = scene.add.circle(x, y, radius, colors[tone]);
      circle.setDepth(5);

      const body = scene.matter.add.gameObject(circle, {
        shape: { type: "circle", radius },
        frictionAir: 0.06,
        restitution: 0.15,
        density: 0.002,
      }).body as MatterJS.BodyType;

      this.pieces.push({ body, gameObject: circle as unknown as Phaser.GameObjects.Arc });
    }
  }

  /** Nudges nearby debris away from the tool position, as if disturbed by brushing/digging. */
  disturb(x: number, y: number, radius: number, force: number): void {
    for (const piece of this.pieces) {
      const dx = piece.body.position.x - x;
      const dy = piece.body.position.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist > radius || dist === 0) continue;

      const falloff = 1 - dist / radius;
      const angle = Math.atan2(dy, dx);
      this.scene.matter.body.applyForce(piece.body, piece.body.position, {
        x: Math.cos(angle) * force * falloff,
        y: Math.sin(angle) * force * falloff - force * falloff * 0.4,
      });
    }
  }

  destroy(): void {
    for (const piece of this.pieces) {
      piece.gameObject.destroy();
    }
    this.pieces = [];
  }
}
