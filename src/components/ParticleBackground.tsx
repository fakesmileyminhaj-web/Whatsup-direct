import React, { useEffect, useRef } from 'react';
import { ParticleSpeedSetting } from '../types';

interface ParticleBackgroundProps {
  enabled: boolean;
  speed: ParticleSpeedSetting;
  customDuration?: number;
  darkBgColor: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  isNode: boolean;
  pulsePhase: number;
  pulseSpeed: number;
  highlight: number; // 0 to 1 for touch glow
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  enabled,
  speed,
  customDuration,
  darkBgColor,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute duration in seconds
  let effectiveDuration = 6;
  if (speed === '3s') {
    effectiveDuration = 3;
  } else if (speed === '6s') {
    effectiveDuration = 6;
  } else if (speed === 'custom') {
    if (typeof customDuration === 'number' && !isNaN(customDuration)) {
      effectiveDuration = Math.min(15, Math.max(0.5, customDuration));
    } else {
      effectiveDuration = 6;
    }
  }

  // Ref to hold current speed multiplier without restarting animation loop
  // At 6s -> multiplier is 1.0 (calm, organic constellation drift)
  // At 3s -> multiplier is 2.0 (faster, energetic)
  // At 0.5s -> multiplier is 12.0
  // At 15s -> multiplier is 0.4
  const speedFactorRef = useRef<number>(6 / effectiveDuration);
  useEffect(() => {
    speedFactorRef.current = 6 / effectiveDuration;
  }, [effectiveDuration]);

  // Pointer state for non-blocking touch interaction
  const pointerRef = useRef<{
    x: number;
    y: number;
    isActive: boolean;
    radius: number;
    deactivateTimer: number | null;
  }>({
    x: -1000,
    y: -1000,
    isActive: false,
    radius: 140, // Touch influence radius in px
    deactivateTimer: null,
  });

  useEffect(() => {
    // If disabled, do not mount canvas or start animation
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number | null = null;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let isVisible = !document.hidden;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Initialize or re-initialize particles based on viewport dimensions
    const initParticles = (w: number, h: number) => {
      width = w;
      height = h;
      if (width <= 0 || height <= 0) return;

      // Rich, clearly visible constellation density: between 55 and 105 particles
      const count = Math.max(55, Math.min(105, Math.floor((width * height) / 5200)));
      particles = [];

      for (let i = 0; i < count; i++) {
        // ~20% are primary nodes (larger, brighter, luminous glow)
        const isNode = i % 5 === 0;
        const baseRadius = isNode ? 2.8 + Math.random() * 0.8 : 1.8 + Math.random() * 0.7;
        const baseAlpha = isNode ? 0.85 + Math.random() * 0.12 : 0.65 + Math.random() * 0.2;

        // Base velocity: gentle organic drift (-0.35 to 0.35 px/frame at speed factor 1.0)
        const angle = Math.random() * Math.PI * 2;
        const spd = 0.2 + Math.random() * 0.25;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          baseRadius,
          radius: baseRadius,
          baseAlpha,
          alpha: baseAlpha,
          isNode,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.9 + Math.random() * 1.2,
          highlight: 0,
        });
      }
    };

    // Resize handler with viewport detection and High-DPI support
    const resizeCanvas = () => {
      if (!canvas) return;

      const w = window.innerWidth || document.documentElement.clientWidth || 360;
      const h = window.innerHeight || document.documentElement.clientHeight || 640;

      if (w <= 0 || h <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Re-init particles if dimensions changed significantly
      if (Math.abs(width - w) > 25 || Math.abs(height - h) > 25 || particles.length === 0) {
        initParticles(w, h);
      } else {
        width = w;
        height = h;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Observational touch/pointer listeners (using passive: true so UI is never blocked)
    const updatePointer = (clientX: number, clientY: number) => {
      pointerRef.current.x = clientX;
      pointerRef.current.y = clientY;
      pointerRef.current.isActive = true;

      // Reset auto-deactivate timer
      if (pointerRef.current.deactivateTimer) {
        clearTimeout(pointerRef.current.deactivateTimer);
      }
      pointerRef.current.deactivateTimer = window.setTimeout(() => {
        pointerRef.current.isActive = false;
      }, 1500);
    };

    const handlePointerDown = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      // If active touch or pointer movement
      if (pointerRef.current.isActive || e.buttons > 0 || e.pointerType === 'touch') {
        updatePointer(e.clientX, e.clientY);
      }
    };

    const handlePointerUp = () => {
      if (pointerRef.current.deactivateTimer) {
        clearTimeout(pointerRef.current.deactivateTimer);
      }
      pointerRef.current.deactivateTimer = window.setTimeout(() => {
        pointerRef.current.isActive = false;
      }, 400);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });

    // Pausing on visibility change for Android WebView battery & CPU efficiency
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !animId && !prefersReducedMotion) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Main animation loop
    let lastTime = performance.now();
    const connectMaxDist = 120; // Max distance for particle constellation network lines
    const connectMaxDistSq = connectMaxDist * connectMaxDist;

