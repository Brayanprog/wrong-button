/**
 * art.ts — the hand-printed look of Wrong Button.
 *
 * Every visual in the game is drawn with canvas primitives: wobbly ink lines,
 * mis-registered colour plates, cross-hatching, stitched borders, halftone
 * flecks and paper grain. Seeded wobble keeps the "by hand" imperfections
 * perfectly still from frame to frame instead of buzzing like noise.
 */

export const PALETTE = {
  paper: '#F3E7D1',
  paperLight: '#FBF3E1',
  paperDeep: '#E8D6B5',
  paperShade: '#D9C39D',
  ink: '#2E2419',
  inkSoft: '#64513E',
  inkMuted: 'rgba(46, 36, 25, 0.42)',
  inkFaint: 'rgba(46, 36, 25, 0.16)',
  cream: '#FFF9E9',
  white: '#FFFDF7',
  red: '#CB5243',
  redDeep: '#94352A',
  redTint: '#F2C9BC',
  blue: '#3C7197',
  blueDeep: '#28506D',
  blueTint: '#C9DDE8',
  yellow: '#DFAC33',
  yellowDeep: '#99701C',
  yellowTint: '#F5E3A9',
  green: '#527F50',
  greenDeep: '#385B37',
  greenTint: '#CFE0C3',
  plum: '#7C5A73',
  plumDeep: '#5A3E53',
  plumTint: '#E4D2DF',
  orange: '#B97539',
  orangeDeep: '#8A5226',
  orangeTint: '#F1D8BE',
} as const;

export type TokenColor = 'red' | 'blue' | 'yellow' | 'green';

export interface TokenInk {
  fill: string;
  deep: string;
  tint: string;
  text: string;
  name: string;
}

export const TOKEN_INK: Record<TokenColor, TokenInk> = {
  red: {
    fill: PALETTE.red,
    deep: PALETTE.redDeep,
    tint: PALETTE.redTint,
    text: PALETTE.redDeep,
    name: 'Red',
  },
  blue: {
    fill: PALETTE.blue,
    deep: PALETTE.blueDeep,
    tint: PALETTE.blueTint,
    text: PALETTE.blueDeep,
    name: 'Blue',
  },
  yellow: {
    fill: PALETTE.yellow,
    deep: PALETTE.yellowDeep,
    tint: PALETTE.yellowTint,
    text: PALETTE.yellowDeep,
    name: 'Yellow',
  },
  green: {
    fill: PALETTE.green,
    deep: PALETTE.greenDeep,
    tint: PALETTE.greenTint,
    text: PALETTE.greenDeep,
    name: 'Green',
  },
};

export const FONT = {
  display: '"Fraunces", Georgia, serif',
  body: '"Karla", "Helvetica Neue", sans-serif',
  hand: '"Caveat", "Bradley Hand", cursive',
} as const;

/* -------------------------------------------------------------------------- */
/*  Deterministic wobble                                                       */
/* -------------------------------------------------------------------------- */

