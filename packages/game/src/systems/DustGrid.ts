/**
 * DustGrid tracks how much of the sediment overlay has been cleared using a
 * coarse coverage grid rather than reading back pixels from the GPU (which
 * would stall the render pipeline). Each cell holds a coverage value from
 * 1 (fully buried) down to 0 (fully clear). A stroke reduces the coverage of
 * every cell within its radius proportionally to overlap and tool strength.
 */
export class DustGrid {
  private cols: number;
  private rows: number;
  private cellWidth: number;
  private cellHeight: number;
  private coverage: Float32Array;

  constructor(
    private worldWidth: number,
    private worldHeight: number,
    resolution = 48,
  ) {
    this.cols = resolution;
    this.rows = Math.round(resolution * (worldHeight / worldWidth));
    this.cellWidth = worldWidth / this.cols;
    this.cellHeight = worldHeight / this.rows;
    this.coverage = new Float32Array(this.cols * this.rows).fill(1);
  }

  /** Clears sediment within a circular brush stroke, returns newly-cleared fraction. */
  applyStroke(x: number, y: number, radius: number, strength: number): number {
    const minCol = Math.max(0, Math.floor((x - radius) / this.cellWidth));
    const maxCol = Math.min(this.cols - 1, Math.ceil((x + radius) / this.cellWidth));
    const minRow = Math.max(0, Math.floor((y - radius) / this.cellHeight));
    const maxRow = Math.min(this.rows - 1, Math.ceil((y + radius) / this.cellHeight));

    let clearedDelta = 0;

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cx = col * this.cellWidth + this.cellWidth / 2;
        const cy = row * this.cellHeight + this.cellHeight / 2;
        const dist = Math.hypot(cx - x, cy - y);
        if (dist > radius) continue;

        const falloff = 1 - dist / radius;
        const idx = row * this.cols + col;
        const before = this.coverage[idx];
        const reduction = strength * falloff * 0.35;
        const after = Math.max(0, before - reduction);
        clearedDelta += before - after;
        this.coverage[idx] = after;
      }
    }

    return clearedDelta / (this.cols * this.rows);
  }

  /** Overall percentage cleared, 0-100. */
  getClearedPercent(): number {
    let total = 0;
    for (let i = 0; i < this.coverage.length; i++) total += 1 - this.coverage[i];
    return (total / this.coverage.length) * 100;
  }

  /** Average coverage remaining in a region, used to test if an artifact's footprint is exposed. */
  getRegionCoverage(x: number, y: number, w: number, h: number): number {
    const minCol = Math.max(0, Math.floor(x / this.cellWidth));
    const maxCol = Math.min(this.cols - 1, Math.ceil((x + w) / this.cellWidth));
    const minRow = Math.max(0, Math.floor(y / this.cellHeight));
    const maxRow = Math.min(this.rows - 1, Math.ceil((y + h) / this.cellHeight));

    let sum = 0;
    let count = 0;
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        sum += this.coverage[row * this.cols + col];
        count++;
      }
    }
    return count === 0 ? 1 : sum / count;
  }

  reset(): void {
    this.coverage.fill(1);
  }
}
