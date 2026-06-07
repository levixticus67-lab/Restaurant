import { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  pulse: number;
  pulseSpeed: number;
  layer: number;
}

const COLORS = [
  "59, 130, 246",
  "139, 92, 246",
  "236, 72, 153",
  "245, 158, 11",
  "16, 185, 129",
];

export default function AnimatedDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dots: Dot[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);

    for (let i = 0; i < 90; i++) {
      const layer = Math.random() < 0.33 ? 0 : Math.random() < 0.5 ? 1 : 2;
      dots.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        layer,
      });
    }

    const draw = () => {
      const { x: mx, y: my } = mouseRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((dot) => {
        const parallaxFactor = dot.layer === 0 ? 0.04 : dot.layer === 1 ? 0.02 : 0.008;
        const targetX = dot.x + (mx - canvas.width / 2) * parallaxFactor;
        const targetY = dot.y + (my - canvas.height / 2) * parallaxFactor;

        dot.x += dot.vx;
        dot.y += dot.vy;
        dot.pulse += dot.pulseSpeed;

        if (dot.x < 0) dot.x = canvas.width;
        if (dot.x > canvas.width) dot.x = 0;
        if (dot.y < 0) dot.y = canvas.height;
        if (dot.y > canvas.height) dot.y = 0;

        const pulsedOpacity = dot.opacity * (0.6 + 0.4 * Math.sin(dot.pulse));
        const pulsedRadius = dot.radius * (0.8 + 0.2 * Math.sin(dot.pulse));

        const grad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, pulsedRadius * 3);
        grad.addColorStop(0, `rgba(${dot.color}, ${pulsedOpacity})`);
        grad.addColorStop(1, `rgba(${dot.color}, 0)`);

        ctx.beginPath();
        ctx.arc(targetX, targetY, pulsedRadius * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(targetX, targetY, pulsedRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot.color}, ${Math.min(pulsedOpacity * 2, 1)})`;
        ctx.fill();
      });

      dots.forEach((a, i) => {
        const aX = a.x + (mouseRef.current.x - canvas.width / 2) * (a.layer === 0 ? 0.04 : a.layer === 1 ? 0.02 : 0.008);
        const aY = a.y + (mouseRef.current.y - canvas.height / 2) * (a.layer === 0 ? 0.04 : a.layer === 1 ? 0.02 : 0.008);
        dots.slice(i + 1, i + 12).forEach((b) => {
          const bX = b.x + (mouseRef.current.x - canvas.width / 2) * (b.layer === 0 ? 0.04 : b.layer === 1 ? 0.02 : 0.008);
          const bY = b.y + (mouseRef.current.y - canvas.height / 2) * (b.layer === 0 ? 0.04 : b.layer === 1 ? 0.02 : 0.008);
          const dx = aX - bX;
          const dy = aY - bY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(aX, aY);
            ctx.lineTo(bX, bY);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