    const render = (now: number) => {
      if (!isVisible) {
        animId = null;
        return;
      }

      // Delta time normalized to ~60fps (16.67ms = 1.0)
      const elapsed = Math.min(now - lastTime, 64);
      lastTime = now;
      const dt = elapsed / 16.67;
      const currentSpeed = speedFactorRef.current;

      ctx.clearRect(0, 0, width, height);

      const pointer = pointerRef.current;
      const pointerRadius = pointer.radius;
      const pointerRadiusSq = pointerRadius * pointerRadius;

      const pCount = particles.length;

      // 1. Update particle positions and touch reactions
      for (let i = 0; i < pCount; i++) {
        const p = particles[i];

        // Organic subtle pulse
        p.pulsePhase += 0.025 * p.pulseSpeed * currentSpeed * dt;
        const pulse = Math.sin(p.pulsePhase) * 0.12;

        // Pointer reaction: gentle displacement if active
        if (pointer.isActive) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < pointerRadiusSq && distSq > 0) {
            const dist = Math.sqrt(distSq);
            // Gentle ease-out repulsion force
            const force = (1 - dist / pointerRadius) * 1.4;
            p.x += (dx / dist) * force * dt;
            p.y += (dy / dist) * force * dt;
            // Increase highlight
            p.highlight = Math.min(1, p.highlight + 0.18 * dt);
          } else {
            p.highlight = Math.max(0, p.highlight - 0.04 * dt);
          }
        } else {
          p.highlight = Math.max(0, p.highlight - 0.05 * dt);
        }

        // Natural organic drift
        p.x += p.vx * currentSpeed * dt;
        p.y += p.vy * currentSpeed * dt;

        // Soft screen border bounce with margin
        const pad = 8;
        if (p.x < pad) {
          p.x = pad;
          p.vx = Math.abs(p.vx);
        } else if (p.x > width - pad) {
          p.x = width - pad;
          p.vx = -Math.abs(p.vx);
        }

        if (p.y < pad) {
          p.y = pad;
          p.vy = Math.abs(p.vy);
        } else if (p.y > height - pad) {
          p.y = height - pad;
          p.vy = -Math.abs(p.vy);
        }

        // Effective alpha & radius
        p.alpha = Math.min(1, Math.max(0.2, p.baseAlpha + pulse + p.highlight * 0.25));
        p.radius = p.baseRadius + (p.isNode ? pulse * 0.4 : 0) + p.highlight * 0.6;
      }

      // 2. Draw connecting network lines
      for (let i = 0; i < pCount; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < pCount; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectMaxDistSq) {
            const dist = Math.sqrt(distSq);
            // Base ratio 1.0 (touching) to 0.0 (max distance)
            const ratio = 1 - dist / connectMaxDist;
            let lineAlpha = ratio * 0.38;

            // Touch enhancement: if line is near the active pointer, brighten line
            if (pointer.isActive) {
              const midX = (p1.x + p2.x) * 0.5;
              const midY = (p1.y + p2.y) * 0.5;
              const pdx = midX - pointer.x;
              const pdy = midY - pointer.y;
              const pDistSq = pdx * pdx + pdy * pdy;

              if (pDistSq < pointerRadiusSq) {
                const pDist = Math.sqrt(pDistSq);
                const boost = (1 - pDist / pointerRadius) * 0.42;
                lineAlpha = Math.min(0.80, lineAlpha + boost);
              }
            }

            if (lineAlpha > 0.04) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha.toFixed(3)})`;
              ctx.lineWidth = 1.0;
              ctx.stroke();
            }
          }
        }
      }

      // 3. Draw particles
      for (let i = 0; i < pCount; i++) {
        const p = particles[i];

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.isNode || p.highlight > 0.25) {
          // Luminous white glow for primary nodes and touch highlights
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha.toFixed(3)})`;
        ctx.fill();
      }

      // Reset shadow blur
      ctx.shadowBlur = 0;

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    // Start loop or render single frame if reduced motion
    if (prefersReducedMotion) {
      render(performance.now());
    } else {
      animId = requestAnimationFrame(render);
    }

    // Cleanup function
    return () => {
      if (animId) {
        cancelAnimationFrame(animId);
      }
      if (pointerRef.current.deactivateTimer) {
        clearTimeout(pointerRef.current.deactivateTimer);
      }
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled]);

  return (
    <div
      ref={containerRef}
      id="particle-background-container"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: darkBgColor }}
      aria-hidden="true"
    >
      {enabled && (
        <canvas
          ref={canvasRef}
          id="particle-network-canvas"
          className="fixed inset-0 w-full h-full pointer-events-none z-0"
        />
      )}
    </div>
  );
};
