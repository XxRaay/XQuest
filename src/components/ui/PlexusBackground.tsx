import React, { useEffect, useRef } from 'react';

export type PlexusTheme = 'cyan' | 'blue' | 'monochrome';

interface PlexusBackgroundProps {
  theme?: PlexusTheme;
  className?: string;
}

const THEME_PALETTES = {
  cyan: {
    particle: 'rgba(56, 189, 248, 0.85)', // Sky-400
    line: 'rgba(56, 189, 248, 0.22)',
    glow: 'rgba(14, 165, 233, 0.45)',
  },
  blue: {
    particle: 'rgba(88, 101, 242, 0.85)', // Discord Blurple
    line: 'rgba(88, 101, 242, 0.22)',
    glow: 'rgba(88, 101, 242, 0.45)',
  },
  monochrome: {
    particle: 'rgba(244, 244, 245, 0.8)',
    line: 'rgba(255, 255, 255, 0.18)',
    glow: 'rgba(255, 255, 255, 0.35)',
  },
};

export const PlexusBackground: React.FC<PlexusBackgroundProps> = ({
  theme = 'cyan',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette = THEME_PALETTES[theme] || THEME_PALETTES.cyan;
    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const mouse = { x: -9999, y: -9999, targetX: -9999, targetY: -9999, isHovered: false };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
      mouse.isHovered = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const area = width * height;
    const computedCount = Math.min(130, Math.max(50, Math.floor(area / 12000)));

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      isAnchor: boolean;
    }

    const particles: Particle[] = Array.from({ length: computedCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.3 + 1.1,
      isAnchor: Math.random() > 0.85,
    }));

    const connectionDistance = 140;
    const mouseDistance = 160;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (mouse.isHovered) {
        mouse.x += (mouse.targetX - mouse.x) * 0.15;
        mouse.y += (mouse.targetY - mouse.y) * 0.15;
      } else {
        mouse.x = -9999;
        mouse.y = -9999;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        else if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        else if (p.y > height) { p.y = height; p.vy *= -1; }

        if (mouse.isHovered) {
          const dxMouse = mouse.x - p.x;
          const dyMouse = mouse.y - p.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

          if (distMouse < mouseDistance) {
            const force = (1 - distMouse / mouseDistance);
            p.x += (dxMouse / distMouse) * force * 0.7;
            p.y += (dyMouse / distMouse) * force * 0.7;

            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = palette.line.replace(/[\d\.]+\)$/, `${(force * 0.4).toFixed(3)})`);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        const r = p.isAnchor ? p.radius * 1.5 : p.radius;
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);

        if (p.isAnchor) {
          ctx.shadowColor = palette.glow;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = palette.particle;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const factor = 1 - dist / connectionDistance;
            const alpha = factor * 0.32;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = palette.line.replace(/[\d\.]+\)$/, `${alpha.toFixed(3)})`);
            ctx.lineWidth = factor * 0.8 + 0.3;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [theme]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden -z-10 ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_80%_at_50%_35%,transparent_45%,rgba(6,7,10,0.6)_100%)] pointer-events-none" />
    </div>
  );
};