export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function withAlpha(hex: string, alpha: number): string {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
  const clean = hex.replace('#', '');
  const expanded =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const int = parseInt(expanded, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface Point {
  x: number;
  y: number;
}

export function irregularCircle(
  cx: number,
  cy: number,
  radius: number,
  seed: number,
  wobble = 2.2,
  steps = 72,
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    const offset =
      Math.sin(a * 3 + seed * 0.73) * wobble +
      Math.sin(a * 7 - seed * 0.31) * wobble * 0.42 +
      Math.sin(a * 13 + seed * 1.17) * wobble * 0.18;
    points.push({
      x: cx + Math.cos(a) * (radius + offset),
      y: cy + Math.sin(a) * (radius + offset),
    });
  }
  return points;
}

export function tracePoints(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  close = true,
): void {
  if (!points.length) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  if (close) ctx.closePath();
}

/** Hand-cut rounded rectangle with gently wobbling edges. */
export function roundedRectPoints(
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  seed: number,
  jitter = 1.1,
): Point[] {
  const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
  const points: Point[] = [];
  const jitterAt = (i: number) =>
    Math.sin(i * 1.73 + seed * 0.7) * jitter +
    Math.sin(i * 4.11 - seed * 0.3) * jitter * 0.35;

  // Each side is sampled separately; corners are quarter-circle samples.
  const edge = (
    from: Point,
    to: Point,
    count: number,
    normal: Point,
    phase: number,
  ) => {
    for (let i = 0; i <= count; i += 1) {
      const t = i / count;
      const bump = jitterAt(phase + i) * (Math.sin(t * Math.PI) * 0.8 + 0.2);
      points.push({
        x: from.x + (to.x - from.x) * t + normal.x * bump,
        y: from.y + (to.y - from.y) * t + normal.y * bump,
      });
    }
  };

  const arc = (
    cx: number,
    cy: number,
    start: number,
    end: number,
    count: number,
    phase: number,
  ) => {
    for (let i = 0; i <= count; i += 1) {
      const a = start + (end - start) * (i / count);
      const bump = jitterAt(phase + i) * 0.65;
      points.push({
        x: cx + Math.cos(a) * (r + bump),
        y: cy + Math.sin(a) * (r + bump),
      });
    }
  };

  // top edge (left to right)
  edge(
    {x: x + r, y},
    {x: x + w - r, y},
    Math.max(2, Math.floor(w / 24)),
    {x: 0, y: -1},
    1,
  );
  arc(x + w - r, y + r, -Math.PI / 2, 0, 6, 40);
  // right edge
  edge(
    {x: x + w, y: y + r},
    {x: x + w, y: y + h - r},
    Math.max(2, Math.floor(h / 24)),
    {x: 1, y: 0},
    70,
  );
  arc(x + w - r, y + h - r, 0, Math.PI / 2, 6, 90);
  // bottom edge
  edge(
    {x: x + w - r, y: y + h},
    {x: x + r, y: y + h},
    Math.max(2, Math.floor(w / 24)),
    {x: 0, y: 1},
    120,
  );
  arc(x + r, y + h - r, Math.PI / 2, Math.PI, 6, 150);
  // left edge
  edge(
    {x, y: y + h - r},
    {x, y: y + r},
    Math.max(2, Math.floor(h / 24)),
    {x: -1, y: 0},
    180,
  );
  arc(x + r, y + r, Math.PI, Math.PI * 1.5, 6, 210);

  return points;
}

export function drawBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  seed: number,
  options: {
    fill?: string;
    stroke?: string;
    lineWidth?: number;
    wobble?: number;
    dash?: number[];
    alpha?: number;
  } = {},
): void {
  const {
    fill,
    stroke,
    lineWidth = 3,
    wobble = 2.2,
    dash,
    alpha = 1,
  } = options;
  ctx.save();
  ctx.globalAlpha *= alpha;
  tracePoints(ctx, irregularCircle(cx, cy, radius, seed, wobble));
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPaperCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed: number,
  options: {
    fill?: string;
    radius?: number;
    shadow?: number;
    border?: string;
    lineWidth?: number;
    stitched?: boolean;
    stitchColor?: string;
  } = {},
): void {
  const {
    fill = PALETTE.paperLight,
    radius = 10,
    shadow = 9,
    border = PALETTE.ink,
    lineWidth = 3,
    stitched = true,
    stitchColor = PALETTE.inkMuted,
  } = options;

  // Hard offset shadow, like a block print pulled a hair off register.
  if (shadow > 0) {
    ctx.save();
    tracePoints(
      ctx,
      roundedRectPoints(x + shadow * 0.75, y + shadow, w, h, radius, seed + 9, 1.4),
    );
    ctx.fillStyle = 'rgba(46, 36, 25, 0.18)';
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  tracePoints(ctx, roundedRectPoints(x, y, w, h, radius, seed, 1.2));
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.restore();

  if (stitched) {
    ctx.save();
    tracePoints(
      ctx,
      roundedRectPoints(x + 9, y + 9, w - 18, h - 18, Math.max(3, radius - 4), seed + 3, 0.8),
    );
    ctx.strokeStyle = stitchColor;
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 7]);
    ctx.lineDashOffset = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

/** A strip of translucent washi tape with torn ends. */
export function drawTape(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  angle: number,
  color: string,
  seed = 4,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  const steps = 6;
  const notch = 4;
  ctx.moveTo(-w / 2, -h / 2);
  for (let i = 0; i <= steps; i += 1) {
    const px = -w / 2 + (w * i) / steps;
    ctx.lineTo(px, -h / 2 + (i % 2 ? notch * 0.35 : 0));
  }
  for (let i = 0; i <= steps; i += 1) {
    const py = -h / 2 + (h * i) / steps;
    ctx.lineTo(w / 2 - (i % 2 ? notch : 0), py);
  }
  for (let i = 0; i <= steps; i += 1) {
    const px = w / 2 - (w * i) / steps;
    ctx.lineTo(px, h / 2 - (i % 2 ? notch * 0.4 : 0));
  }
  for (let i = 0; i <= steps; i += 1) {
    const py = h / 2 - (h * i) / steps;
    ctx.lineTo(-w / 2 + (i % 2 ? notch * 0.8 : 0), py);
  }
  ctx.closePath();
  ctx.globalAlpha = 0.78;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1;
  ctx.stroke();

  // faint paper fibres in the tape
  const rng = mulberry32(seed);
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = PALETTE.ink;
  for (let i = 0; i < 7; i += 1) {
    const yy = -h / 2 + rng() * h;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + rng() * w * 0.25, yy);
    ctx.lineTo(w / 2 - rng() * w * 0.25, yy + (rng() - 0.5) * 3);
    ctx.stroke();
  }
  ctx.restore();
}

