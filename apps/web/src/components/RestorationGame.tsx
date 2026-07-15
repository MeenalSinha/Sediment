import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@sediment/ui";
import { sfx } from "@/lib/sound";

export interface RestorationGameProps {
  artifactName: string;
  onComplete: (qualityDelta: number) => void;
  onCancel: () => void;
}

const CANVAS_SIZE = { width: 480, height: 320 };

export function RestorationGame({ artifactName, onComplete, onCancel }: RestorationGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const gaugeNeedleRef = useRef<SVGGElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const overCleanedRef = useRef(0);

  const [percentCleaned, setPercentCleaned] = useState(0);
  const [precisionScore, setPrecisionScore] = useState(100);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#4a3826";
    ctx.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#5b4632" : "#3a2c1c";
      ctx.globalAlpha = Math.random() * 0.6 + 0.2;
      ctx.beginPath();
      ctx.arc(
        Math.random() * CANVAS_SIZE.width,
        Math.random() * CANVAS_SIZE.height,
        Math.random() * 3 + 1,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, []);

  function samplePercentCleaned(): number {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const sample = sampleCanvasRef.current ?? document.createElement("canvas");
    sampleCanvasRef.current = sample;
    const w = 48;
    const h = 32;
    sample.width = w;
    sample.height = h;
    const sctx = sample.getContext("2d");
    if (!sctx) return 0;
    sctx.drawImage(canvas, 0, 0, w, h);
    const data = sctx.getImageData(0, 0, w, h).data;
    let transparent = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 40) transparent++;
    }
    return (transparent / (w * h)) * 100;
  }

  function handlePointer(x: number, y: number, speed: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    const radius = speed > 900 ? 22 : 15;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    if (speed > 1400) {
      overCleanedRef.current += 1;
      setPrecisionScore((p) => Math.max(0, p - 0.6));
      if (overCleanedRef.current % 8 === 0) sfx.damage();
    } else {
      sfx.brush();
    }

    const pct = samplePercentCleaned();
    setPercentCleaned(pct);

    if (gaugeNeedleRef.current) {
      const quality = Math.min(100, pct) * 0.01 * precisionScore * 0.01 * 100;
      gsap.to(gaugeNeedleRef.current, {
        rotation: -90 + (quality / 100) * 180,
        transformOrigin: "50% 100%",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }

  function toLocalPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE.width,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE.height,
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    isDrawingRef.current = true;
    const p = toLocalPoint(e);
    lastPointRef.current = { ...p, t: performance.now() };
    handlePointer(p.x, p.y, 0);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const p = toLocalPoint(e);
    const now = performance.now();
    const last = lastPointRef.current;
    const dt = last ? Math.max(1, now - last.t) : 16;
    const dist = last ? Math.hypot(p.x - last.x, p.y - last.y) : 0;
    const speed = (dist / dt) * 1000;
    handlePointer(p.x, p.y, speed);
    lastPointRef.current = { ...p, t: now };
  }

  function onPointerUp() {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }

  function finish() {
    const qualityDelta = Math.round(percentCleaned * 0.01 * precisionScore * 0.01 * 30 - 5);
    setFinished(true);
    onComplete(qualityDelta);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-sand-400">
        Gently clean <span className="font-semibold text-sand-100">{artifactName}</span>. Slow, careful strokes restore
        it best — scrubbing too fast risks scratching the surface.
      </p>

      <div className="flex gap-4">
        <div className="overflow-hidden rounded-lg border border-stone-700/60" style={{ width: CANVAS_SIZE.width }}>
          <div className="relative bg-[#8a6a48]" style={{ width: CANVAS_SIZE.width, height: CANVAS_SIZE.height }}>
            <div className="absolute inset-4 rounded-full bg-teal-800" />
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE.width}
              height={CANVAS_SIZE.height}
              className="absolute inset-0 cursor-crosshair touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>
        </div>

        <div className="flex w-32 flex-col items-center gap-3">
          <svg viewBox="0 0 100 60" className="w-full">
            <path d="M10 55 A 40 40 0 0 1 90 55" fill="none" stroke="#3a4152" strokeWidth="8" strokeLinecap="round" />
            <g ref={gaugeNeedleRef} style={{ transform: "rotate(-90deg)", transformOrigin: "50px 55px" }}>
              <line x1="50" y1="55" x2="50" y2="18" stroke="#e6b94a" strokeWidth="3" strokeLinecap="round" />
            </g>
            <circle cx="50" cy="55" r="4" fill="#e6b94a" />
          </svg>
          <p className="text-center text-xs text-sand-400">
            Cleaned <span className="font-semibold text-sand-100">{Math.round(percentCleaned)}%</span>
            <br />
            Precision <span className="font-semibold text-sand-100">{Math.round(precisionScore)}%</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={finished}>
          Cancel
        </Button>
        <Button variant="gold" size="sm" onClick={finish} disabled={finished || percentCleaned < 15}>
          Finish Restoration
        </Button>
      </div>
    </div>
  );
}
