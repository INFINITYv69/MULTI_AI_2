import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
};

type AnimatedBackgroundProps = {
  className?: string;
  particleCount?: number;
};

const DEFAULT_PARTICLE_COUNT = 90;

export default function AnimatedBackground({ className, particleCount = DEFAULT_PARTICLE_COUNT }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const mouse = { x: width / 2, y: height / 2 };

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 2 + Math.random() * 3,
      alpha: 0.25 + Math.random() * 0.4,
    }));

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        const dx = (mouse.x - particle.x) * 0.00012;
        const dy = (mouse.y - particle.y) * 0.00012;
        particle.x += particle.vx + dx;
        particle.y += particle.vy + dy;

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(216, 180, 254, ${particle.alpha})`;
        ctx.fill();

        if (Math.random() < 0.01) {
          ctx.strokeStyle = `rgba(196, 181, 253, ${particle.alpha * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo((particle.x + Math.random() * 30) % width, (particle.y + Math.random() * 30) % height);
          ctx.stroke();
        }

      });

      frameRef.current = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [particleCount]);

  const classes = className
    ? `fixed inset-0 pointer-events-none opacity-90 ${className}`
    : "fixed inset-0 -z-20 pointer-events-none opacity-90";

  return <canvas ref={canvasRef} className={classes} />;
}