/* -------------------------------------------------------------------------- */
/*  Text                                                                      */
/* -------------------------------------------------------------------------- */

export function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    font: string;
    color: string;
    spacing?: number;
    align?: 'left' | 'center' | 'right';
    baseline?: CanvasTextBaseline;
    alpha?: number;
  },
): void {
  const {
    font,
    color,
    spacing = 0,
    align = 'center',
    baseline = 'middle',
    alpha = 1,
  } = options;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = baseline;
  ctx.textAlign = 'left';

  const widths = Array.from(text).map((char) => ctx.measureText(char).width);
  const total =
    widths.reduce((sum, width) => sum + width, 0) +
    Math.max(0, text.length - 1) * spacing;
  let cursor = x;
  if (align === 'center') cursor = x - total / 2;
  else if (align === 'right') cursor = x - total;

  Array.from(text).forEach((char, index) => {
    ctx.fillText(char, cursor, y);
    cursor += widths[index] + spacing;
  });
  ctx.restore();
}

export function splitLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  font: string,
): string[] {
  ctx.save();
  ctx.font = font;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !current) {
      current = test;
    } else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  ctx.restore();
  return lines;
}

export interface FittedText {
  lines: string[];
  fontSize: number;
  lineHeight: number;
}

export function fitDisplayText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  options: {maxSize?: number; minSize?: number; maxLines?: number; weight?: number} = {},
): FittedText {
  const {
    maxSize = 48,
    minSize = 28,
    maxLines = 2,
    weight = 800,
  } = options;
  let size = maxSize;
  while (size >= minSize) {
    const font = `${weight} ${size}px ${FONT.display}`;
    const lines = splitLines(ctx, text, maxWidth, font);
    if (lines.length <= maxLines) {
      return {lines, fontSize: size, lineHeight: size * 1.06};
    }
    size -= 2;
  }
  const font = `${weight} ${minSize}px ${FONT.display}`;
  return {
    lines: splitLines(ctx, text, maxWidth, font),
    fontSize: minSize,
    lineHeight: minSize * 1.06,
  };
}

/* -------------------------------------------------------------------------- */
/*  Little printed decorations                                                */
/* -------------------------------------------------------------------------- */

