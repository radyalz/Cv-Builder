const RAMP = " .:-=+*#%@";
const COUNT = 72;
const EDGE = 8;
const INNER = 48;

export interface Palette {
  accent: string;
  muted: string;
}

function glyph(ctx: CanvasRenderingContext2D, char: string, angle: number, radius: number, cx: number, cy: number): void {
  ctx.save();
  ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
  ctx.rotate(angle + Math.PI / 2);
  ctx.fillText(char, 0, 0);
  ctx.restore();
}

export function drawRing(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, progress: number, now: number, colors: Palette): void {
  const filled = progress * COUNT;
  const size = Math.round(radius * 0.15);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

  for (let i = 0; i < COUNT; i++) {
    const angle = -Math.PI / 2 + (i / COUNT) * Math.PI * 2;
    const ahead = i - filled;

    if (ahead < -0.5) {
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 1;
      glyph(ctx, i % 3 === 0 ? "#" : "@", angle, radius, cx, cy);
    } else if (ahead < EDGE) {
      const flicker = Math.floor((now / 70 + i * 7) % 3);
      const level = Math.max(1, RAMP.length - 2 - Math.floor(ahead) - flicker);

      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.85 - ahead * 0.08;
      glyph(ctx, RAMP[level], angle, radius, cx, cy);
    } else {
      ctx.fillStyle = colors.muted;
      ctx.globalAlpha = 0.35;
      glyph(ctx, "·", angle, radius, cx, cy);
    }
  }

  ctx.font = `600 ${Math.round(size * 0.8)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.fillStyle = colors.muted;

  for (let i = 0; i < INNER; i++) {
    const angle = -Math.PI / 2 + (i / INNER) * Math.PI * 2 - now / 9000;

    ctx.globalAlpha = 0.18 + 0.12 * Math.sin(now / 400 + i);
    glyph(ctx, RAMP[1 + ((i + Math.floor(now / 240)) % 3)], angle, radius * 0.86, cx, cy);
  }

  ctx.globalAlpha = 1;
}
