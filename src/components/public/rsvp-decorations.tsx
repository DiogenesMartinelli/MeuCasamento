import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type {
  RsvpAnimatedBackground,
  RsvpConfirmAnimation,
  RsvpLightingEffect,
} from "@/generated/prisma/client";

/**
 * Deterministic pseudo-scatter for decorative particles: same output on server and
 * client every render (no Math.random, which would cause a hydration mismatch), but
 * spread out enough that a row of identical elements doesn't look mechanically even.
 */
function scatter(index: number, count: number, seedA: number, seedB: number) {
  return {
    left: ((index * seedA + 13) % 97) / 97,
    delay: ((index * seedB + count) % 53) / 53,
  };
}

/** A wire dipping in gentle swags between anchor points - deterministic (pure fn of i). */
function bulbY(i: number) {
  return 18 + Math.sin(i * 0.9) * 10;
}

export function StringLights({ count = 26 }: { count?: number }) {
  const points = Array.from({ length: count }, (_, i) => ({
    x: (i / (count - 1)) * 100,
    y: bulbY(i),
  }));
  const wirePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-12 overflow-visible" aria-hidden>
      <svg viewBox="0 0 100 48" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path
          d={wirePath}
          fill="none"
          stroke="rgba(87, 62, 24, 0.55)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {points.map((p, i) => (
        <span
          key={i}
          className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200 shadow-[0_0_8px_3px_rgba(252,211,77,0.75)] animate-rsvp-bulb"
          style={{ left: `${p.x}%`, top: `${p.y}px`, animationDelay: `${(i % 6) * 0.28}s` }}
        />
      ))}
    </div>
  );
}

export function Sparkles({ count = 18 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const { left, delay } = scatter(i, count, 17, 11);
        const top = ((i * 23 + 7) % 89) / 89;
        return (
          <span
            key={i}
            className="absolute size-1 rounded-full bg-white animate-rsvp-sparkle"
            style={{
              left: `${left * 100}%`,
              top: `${top * 100}%`,
              animationDelay: `${delay * 4}s`,
            }}
          />
        );
      })}
    </div>
  );
}

const PETAL_COLORS = ["bg-rose-300", "bg-pink-200", "bg-rose-200"];
const SNOW_SIZES = ["size-1.5", "size-1", "size-2"];
const FIREFLY_COLOR = "bg-lime-200";

/**
 * Pure particle overlay - no backdrop of its own. The backdrop (the couple's chosen
 * color, or a per-preset fallback gradient when they haven't set one) is applied by
 * the caller, so this renders consistently over whatever background is actually
 * showing instead of fighting it.
 */
export function AnimatedBackground({ preset }: { preset: RsvpAnimatedBackground }) {
  const count = preset === "STARS" ? 40 : 22;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const { left, delay } = scatter(i, count, 19, 13);
        const duration = 6 + (((i * 7 + 3) % 11) / 11) * 8;

        if (preset === "PETALS") {
          return (
            <span
              key={i}
              className={cn(
                "absolute -top-6 size-2.5 rounded-[60%_0] animate-rsvp-fall",
                PETAL_COLORS[i % PETAL_COLORS.length],
              )}
              style={{ left: `${left * 100}%`, animationDelay: `${delay * duration}s`, animationDuration: `${duration}s` }}
            />
          );
        }
        if (preset === "SNOW") {
          return (
            <span
              key={i}
              className={cn(
                "absolute -top-4 rounded-full bg-white/80 animate-rsvp-fall-straight",
                SNOW_SIZES[i % SNOW_SIZES.length],
              )}
              style={{ left: `${left * 100}%`, animationDelay: `${delay * duration}s`, animationDuration: `${duration}s` }}
            />
          );
        }
        if (preset === "FIREFLIES") {
          return (
            <span
              key={i}
              className={cn(
                "absolute size-1.5 rounded-full shadow-[0_0_8px_3px_rgba(190,242,100,0.6)] animate-rsvp-drift",
                FIREFLY_COLOR,
              )}
              style={{
                left: `${left * 100}%`,
                top: `${((i * 29 + 5) % 83) / 83 * 100}%`,
                animationDelay: `${delay * 6}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        }
        // STARS
        return (
          <span
            key={i}
            className="absolute size-[3px] rounded-full bg-white animate-rsvp-sparkle"
            style={{
              left: `${left * 100}%`,
              top: `${((i * 31 + 9) % 91) / 91 * 100}%`,
              animationDelay: `${delay * 4}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export function LightingOverlay({ effect }: { effect: RsvpLightingEffect }) {
  if (effect === "NONE") return null;

  if (effect === "GLOW") {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.35),transparent_60%)] animate-rsvp-glow"
        aria-hidden
      />
    );
  }
  if (effect === "SPOTLIGHT") {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_260px_420px_at_50%_-10%,rgba(255,255,255,0.45),transparent_65%)] animate-rsvp-spotlight"
        aria-hidden
      />
    );
  }
  // CANDLELIGHT
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_60%,rgba(251,191,36,0.4),transparent_55%)] animate-rsvp-flicker"
      aria-hidden
    />
  );
}

const CONFETTI_COLORS = ["bg-rose-400", "bg-amber-300", "bg-sky-400", "bg-emerald-400", "bg-violet-400"];

export function ConfirmBurst({ variant, active }: { variant: RsvpConfirmAnimation; active: boolean }) {
  if (!active || variant === "NONE") return null;

  const count = 16;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const distance = 90 + ((i * 17) % 40);
        const delay = (i % 4) * 0.05;
        const style = {
          "--rsvp-burst-angle": `${angle}deg`,
          "--rsvp-burst-distance": `${distance}px`,
          animationDelay: `${delay}s`,
          left: "50%",
          top: "40%",
        } as CSSProperties;

        if (variant === "CONFETTI") {
          return (
            <span
              key={i}
              className={cn(
                "absolute size-2 animate-rsvp-burst",
                CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              )}
              style={style}
            />
          );
        }
        if (variant === "HEARTS") {
          return (
            <span key={i} className="absolute text-lg text-rose-500 animate-rsvp-burst" style={style}>
              ♥
            </span>
          );
        }
        // FIREWORKS
        return (
          <span
            key={i}
            className="absolute size-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_2px_rgba(252,211,77,0.8)] animate-rsvp-burst"
            style={style}
          />
        );
      })}
    </div>
  );
}