export function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  fill: string,
  rotation = -Math.PI / 2,
  wobble = 0.6,
  seed = 2,
): void {
  const points: Point[] = [];
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const a = rotation + (i * Math.PI) / 5;
    const bump = Math.sin(i * 2.1 + seed) * wobble;
    points.push({
      x: cx + Math.cos(a) * (radius + bump),
      y: cy + Math.sin(a) * (radius + bump),
    });
  }
  tracePoints(ctx, points);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawDiamond(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  fill: string,
  wobble = 1,
  seed = 7,
): void {
  const points: Point[] = [
    {x: cx, y: cy - radius - Math.sin(seed) * wobble},
    {x: cx + radius * 0.9 + Math.cos(seed) * wobble, y: cy},
    {x: cx, y: cy + radius + Math.cos(seed * 1.4) * wobble},
    {x: cx - radius * 0.9 + Math.sin(seed * 1.7) * wobble, y: cy},
  ];
  tracePoints(ctx, points);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawSquareGlyph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fill: string,
  seed = 3,
): void {
  tracePoints(
    ctx,
    roundedRectPoints(cx - size / 2, cy - size / 2, size, size, size * 0.16, seed, 0.8),
  );
  ctx.fillStyle = fill;
  ctx.fill();
}

export function drawSymbolGlyph(
  ctx: CanvasRenderingContext2D,
  symbol: 'circle' | 'diamond' | 'star' | 'square',
  cx: number,
  cy: number,
  size: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  if (symbol === 'circle') {
    drawBlob(ctx, cx, cy, size / 2, 17, {fill: color, wobble: size * 0.015});
  } else if (symbol === 'diamond') {
    drawDiamond(ctx, cx, cy, size / 2, color, 1.2, 8);
  } else if (symbol === 'star') {
    drawStar(ctx, cx, cy, size / 2, size / 4.4, color, -Math.PI / 2, 0.6, 4);
  } else {
    drawSquareGlyph(ctx, cx, cy, size * 0.82, color);
  }
  ctx.restore();
}

