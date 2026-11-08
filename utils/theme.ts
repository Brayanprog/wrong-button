/**
 * The printed-paper skin for Wrong Button. All of it lives in one template
 * string so the game has no build-time dependency on a CSS pipeline.
 */
export const GAME_CSS = `
@font-face {
  font-family: 'Fraunces';
  src: url('assets/fonts/fraunces.woff2') format('woff2');
  font-weight: 300 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Fraunces';
  src: url('assets/fonts/fraunces-italic.woff2') format('woff2');
  font-weight: 300 900;
  font-style: italic;
  font-display: swap;
}
@font-face {
  font-family: 'Karla';
  src: url('assets/fonts/karla.woff2') format('woff2');
  font-weight: 400 800;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Caveat';
  src: url('assets/fonts/caveat.woff2') format('woff2');
  font-weight: 400 700;
  font-style: normal;
  font-display: swap;
}

:root {
  --paper: #F3E7D1;
  --paper-light: #FBF3E1;
  --paper-deep: #E8D6B5;
  --paper-shade: #D9C39D;
  --ink: #2E2419;
  --ink-soft: #64513E;
  --ink-faint: rgba(46, 36, 25, 0.16);
  --red: #CB5243;
  --red-deep: #94352A;
  --red-tint: #F2C9BC;
  --blue: #3C7197;
  --blue-deep: #28506D;
  --blue-tint: #C9DDE8;
  --yellow: #DFAC33;
  --yellow-deep: #99701C;
  --yellow-tint: #F5E3A9;
  --green: #527F50;
  --green-deep: #385B37;
  --green-tint: #CFE0C3;
  --plum: #7C5A73;
  --plum-deep: #5A3E53;
  --plum-tint: #E4D2DF;
  --font-display: 'Fraunces', Georgia, serif;
  --font-body: 'Karla', 'Helvetica Neue', sans-serif;
  --font-hand: 'Caveat', 'Bradley Hand', cursive;
}

* { box-sizing: border-box; }

html, body, #root {
  width: 100%;
  height: 100%;
  height: 100dvh;
  margin: 0;
  overscroll-behavior: none;
  background: var(--paper-deep);
}

body {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.wb-shell {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  color: var(--ink);
  font-family: var(--font-body);
  background-color: var(--paper);
}

.wb-shell button { font: inherit; color: inherit; }
.wb-shell button:focus-visible {
  outline: 3px dashed var(--red);
  outline-offset: 3px;
}

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

.wb-header {
  position: relative;
  z-index: 30;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: clamp(10px, 2vw, 22px);
  padding:
    calc(9px + env(safe-area-inset-top, 0px))
    calc(clamp(12px, 2.6vw, 30px) + env(safe-area-inset-right, 0px))
    9px
    calc(clamp(12px, 2.6vw, 30px) + env(safe-area-inset-left, 0px));
  background-color: var(--paper);
  border-bottom: 2px solid var(--ink);
  box-shadow: 0 3px 0 rgba(46, 36, 25, 0.07);
}

.wb-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 0 0 auto;
}

.wb-brand-mark {
  width: clamp(34px, 3.4vw, 44px);
  height: clamp(34px, 3.4vw, 44px);
  transform: rotate(-6deg);
  filter: drop-shadow(2px 3px 0 rgba(46, 36, 25, 0.16));
}

.wb-wordmark {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(22px, 2.25vw, 30px);
  line-height: 0.86;
  letter-spacing: -0.055em;
  white-space: nowrap;
}
.wb-wordmark em { color: var(--red-deep); font-style: italic; }

.wb-kicker {
  margin-top: 3px;
  font-family: var(--font-hand);
  font-size: clamp(12px, 1.2vw, 16px);
  line-height: 1;
  color: var(--ink-soft);
  transform: rotate(-1.5deg) translateX(1px);
  transform-origin: left center;
  white-space: nowrap;
}

.wb-hud {
  display: flex;
  align-items: center;
  gap: clamp(12px, 2.3vw, 28px);
  margin-left: auto;
}

.wb-stat {
  display: flex;
  align-items: baseline;
  gap: 7px;
}
.wb-stat-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.19em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.wb-stat-value {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(21px, 2.25vw, 29px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.wb-stat-mult {
  display: inline-block;
  margin-left: 4px;
  font-family: var(--font-hand);
  font-size: clamp(14px, 1.5vw, 19px);
  font-weight: 700;
  color: var(--red-deep);
  transform: rotate(-5deg) translateY(-1px);
}
.wb-hud-rule {
  width: 1px;
  height: 24px;
  background: var(--ink);
  opacity: 0.2;
  transform: rotate(2deg);
}
.wb-streak-star {
  width: 13px;
  height: 13px;
  color: var(--yellow-deep);
  transform: translateY(-1px) rotate(-9deg);
}

.wb-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
}

.wb-control {
  width: clamp(34px, 3.1vw, 40px);
  height: clamp(34px, 3.1vw, 40px);
  display: grid;
  place-items: center;
  padding: 0;
  border: 2px solid var(--ink);
  border-radius: 51% 47% 53% 46%;
  background: var(--paper-light);
  color: var(--ink);
  box-shadow: 2px 3px 0 var(--ink);
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease;
}
@media (hover: hover) and (pointer: fine) {
.wb-control:hover {
  transform: translate(-1px, -2px);
  box-shadow: 4px 6px 0 var(--ink);
  background: var(--yellow-tint);
}
}
.wb-control:active {
  transform: translate(2px, 3px);
  box-shadow: 0 1px 0 var(--ink);
}
.wb-control.is-muted { background: var(--red-tint); color: var(--red-deep); }

/* ------------------------------------------------------------------ */
/* Stage                                                              */
/* ------------------------------------------------------------------ */

.wb-main {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  padding:
    clamp(8px, 1.7vw, 20px)
    calc(clamp(10px, 2.6vw, 34px) + env(safe-area-inset-right, 0px))
    clamp(8px, 1.7vw, 20px)
    calc(clamp(10px, 2.6vw, 34px) + env(safe-area-inset-left, 0px));
  background-color: var(--paper-deep);
  background-image:
    radial-gradient(rgba(46, 36, 25, 0.13) 0.7px, transparent 0.9px),
    radial-gradient(rgba(255, 249, 233, 0.55) 0.7px, transparent 1px);
  background-size: 17px 17px, 23px 23px;
  background-position: 0 0, 9px 11px;
}

.wb-stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wb-canvas-frame {
  position: relative;
  flex: 0 0 auto;
  overflow: hidden;
  border: 2px solid var(--ink);
  border-radius: 7px;
  background: var(--paper);
  box-shadow:
    7px 9px 0 rgba(46, 36, 25, 0.19),
    0 0 0 1px rgba(255, 249, 233, 0.4) inset;
}

.wb-canvas-frame::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: 5px;
  box-shadow: inset 0 0 0 1px rgba(46, 36, 25, 0.08);
}

.wb-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  touch-action: none;
}

/* ------------------------------------------------------------------ */
/* Footer                                                             */
/* ------------------------------------------------------------------ */

.wb-footer {
  position: relative;
  z-index: 20;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding:
    5px
    calc(clamp(12px, 2.6vw, 30px) + env(safe-area-inset-right, 0px))
    calc(5px + env(safe-area-inset-bottom, 0px))
    calc(clamp(12px, 2.6vw, 30px) + env(safe-area-inset-left, 0px));
  background: var(--paper);
  border-top: 2px solid var(--ink);
  font-size: 11px;
  color: var(--ink-soft);
}

.wb-keys {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  white-space: nowrap;
}
.wb-keys span.wb-key-group {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-right: 8px;
}
.wb-keys kbd {
  display: inline-grid;
  place-items: center;
  min-width: 17px;
  height: 18px;
  padding: 0 4px;
  border: 1.5px solid var(--ink);
  border-bottom-width: 3px;
  border-radius: 3px;
  background: var(--paper-light);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 1px 1px 0 rgba(46, 36, 25, 0.15);
  text-transform: none;
}

.wb-foot-note {
  font-family: var(--font-hand);
  font-size: 16px;
  color: var(--ink-soft);
  transform: rotate(-0.8deg);
  white-space: nowrap;
}

.wb-records {
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}
.wb-records-label {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.wb-records strong {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 15px;
  color: var(--ink);
  letter-spacing: -0.02em;
}
.wb-records i {
  width: 1px;
  height: 12px;
  background: var(--ink);
  opacity: 0.22;
}

/* ------------------------------------------------------------------ */
/* Loading                                                            */
/* ------------------------------------------------------------------ */

.wb-loader {
  position: absolute;
  inset: 0;
  z-index: 80;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: var(--paper);
  color: var(--ink);
}
.wb-loader-mark {
  animation: wb-spin 3.6s linear infinite;
  filter: drop-shadow(3px 4px 0 rgba(46, 36, 25, 0.15));
}
@keyframes wb-spin { to { transform: rotate(360deg); } }
.wb-loader-line {
  font-family: var(--font-hand);
  font-size: 25px;
  color: var(--ink-soft);
  transform: rotate(-1deg);
}

/* ------------------------------------------------------------------ */
/* Overlays                                                           */
/* ------------------------------------------------------------------ */

.wb-overlay {
  background: rgba(46, 36, 25, 0.28);
  backdrop-filter: blur(2.5px) saturate(0.87);
  -webkit-backdrop-filter: blur(2.5px) saturate(0.87);
}
.wb-overlay-danger { background: rgba(94, 43, 32, 0.3); }
.wb-overlay-victory { background: rgba(47, 76, 40, 0.3); }

/* Small bridge for the utility classes MenuOverlay arrives with, so the
   posters centre correctly even when the host page does not supply them. */
.wb-shell .absolute { position: absolute; }
.wb-shell .inset-0 { inset: 0; }
.wb-shell .overflow-y-auto { overflow-y: auto; }
.wb-shell .touch-auto { touch-action: auto; }
.wb-shell .min-h-full { min-height: 100%; }
.wb-shell .flex { display: flex; }
.wb-shell .flex-col { flex-direction: column; }
.wb-shell .items-center { align-items: center; }
.wb-shell .p-4 { padding: 1rem; }
.wb-shell .m-auto { margin: auto; }
.wb-shell .w-full { width: 100%; }
.wb-shell .max-w-4xl { max-width: 56rem; }

.wb-poster {
  position: relative;
  width: min(100%, 650px);
  margin: 6px auto;
  padding: clamp(24px, 4vw, 42px) clamp(22px, 4.4vw, 48px) clamp(20px, 3.4vw, 34px);
  border: 3px solid var(--ink);
  border-radius: 6px;
  background-color: var(--paper-light);
  background-image: radial-gradient(rgba(46, 36, 25, 0.055) 0.6px, transparent 0.7px);
  background-size: 11px 11px;
  box-shadow: 12px 14px 0 rgba(46, 36, 25, 0.24);
  text-align: center;
  color: var(--ink);
}
.wb-poster::after {
  content: '';
  position: absolute;
  inset: 9px;
  border: 1.5px dashed rgba(46, 36, 25, 0.23);
  border-radius: 3px;
  pointer-events: none;
}
.wb-poster-narrow { max-width: 590px; }

.wb-tape {
  position: absolute;
  z-index: 2;
  width: 96px;
  height: 27px;
  background:
    linear-gradient(100deg, rgba(255, 249, 233, 0.22), rgba(46, 36, 25, 0.05)),
    var(--paper-shade);
  opacity: 0.76;
  mix-blend-mode: multiply;
  box-shadow: 0 1px 0 rgba(46, 36, 25, 0.12);
  pointer-events: none;
}
.wb-tape::before,
.wb-tape::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 9px;
  background: inherit;
}
.wb-tape::before { left: -7px; clip-path: polygon(100% 0, 0 17%, 100% 35%, 0 55%, 100% 75%, 0 100%, 100% 100%); }
.wb-tape::after { right: -7px; clip-path: polygon(0 0, 100% 18%, 0 38%, 100% 56%, 0 76%, 100% 100%, 0 100%); }
.wb-tape-left { top: 7px; left: 20px; transform: rotate(-4.5deg); }
.wb-tape-right { top: 8px; right: 20px; transform: rotate(3.5deg); }

.wb-eyebrow {
  display: inline-block;
  margin: 0 0 8px;
  font-family: var(--font-hand);
  font-size: clamp(18px, 2.1vw, 23px);
  font-weight: 600;
  line-height: 1;
  color: var(--red-deep);
  transform: rotate(-1.3deg);
}

.wb-poster h1 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(50px, 7.6vw, 78px);
  line-height: 0.88;
  letter-spacing: -0.065em;
  color: var(--ink);
}
.wb-poster h1 em {
  color: var(--red-deep);
  font-style: italic;
  letter-spacing: -0.075em;
}
.wb-title-squiggle {
  display: block;
  width: min(70%, 330px);
  height: 12px;
  margin: 7px auto 0;
  color: var(--red-deep);
  opacity: 0.8;
}

.wb-tagline {
  max-width: 480px;
  margin: 11px auto 0;
  font-size: clamp(13px, 1.45vw, 15.5px);
  line-height: 1.5;
  color: var(--ink-soft);
}
.wb-tagline strong { color: var(--ink); }

.wb-specimens {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(7px, 1.8vw, 18px);
  margin: 18px 0 14px;
  padding: 13px 0;
  border-top: 1.5px dashed rgba(46, 36, 25, 0.27);
  border-bottom: 1.5px dashed rgba(46, 36, 25, 0.27);
}
.wb-specimen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.wb-specimen-mark {
  filter: drop-shadow(2px 3px 0 rgba(46, 36, 25, 0.14));
  transition: transform 180ms ease;
}
@media (hover: hover) and (pointer: fine) {
.wb-specimen:hover .wb-specimen-mark { transform: translateY(-3px) rotate(-4deg); }
}
.wb-specimen-name {
  margin-top: 3px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 13px;
  line-height: 1;
  letter-spacing: 0.01em;
}
.wb-specimen-key {
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.wb-actions {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}
.wb-actions-stack { flex-direction: column; }

.wb-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 22px;
  border: 2.5px solid var(--ink);
  border-radius: 7px;
  background: var(--paper-light);
  color: var(--ink);
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(14px, 1.55vw, 16px);
  line-height: 1;
  letter-spacing: -0.01em;
  cursor: pointer;
  box-shadow: 4px 5px 0 var(--ink);
  transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease;
}
@media (hover: hover) and (pointer: fine) {
.wb-btn:hover {
  transform: translate(-1px, -2px);
  box-shadow: 6px 8px 0 var(--ink);
}
}
.wb-btn:active {
  transform: translate(3px, 4px);
  box-shadow: 1px 1px 0 var(--ink);
}
.wb-btn-primary { background: var(--red); color: var(--cream); }
@media (hover: hover) and (pointer: fine) {
.wb-btn-primary:hover { background: #D65C4C; }
}
.wb-btn-blue { background: var(--blue); color: #FFF9E9; }
.wb-btn-quiet {
  background: transparent;
  box-shadow: 2px 3px 0 var(--ink);
  font-size: clamp(12px, 1.3vw, 14px);
  padding: 10px 16px;
}
@media (hover: hover) and (pointer: fine) {
.wb-btn-quiet:hover { background: var(--paper); box-shadow: 4px 6px 0 var(--ink); }
}
.wb-btn-danger-quiet { color: var(--red-deep); }
.wb-btn-wide { width: 100%; }
.wb-btn svg { flex: 0 0 auto; }

.wb-records-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(10px, 2vw, 22px);
  margin-top: 15px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.wb-records-strip > span { display: inline-flex; align-items: center; gap: 5px; }
.wb-records-strip strong {
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.wb-quiet-record {
  margin-top: 14px;
  font-family: var(--font-hand);
  font-size: 18px;
  color: var(--ink-soft);
  transform: rotate(-0.8deg);
}

.wb-footnote {
  margin: 16px 0 0;
  font-family: var(--font-hand);
  font-size: 18px;
  line-height: 1.2;
  color: var(--ink-soft);
  transform: rotate(-0.7deg);
}
.wb-footnote::before { content: '✦ '; color: var(--yellow-deep); }

.wb-wrong-stamp {
  position: absolute;
  top: 26px;
  right: 26px;
  padding: 5px 9px 4px;
  border: 2.5px double var(--red-deep);
  border-radius: 4px;
  color: var(--red-deep);
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(13px, 1.8vw, 17px);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transform: rotate(8deg);
  opacity: 0.75;
  pointer-events: none;
}

/* Game-over diagnostic */

.wb-diagnostic {
  margin: 24px 0 0;
  padding: 14px 15px;
  border: 2px solid var(--ink);
  border-radius: 6px;
  background: rgba(255, 249, 233, 0.78);
  box-shadow: 3px 4px 0 rgba(46, 36, 25, 0.14);
  text-align: left;
}
.wb-diagnostic-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 9px;
}
.wb-diagnostic-title {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.19em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.wb-rule-tag {
  display: inline-block;
  padding: 3px 7px 2px;
  border: 1.5px solid currentColor;
  border-radius: 3px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  white-space: nowrap;
}
.wb-prompt-quote {
  margin: 0 0 10px;
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 700;
  font-size: clamp(18px, 2.1vw, 23px);
  line-height: 1.12;
  color: var(--ink);
}
.wb-diagnostic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.wb-diagnostic-cell {
  padding: 8px 9px;
  border: 1.5px solid var(--ink);
  border-radius: 4px;
  background: var(--red-tint);
}
.wb-diagnostic-cell.is-right { background: var(--green-tint); }
.wb-diagnostic-cell span {
  display: block;
  margin-bottom: 2px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.wb-diagnostic-cell strong {
  display: block;
  font-size: 12px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--ink);
}

.wb-score-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  margin: 14px 0 0;
  border-top: 1.5px dashed rgba(46, 36, 25, 0.3);
  border-bottom: 1.5px dashed rgba(46, 36, 25, 0.3);
}
.wb-score-cell {
  padding: 9px 4px 8px;
  text-align: center;
}
.wb-score-cell + .wb-score-cell { border-left: 1px solid rgba(46, 36, 25, 0.14); }
.wb-score-cell span {
  display: block;
  margin-bottom: 1px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.wb-score-cell strong {
  display: block;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(20px, 2.5vw, 26px);
  line-height: 1;
  color: var(--ink);
}
.wb-score-cell.is-best strong { color: var(--green-deep); }
.wb-score-cell.is-streak strong { color: var(--red-deep); }

.wb-curator-note {
  margin: 13px auto 0;
  max-width: 430px;
  font-family: var(--font-hand);
  font-size: 19px;
  line-height: 1.2;
  color: var(--ink-soft);
  transform: rotate(-0.6deg);
}

/* Pause menu */

.wb-pause-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin: 14px 0 4px;
  padding: 11px 0;
  border-top: 1.5px dashed rgba(46, 36, 25, 0.27);
  border-bottom: 1.5px dashed rgba(46, 36, 25, 0.27);
}
.wb-pause-stat { text-align: center; }
.wb-pause-stat span {
  display: block;
  margin-bottom: 1px;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--ink-soft);
}
.wb-pause-stat strong {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 23px;
  line-height: 1;
}
.wb-pause-rule { width: 1px; height: 27px; background: var(--ink); opacity: 0.18; }

.wb-menu-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 14px;
}
.wb-sound-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 2px;
}
.wb-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 8px;
  border: 2px solid var(--ink);
  border-radius: 5px;
  background: var(--paper-light);
  color: var(--ink);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  box-shadow: 2px 3px 0 var(--ink);
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease;
}
@media (hover: hover) and (pointer: fine) {
.wb-toggle:hover { transform: translate(-1px, -1px); box-shadow: 4px 5px 0 var(--ink); }
}
.wb-toggle:active { transform: translate(2px, 3px); box-shadow: 0 1px 0 var(--ink); }
.wb-toggle.is-muted { background: var(--red-tint); color: var(--red-deep); }

/* Rules sheet */

.wb-rules-title {
  font-size: clamp(42px, 5.6vw, 60px) !important;
  letter-spacing: -0.06em !important;
}
.wb-rules-scroll {
  margin-top: 16px;
  max-height: min(57vh, 500px);
  overflow-y: auto;
  padding-right: 5px;
  text-align: left;
  scrollbar-width: thin;
  scrollbar-color: var(--paper-shade) transparent;
}
.wb-rules-scroll::-webkit-scrollbar { width: 8px; }
.wb-rules-scroll::-webkit-scrollbar-thumb {
  background: var(--paper-shade);
  border-radius: 4px;
  border: 2px solid var(--paper-light);
}
.wb-rule-section {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 11px;
  padding: 12px 0;
  border-top: 1.5px dashed rgba(46, 36, 25, 0.3);
}
.wb-rule-number {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 2px solid var(--ink);
  border-radius: 51% 47% 53% 46%;
  background: var(--paper);
  color: var(--red-deep);
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 900;
  font-size: 17px;
  transform: rotate(-5deg);
}
.wb-rule-section h2 {
  margin: 1px 0 4px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.wb-rule-section p {
  margin: 0 0 5px;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--ink-soft);
}
.wb-rule-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 6px;
}
.wb-rule-example {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  padding: 4px 7px;
  border: 1.5px solid rgba(46, 36, 25, 0.32);
  border-radius: 3px;
  background: rgba(255, 249, 233, 0.62);
  font-size: 10px;
  line-height: 1.2;
  color: var(--ink-soft);
}
.wb-rule-example b {
  font-family: var(--font-hand);
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}
.wb-rule-tokens {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  margin-top: 6px;
}
.wb-rule-token {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border: 1.5px solid rgba(46, 36, 25, 0.28);
  border-radius: 3px;
  background: rgba(255, 249, 233, 0.55);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
}
.wb-rule-token span { color: var(--ink-soft); font-weight: 700; letter-spacing: 0; }
.wb-rules-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  padding-top: 13px;
  border-top: 1.5px dashed rgba(46, 36, 25, 0.3);
}

.wb-x {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 4;
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 2px solid var(--ink);
  border-radius: 50% 45% 52% 48%;
  background: var(--paper);
  color: var(--ink);
  box-shadow: 2px 2px 0 var(--ink);
  cursor: pointer;
}
@media (hover: hover) and (pointer: fine) {
.wb-x:hover { background: var(--red-tint); }
}
.wb-x:active { transform: translate(1px, 2px); box-shadow: 0 0 0 var(--ink); }

/* ------------------------------------------------------------------ */
/* Responsive                                                         */
/* ------------------------------------------------------------------ */

@media (max-width: 820px) {
  .wb-kicker { display: none; }
  .wb-foot-note { display: none; }
  .wb-stat-label { display: none; }
  .wb-hud-rule { height: 19px; }
}

@media (max-width: 640px) {
  .wb-header {
    padding:
      calc(7px + env(safe-area-inset-top, 0px))
      calc(11px + env(safe-area-inset-right, 0px))
      7px
      calc(11px + env(safe-area-inset-left, 0px));
    gap: 9px;
  }
  .wb-wordmark { font-size: 21px; }
  .wb-brand-mark { width: 31px; height: 31px; }
  .wb-brand { gap: 6px; }
  .wb-hud { gap: 11px; }
  .wb-stat-value { font-size: 20px; }
  .wb-controls { gap: 6px; }
  .wb-control { width: 32px; height: 32px; border-width: 1.8px; }
  .wb-help-control { display: none; }
  .wb-stat-round, .wb-hud-rule-round { display: none; }
  .wb-footer { display: none; }
  .wb-main {
    padding:
      7px
      calc(8px + env(safe-area-inset-right, 0px))
      7px
      calc(8px + env(safe-area-inset-left, 0px));
  }
  .wb-poster { padding: 25px 18px 20px; box-shadow: 8px 10px 0 rgba(46, 36, 25, 0.24); }
  .wb-poster::after { inset: 7px; }
  .wb-tape-left { left: 12px; width: 78px; }
  .wb-tape-right { right: 12px; width: 78px; }
  .wb-specimens { grid-template-columns: repeat(2, 1fr); row-gap: 9px; margin-top: 14px; padding: 10px 0; }
  .wb-specimen-mark { width: 47px; height: 47px; }
  .wb-specimen-name { font-size: 12px; }
  .wb-actions { flex-direction: column; }
  .wb-btn { width: 100%; padding: 11px 16px; }
  .wb-wrong-stamp { top: 18px; right: 16px; }
  .wb-diagnostic-grid { grid-template-columns: 1fr; }
  .wb-rules-scroll { max-height: 52vh; }
  .wb-rule-section { grid-template-columns: 30px 1fr; gap: 9px; }
  .wb-rule-number { width: 26px; height: 26px; font-size: 15px; }
  .wb-rule-section h2 { font-size: 16px; }
  .wb-rule-section p { font-size: 12px; }
  .wb-pause-stats { gap: 12px; }
  .wb-score-strip { grid-template-columns: repeat(3, 1fr); }
}

@media (max-height: 620px) and (orientation: landscape) {
  .wb-header {
    padding:
      calc(5px + env(safe-area-inset-top, 0px))
      calc(14px + env(safe-area-inset-right, 0px))
      5px
      calc(14px + env(safe-area-inset-left, 0px));
  }
  .wb-footer {
    padding:
      3px
      calc(14px + env(safe-area-inset-right, 0px))
      calc(3px + env(safe-area-inset-bottom, 0px))
      calc(14px + env(safe-area-inset-left, 0px));
  }
  .wb-main {
    padding:
      6px
      calc(12px + env(safe-area-inset-right, 0px))
      6px
      calc(12px + env(safe-area-inset-left, 0px));
  }
  .wb-poster { padding: 19px 30px 15px; }
  .wb-poster h1 { font-size: 46px; }
  .wb-tagline { font-size: 12px; margin-top: 8px; }
  .wb-specimens { margin: 11px 0 9px; padding: 8px 0; }
  .wb-actions { margin-top: 11px; }
  .wb-footnote { margin-top: 9px; font-size: 16px; }
}

/* Touch targets: keep every control at least ~44px on coarse pointers. */
@media (pointer: coarse) {
  .wb-control { width: 44px; height: 44px; }
  .wb-toggle { padding: 12px 8px; }
  .wb-x { width: 44px; height: 44px; }
}

@media (prefers-reduced-motion: reduce) {
  .wb-loader-mark { animation: none; }
  .wb-control, .wb-btn, .wb-toggle, .wb-specimen-mark { transition: none; }
}
`;