export function drawStitches(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  count: number,
  color: string,
  width = 2,
  seed = 3,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / (len || 1);
  const ny = dx / (len || 1);
  for (let i = 0; i < count; i += 1) {
    const t = (i + 0.5) / count;
    const skew = Math.sin(i * 1.7 + seed) * 2.4;
    const cx = x1 + dx * t;
    const cy = y1 + dy * t;
    ctx.beginPath();
    ctx.moveTo(cx - (dx / len) * 4.5 + nx * skew, cy - (dy / len) * 4.5 + ny * skew);
    ctx.lineTo(cx + (dx / len) * 4.5 - nx * skew, cy + (dy / len) * 4.5 - ny * skew);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawSparkle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  rotation = 0,
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(1.4, radius * 0.18);
  ctx.beginPath();
  ctx.moveTo(-radius, 0);
  ctx.lineTo(radius, 0);
  ctx.moveTo(0, -radius);
  ctx.lineTo(0, radius);
  ctx.stroke();
  ctx.restore();
}

export function drawSpool(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  threadColor: string,
  angle = -0.1,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // loose thread
  ctx.strokeStyle = withAlpha(threadColor, 0.65);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(20, 10);
  ctx.bezierCurveTo(52, 26, 30, 48, 60, 64);
  ctx.bezierCurveTo(82, 76, 72, 90, 88, 96);
  ctx.stroke();

  // wooden ends
  ctx.fillStyle = '#D9C39D';
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.5;
  tracePoints(ctx, roundedRectPoints(-34, -42, 68, 13, 4, 5, 0.7));
  ctx.fill();
  ctx.stroke();
  tracePoints(ctx, roundedRectPoints(-34, 29, 68, 13, 4, 8, 0.7));
  ctx.fill();
  ctx.stroke();

  // thread body
  tracePoints(ctx, roundedRectPoints(-25, -31, 50, 62, 5, 3, 0.7));
  ctx.fillStyle = PALETTE.paperLight;
  ctx.fill();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // wound thread
  ctx.strokeStyle = withAlpha(threadColor, 0.75);
  ctx.lineWidth = 2.1;
  for (let i = 0; i < 9; i += 1) {
    const yy = -26 + i * 6.4;
    ctx.beginPath();
    ctx.moveTo(-21, yy);
    ctx.lineTo(21, yy + 3.5);
    ctx.stroke();
  }

  // wooden spindle hole
  ctx.fillStyle = PALETTE.ink;
  ctx.beginPath();
  ctx.arc(0, -36, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 35, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawNeedle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  threadColor: string,
  angle = 0.6,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-44, 0);
  ctx.quadraticCurveTo(10, -2, 53, 0);
  ctx.stroke();

  // eye of the needle
  ctx.strokeStyle = PALETTE.paperLight;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(43, 0, 6, 3.2, 0.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(43, 0, 6, 3.2, 0.1, 0, Math.PI * 2);
  ctx.stroke();

  // thread through the eye
  ctx.strokeStyle = withAlpha(threadColor, 0.7);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(45, -2);
  ctx.bezierCurveTo(28, -30, 4, -25, -8, -52);
  ctx.stroke();
  ctx.restore();
}

export function drawThimble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  threadColor: string,
  angle = -0.25,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.lineJoin = 'round';

  ctx.fillStyle = withAlpha(threadColor, 0.22);
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-28, 22);
  ctx.lineTo(-24, -10);
  ctx.quadraticCurveTo(-20, -34, 0, -38);
  ctx.quadraticCurveTo(20, -34, 24, -10);
  ctx.lineTo(28, 22);
  ctx.quadraticCurveTo(0, 30, -28, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // rim
  ctx.beginPath();
  ctx.moveTo(-29, 20);
  ctx.quadraticCurveTo(0, 28, 29, 20);
  ctx.stroke();

  // dimples
  ctx.fillStyle = withAlpha(PALETTE.ink, 0.65);
  for (let row = 0; row < 4; row += 1) {
    const count = row === 0 ? 3 : 5 - Math.floor(row / 2);
    for (let i = 0; i < count; i += 1) {
      const px = -16 + i * 8 + (row % 2) * 3;
      const py = -24 + row * 10 + Math.abs(px) * 0.08;
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawScissors(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  threadColor: string,
  angle = -0.36,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);
  ctx.lineCap = 'round';
  ctx.strokeStyle = PALETTE.ink;
  ctx.lineWidth = 2.4;

  // blades
  ctx.beginPath();
  ctx.moveTo(-6, -4);
  ctx.lineTo(42, -18);
  ctx.moveTo(-6, 4);
  ctx.lineTo(42, 18);
  ctx.stroke();

  // handle loops
  ctx.beginPath();
  ctx.ellipse(-22, -14, 13, 9, -0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(-22, 14, 13, 9, 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // pivot
  ctx.fillStyle = PALETTE.paperLight;
  ctx.beginPath();
  ctx.arc(-5, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // thread snippet
  ctx.strokeStyle = withAlpha(threadColor, 0.7);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(42, -18);
  ctx.bezierCurveTo(52, -30, 44, -40, 58, -44);
  ctx.stroke();
  ctx.restore();
}

export function drawTinyButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  angle = 0,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  drawBlob(ctx, 0, 0, radius, 12, {
    fill: color,
    stroke: PALETTE.ink,
    lineWidth: Math.max(1.8, radius * 0.12),
    wobble: radius * 0.035,
  });
  ctx.fillStyle = PALETTE.paperLight;
  const holeR = Math.max(1.4, radius * 0.1);
  [
    [-0.32, -0.32],
    [0.32, -0.32],
    [-0.32, 0.32],
    [0.32, 0.32],
  ].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(dx * radius, dy * radius, holeR, 0, Math.PI * 2);
    ctx.fill();
  });
  // thread through two holes
  ctx.strokeStyle = withAlpha(PALETTE.ink, 0.55);
  ctx.lineWidth = Math.max(1.2, radius * 0.09);
  ctx.beginPath();
  ctx.moveTo(-0.32 * radius, -0.32 * radius);
  ctx.lineTo(0.32 * radius, 0.32 * radius);
  ctx.stroke();
  ctx.restore();
}

/* -------------------------------------------------------------------------- */
/*  Paper backdrop                                                            */
/* -------------------------------------------------------------------------- */

function makeNoisePattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  const tile = document.createElement('canvas');
  tile.width = 180;
  tile.height = 180;
  const tileCtx = tile.getContext('2d');
  if (!tileCtx) return null;
  const image = tileCtx.createImageData(tile.width, tile.height);
  const rng = mulberry32(1337);
  for (let i = 0; i < image.data.length; i += 4) {
    const value = rng();
    if (value > 0.82) {
      const darkness = 30 + Math.floor(rng() * 50);
      image.data[i] = darkness;
      image.data[i + 1] = darkness - 5;
      image.data[i + 2] = darkness - 10;
      image.data[i + 3] = Math.floor(8 + rng() * 18);
    } else if (value > 0.72) {
      image.data[i] = 255;
      image.data[i + 1] = 250;
      image.data[i + 2] = 235;
      image.data[i + 3] = Math.floor(10 + rng() * 16);
    }
  }
  tileCtx.putImageData(image, 0, 0);
  return ctx.createPattern(tile, 'repeat');
}

function drawBackdropDoodles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const portrait = height > width * 1.05;
  ctx.save();
  ctx.globalAlpha = portrait ? 0.4 : 0.55;
  if (portrait) {
    drawNeedle(ctx, width / 2 + 126, 62, 0.52, PALETTE.blue, 0.52);
    drawTinyButton(ctx, 52, height / 2 - 28, 9, PALETTE.red, -0.3);
    drawTinyButton(ctx, width - 48, height / 2 + 42, 8, PALETTE.green, 0.4);
  } else {
    drawSpool(ctx, 66, 98, 0.72, PALETTE.red, -0.22);
    drawNeedle(ctx, width - 102, 92, 0.68, PALETTE.blue, 0.7);
    drawThimble(ctx, 76, height - 86, 0.68, PALETTE.yellow, -0.2);
    drawScissors(ctx, width - 88, height - 76, 0.7, PALETTE.green, 0.32);
  }
  ctx.restore();

  // small loose buttons in the margins
  if (!portrait) {
    drawTinyButton(ctx, 56, 238, 11, PALETTE.yellow, -0.3);
    drawTinyButton(ctx, width - 48, 230, 8, PALETTE.green, 0.4);
    drawTinyButton(ctx, 54, height - 210, 7.5, PALETTE.blue, 0.2);
    drawTinyButton(ctx, width - 54, height - 220, 10, PALETTE.red, -0.5);
  }

  // registration marks, like a print shop proof
  const mark = (x: number, y: number) => {
    ctx.save();
    ctx.strokeStyle = withAlpha(PALETTE.ink, 0.28);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.moveTo(x - 13, y);
    ctx.lineTo(x + 13, y);
    ctx.moveTo(x, y - 13);
    ctx.lineTo(x, y + 13);
    ctx.stroke();
    ctx.restore();
  };
  mark(24, 24);
  mark(width - 24, 24);
  mark(24, height - 24);
  mark(width - 24, height - 24);

  drawTrackedText(ctx, 'THE BUTTON MUSEUM', width / 2, 35, {
    font: `600 9px ${FONT.body}`,
    color: withAlpha(PALETTE.ink, 0.42),
    spacing: 3.4,
  });
  drawTrackedText(ctx, 'PLATE IV · PRINTED BY HAND', width / 2, height - 34, {
    font: `600 8px ${FONT.body}`,
    color: withAlpha(PALETTE.ink, 0.32),
    spacing: 2.8,
  });
}

function drawStaticBackdrop(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  rings: Array<[number, number, number]>,
): void {
  ctx.save();
  ctx.scale(scale, scale);

  // Base paper and a wash of warmer pulp in the middle.
  ctx.fillStyle = PALETTE.paper;
  ctx.fillRect(0, 0, width, height);
  const wash = ctx.createRadialGradient(
    width / 2,
    height / 2 - 20,
    40,
    width / 2,
    height / 2,
    width * 0.62,
  );
  wash.addColorStop(0, 'rgba(255, 249, 233, 0.72)');
  wash.addColorStop(0.55, 'rgba(255, 249, 233, 0.18)');
  wash.addColorStop(1, 'rgba(185, 156, 111, 0.14)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, width, height);

  // Grain.
  const pattern = makeNoisePattern(ctx);
  if (pattern) {
    ctx.save();
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  // Big faint plate behind the prompt card.
  const haloCx = width / 2;
  const haloCy = height / 2;
  ctx.save();
  ctx.globalAlpha = 0.45;
  drawBlob(ctx, haloCx, haloCy, 306, 21, {
    fill: 'rgba(255, 249, 233, 0.6)',
    wobble: 5,
  });
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 36; i += 1) {
    const a = (i / 36) * Math.PI * 2;
    ctx.strokeStyle = withAlpha(PALETTE.ink, i % 3 === 0 ? 0.35 : 0.2);
    ctx.lineWidth = i % 3 === 0 ? 1.3 : 0.8;
    ctx.beginPath();
    ctx.moveTo(
      haloCx + Math.cos(a) * 324,
      haloCy + Math.sin(a) * 324,
    );
    ctx.lineTo(
      haloCx + Math.cos(a) * (342 + (i % 4) * 6),
      haloCy + Math.sin(a) * (342 + (i % 4) * 6),
    );
    ctx.stroke();
  }
  ctx.restore();

  // Halftone flecks in two corners.
  const halftone = (x0: number, y0: number, x1: number, y1: number, alpha: number) => {
    ctx.save();
    ctx.fillStyle = withAlpha(PALETTE.ink, alpha);
    for (let y = y0; y < y1; y += 12) {
      for (let x = x0; x < x1; x += 12) {
        const falloff = 1 - Math.min(1, Math.hypot((x - x0) / (x1 - x0), (y - y0) / (y1 - y0)) * 0.7);
        if ((x + y) % 24 === 0) {
          ctx.beginPath();
          ctx.arc(x, y, 1.1 + falloff * 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  };
  halftone(24, height - 190, 180, height - 24, 0.14);
  halftone(width - 180, 24, width - 24, 190, 0.12);

  // Hairline double frame with hand-drawn corners.
  ctx.strokeStyle = withAlpha(PALETTE.ink, 0.3);
  ctx.lineWidth = 1.4;
  ctx.setLineDash([1.5, 7]);
  ctx.beginPath();
  ctx.rect(20, 20, width - 40, height - 40);
  ctx.stroke();
  ctx.setLineDash([]);

  // Quadrant stitch rings, barely printed.
  rings.forEach(([x, y, r], index) => {
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = withAlpha(PALETTE.ink, 0.4);
    ctx.lineWidth = 1.1;
    ctx.setLineDash([2, 8]);
    ctx.beginPath();
    ctx.arc(x, y, r + (index % 2) * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    drawSparkle(
      ctx,
      x + r * 0.94,
      y - r * 0.66,
      5,
      withAlpha(PALETTE.ink, 0.28),
      0.3,
    );
  });

  drawBackdropDoodles(ctx, width, height);

  ctx.restore();
}

const backdropCache = new Map<string, HTMLCanvasElement>();

export function getPaperBackdrop(
  width: number,
  height: number,
  pixelRatio = 1,
  rings: Array<[number, number, number]> = [],
): HTMLCanvasElement | null {
  const scale = Math.max(1, Math.min(2, pixelRatio));
  const key = `${width}x${height}@${scale}:${rings.map((r) => r.join(',')).join(';')}`;
  const cached = backdropCache.get(key);
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  drawStaticBackdrop(ctx, width, height, scale, rings);
  backdropCache.set(key, canvas);
  return canvas;
}
