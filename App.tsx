// tslint:disable
/* eslint-disable */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {getConfig} from './constants';
import {GAME_CSS} from './utils/theme';
import {
  BrandMark,
  IconArrowRight,
  IconClose,
  IconHelp,
  IconMusic,
  IconPause,
  IconPlay,
  IconRestart,
  IconSound,
  IconStar,
  SpecimenStrip,
  Squiggle,
  TokenIcon,
} from './ui';
import BackgroundMusic from './utils/BackgroundMusic';
import {
  createFixedStepper,
  gameAudio,
  GameState,
  MenuOverlay,
  prepareCanvas,
  useInput,
  useIsMobile,
} from './utils/helper';
import {
  usePlayground,
  usePlaygroundGameLifecycle,
  usePlaygroundResume,
  useRpc,
} from './utils/usePlayground';
import {
  drawBlob,
  drawPaperCard,
  drawSparkle,
  drawStar,
  drawStitches,
  drawSymbolGlyph,
  drawTape,
  drawTrackedText,
  fitDisplayText,
  FONT,
  getPaperBackdrop,
  irregularCircle,
  PALETTE,
  splitLines,
  TOKEN_INK,
  tracePoints,
  withAlpha,
} from './utils/art';

const BACKGROUND_MUSIC_URL = 'assets/audio/bgm_button_museum.mp3';

interface CustomWindow extends Window {
  canHandleBackKey?: boolean;
}

// Button color IDs
export type ButtonColor = 'red' | 'blue' | 'yellow' | 'green';
type GlyphShape = 'circle' | 'diamond' | 'star' | 'square';

export interface ButtonDefinition {
  id: ButtonColor;
  name: string;
  glyph: GlyphShape;
  shapeName: string;
  keys: string[];
  keyHint: string;
  x: number;
  y: number;
  radius: number;
  rotation: number;
  seed: number;
  specimen: string;
}

// Directive categories
export type DirectiveType =
  | 'DIRECT'
  | 'SYMBOL'
  | 'NEGATIVE'
  | 'STROOP_WORD'
  | 'STROOP_INK'
  | 'RULE_SHIFT'
  | 'HISTORY'
  | 'WAIT'
  | 'POSITION';

export interface Directive {
  type: DirectiveType;
  tag: string;
  mainText: string;
  subText?: string;
  textColor?: string;
  highlightColor?: string;
  validColors: ButtonColor[];
  isWait: boolean;
  explanation: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  spin: number;
  shape: 'dot' | 'fleck' | 'star';
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface ScorePopup {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
}

interface FailureDiagnostic {
  promptText: string;
  playerAction: string;
  expectedAction: string;
  ruleTag: string;
}

interface StageLayout {
  width: number;
  height: number;
  radius: number;
  cardWidth: number;
  cardHeight: number;
  promptMax: number;
  promptMin: number;
  labelScale: number;
  buttons: Record<ButtonColor, {x: number; y: number; rotation: number}>;
}

const LANDSCAPE_LAYOUT: StageLayout = {
  width: 1376,
  height: 768,
  radius: 96,
  cardWidth: 550,
  cardHeight: 304,
  promptMax: 48,
  promptMin: 28,
  labelScale: 1,
  buttons: {
    red: {x: 260, y: 214, rotation: -0.03},
    blue: {x: 1116, y: 214, rotation: 0.025},
    yellow: {x: 260, y: 554, rotation: 0.022},
    green: {x: 1116, y: 554, rotation: -0.026},
  },
};

const PORTRAIT_LAYOUT: StageLayout = {
  width: 760,
  height: 1280,
  radius: 86,
  cardWidth: 620,
  cardHeight: 404,
  promptMax: 58,
  promptMin: 34,
  labelScale: 1.12,
  buttons: {
    red: {x: 190, y: 204, rotation: -0.03},
    blue: {x: 570, y: 204, rotation: 0.025},
    yellow: {x: 190, y: 1076, rotation: 0.022},
    green: {x: 570, y: 1076, rotation: -0.026},
  },
};

const BUTTON_META: Array<{
  id: ButtonColor;
  name: string;
  glyph: GlyphShape;
  shapeName: string;
  keys: string[];
  keyHint: string;
  specimen: string;
}> = [
  {
    id: 'red',
    name: 'RED',
    glyph: 'circle',
    shapeName: 'CIRCLE',
    keys: ['1', 'q', 'Q', 'ArrowLeft'],
    keyHint: '1 · Q · ←',
    specimen: 'No. 01',
  },
  {
    id: 'blue',
    name: 'BLUE',
    glyph: 'diamond',
    shapeName: 'DIAMOND',
    keys: ['2', 'w', 'W', 'ArrowUp'],
    keyHint: '2 · W · ↑',
    specimen: 'No. 02',
  },
  {
    id: 'yellow',
    name: 'YELLOW',
    glyph: 'star',
    shapeName: 'STAR',
    keys: ['3', 'e', 'E', 'ArrowDown'],
    keyHint: '3 · E · ↓',
    specimen: 'No. 03',
  },
  {
    id: 'green',
    name: 'GREEN',
    glyph: 'square',
    shapeName: 'SQUARE',
    keys: ['4', 'r', 'R', 'ArrowRight'],
    keyHint: '4 · R · →',
    specimen: 'No. 04',
  },
];

function usePortraitStage(): boolean {
  const [portrait, setPortrait] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerHeight > window.innerWidth * 1.08 && window.innerWidth < 1024;
  });
  useEffect(() => {
    const update = () => {
      setPortrait(
        window.innerHeight > window.innerWidth * 1.08 && window.innerWidth < 1024,
      );
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  return portrait;
}

function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        if (typeof document !== 'undefined' && document.fonts) {
          await Promise.all([
            document.fonts.load('800 48px "Fraunces"'),
            document.fonts.load('italic 800 48px "Fraunces"'),
            document.fonts.load('700 16px "Karla"'),
            document.fonts.load('600 20px "Caveat"'),
          ]);
          await document.fonts.ready;
        }
      } catch {
        // The fallback stacks still give the print-shop silhouette.
      }
      if (alive) setReady(true);
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

function drawRuleIcon(
  ctx: CanvasRenderingContext2D,
  type: DirectiveType,
  x: number,
  y: number,
  size: number,
  color: string,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 12, size / 12);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'DIRECT') {
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.quadraticCurveTo(0, -0.4, 5, 0);
    ctx.moveTo(2.5, -3.2);
    ctx.lineTo(5.4, 0);
    ctx.lineTo(2.5, 3.2);
    ctx.stroke();
  } else if (type === 'SYMBOL' || type === 'POSITION') {
    drawStar(ctx, 0, 0, 5.3, 2.3, color, -Math.PI / 2, 0.25, 3);
  } else if (type === 'NEGATIVE') {
    ctx.beginPath();
    ctx.arc(0, 0, 4.7, 0, Math.PI * 2);
    ctx.moveTo(-3.3, 3.3);
    ctx.lineTo(3.3, -3.3);
    ctx.stroke();
  } else if (type === 'WAIT') {
    ctx.beginPath();
    ctx.moveTo(-2.6, -4.5);
    ctx.lineTo(-2.6, 4.5);
    ctx.moveTo(2.6, -4.5);
    ctx.lineTo(2.6, 4.5);
    ctx.stroke();
  } else if (type === 'STROOP_WORD') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.1, 3.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 1.65, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'STROOP_INK') {
    ctx.beginPath();
    ctx.moveTo(0, -5.2);
    ctx.bezierCurveTo(1.5, -1.5, 3.8, 0.3, 3.8, 2);
    ctx.bezierCurveTo(3.8, 4.2, 2.1, 5.4, 0, 5.4);
    ctx.bezierCurveTo(-2.1, 5.4, -3.8, 4.2, -3.8, 2);
    ctx.bezierCurveTo(-3.8, 0.3, -1.5, -1.5, 0, -5.2);
    ctx.fill();
  } else if (type === 'RULE_SHIFT') {
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, -2.5, 1.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1.8, -5.1);
    ctx.lineTo(4.8, -4.1);
    ctx.lineTo(3.5, -1.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0.65, 4.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1.8, 5.1);
    ctx.lineTo(-4.8, 4.1);
    ctx.lineTo(-3.5, 1.4);
    ctx.stroke();
  } else if (type === 'HISTORY') {
    ctx.beginPath();
    ctx.arc(0, 0.2, 4.2, -2.9, 2.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-4.9, -3.4);
    ctx.lineTo(-4.1, -0.3);
    ctx.lineTo(-1.2, -1.3);
    ctx.stroke();
  }
  ctx.restore();
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stepperRef = useRef<ReturnType<typeof createFixedStepper> | null>(null);
  const lastCancelRef = useRef(false);
  const lastActionTimestampRef = useRef(0);
  const shakeEndTimeRef = useRef(0);

  // Playground SDK integration
  const {sdk, isReady} = usePlayground();
  const [exitChat] = useRpc<Record<string, unknown>, void>('ExitChat');

  const isPortrait = usePortraitStage();
  const isMobile = useIsMobile();
  const fontsReady = useFontsReady();
  const layout = isPortrait ? PORTRAIT_LAYOUT : LANDSCAPE_LAYOUT;
  const canvasWidth = layout.width;
  const canvasHeight = layout.height;

  const BUTTONS = useMemo(() => {
    const result = {} as Record<ButtonColor, ButtonDefinition>;
    BUTTON_META.forEach((meta) => {
      const position = layout.buttons[meta.id];
      result[meta.id] = {
        ...meta,
        x: position.x,
        y: position.y,
        radius: layout.radius,
        rotation: position.rotation,
        seed: 7 + meta.id.length * 11,
      };
    });
    return result;
  }, [layout]);

  if (!stepperRef.current) {
    const stepMs = getConfig('stepMs') as number;
    const maxSubSteps = getConfig('maxSubSteps') as number;
    stepperRef.current = createFixedStepper(stepMs, maxSubSteps);
  }

  // Do not remove: Playground save/resume
  const {initialLevel, initialScore, persistenceEnabled, autoStartPending} =
    usePlaygroundResume({
      isReady,
      assetsReady: fontsReady,
      onAutoStart: () => {
        if (gameStateRef.current.status === 'START') {
          initGame();
        }
      },
    });

  const startLevel = initialLevel;
  const startScore = initialScore;
  const levelStartScoreRef = useRef(startScore);
  const prevLevelRef = useRef(startLevel);
  const runWonRef = useRef(false);

  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: startScore,
    level: startLevel,
  });

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // UI overlays and settings
  const [isGameMenuOpen, setIsGameMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [stageSize, setStageSize] = useState({width: 0, height: 0});
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('wrong_button_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [maxStreak, setMaxStreak] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('wrong_button_maxstreak') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [failureReport, setFailureReport] = useState<FailureDiagnostic | null>(null);

  // High-frequency simulation state
  const roundRef = useRef(1);
  const streakRef = useRef(0);
  const currentDirectiveRef = useRef<Directive | null>(null);
  const roundTimerRef = useRef(3.5);
  const roundMaxDurationRef = useRef(3.5);
  const lastCorrectColorRef = useRef<ButtonColor | null>(null);
  const screenShakeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const scorePopupsRef = useRef<ScorePopup[]>([]);
  const buttonPressScaleRef = useRef<Record<ButtonColor, number>>({
    red: 1,
    blue: 1,
    yellow: 1,
    green: 1,
  });
  const hoveredButtonRef = useRef<ButtonColor | null>(null);

  // Sync the level boundaries used by Playground save/resume.
  useEffect(() => {
    if (gameState.level !== prevLevelRef.current) {
      prevLevelRef.current = gameState.level;
      levelStartScoreRef.current = gameStateRef.current.score;
    }
  }, [gameState.level]);

  useEffect(() => {
    if (gameState.status === 'VICTORY') {
      runWonRef.current = true;
    }
  }, [gameState.status]);

  useEffect(() => {
    const canHandleBackKey = gameState.status !== 'START';
    (window as CustomWindow).canHandleBackKey = canHandleBackKey;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'PLAYGROUND_CAN_HANDLE_BACK_KEY',
          value: canHandleBackKey,
        },
        '*',
      );
    }
  }, [gameState.status]);

  useEffect(() => {
    if (gameState.status === 'GAME_OVER') {
      gameAudio.playDefeatMotif();
      try {
        navigator.vibrate?.(70);
      } catch {}
    } else if (gameState.status === 'VICTORY') {
      gameAudio.playVictoryFanfare();
    }
  }, [gameState.status]);

  useEffect(() => {
    const volume = getConfig('defaultSfxVolume') as number;
    gameAudio.setVolume(Math.max(0, Math.min(1, volume)));
  }, []);

  // Fit the paper stage into the available space without distorting it.
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    const update = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      const scale = Math.min(rect.width / canvasWidth, rect.height / canvasHeight);
      const width = Math.max(1, Math.floor(canvasWidth * scale));
      const height = Math.max(1, Math.floor(canvasHeight * scale));
      setStageSize((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : {width, height},
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [canvasWidth, canvasHeight]);

  const inputRef = useInput(canvasRef, true, {
    width: canvasWidth,
    height: canvasHeight,
  });

  const musicVolume = Math.min(
    0.32,
    Math.max(0, (getConfig('defaultMusicVolume') as number) * 0.6),
  );

  const toggleAllAudio = useCallback(() => {
    const allMuted = isSfxMuted && isMusicMuted;
    const nextMuted = !allMuted;
    gameAudio.setMuted(nextMuted);
    setIsSfxMuted(nextMuted);
    setIsMusicMuted(nextMuted);
  }, [isSfxMuted, isMusicMuted]);

  // Directive generator: every prompt has exactly one unambiguous answer.
  const generateDirective = useCallback(
    (round: number): Directive => {
      const colors: ButtonColor[] = ['red', 'blue', 'yellow', 'green'];
      const chosenColor = colors[Math.floor(Math.random() * colors.length)];
      const chosenDef = BUTTONS[chosenColor];
      const chosenInk = TOKEN_INK[chosenColor];

      const candidates: DirectiveType[] = ['DIRECT', 'SYMBOL'];
      if (round >= 2) candidates.push('NEGATIVE', 'WAIT');
      if (round >= 3) candidates.push('STROOP_WORD', 'STROOP_INK');
      if (round >= 4) candidates.push('RULE_SHIFT');
      if (round >= 5 && lastCorrectColorRef.current) candidates.push('HISTORY');
      if (round >= 6) candidates.push('POSITION');

      const type = candidates[Math.floor(Math.random() * candidates.length)];

      switch (type) {
        case 'DIRECT': {
          const verbs = ['PRESS', 'TAP', 'GO FOR', 'PICK'];
          const verb = verbs[Math.floor(Math.random() * verbs.length)];
          return {
            type,
            tag: 'STRAIGHT UP',
            mainText: `${verb} ${chosenDef.name}`,
            subText: 'No tricks. Just press it.',
            highlightColor: chosenInk.text,
            validColors: [chosenColor],
            isWait: false,
            explanation: `Press the ${chosenInk.name} button.`,
          };
        }

        case 'SYMBOL': {
          const verbs = ['PRESS', 'FIND', 'TAP', 'HUNT DOWN'];
          const verb = verbs[Math.floor(Math.random() * verbs.length)];
          return {
            type,
            tag: 'SHAPE HUNT',
            mainText: `${verb} THE ${chosenDef.shapeName}`,
            subText: 'Match the shape, not the color.',
            highlightColor: chosenInk.text,
            validColors: [chosenColor],
            isWait: false,
            explanation: `Press the ${chosenDef.shapeName.toLowerCase()} (${chosenInk.name}).`,
          };
        }

        case 'NEGATIVE': {
          const avoidDef = BUTTONS[chosenColor];
          const avoidInk = TOKEN_INK[chosenColor];
          const prompts = [
            `DO NOT PRESS ${avoidDef.name}`,
            `NEVER TOUCH ${avoidDef.name}`,
            `ANY BUTTON EXCEPT ${avoidDef.name}`,
            `AVOID ${avoidDef.name}`,
          ];
          return {
            type,
            tag: 'REVERSE',
            mainText: prompts[Math.floor(Math.random() * prompts.length)],
            subText: 'Any other button will do.',
            highlightColor: PALETTE.redDeep,
            validColors: colors.filter((color) => color !== chosenColor),
            isWait: false,
            explanation: `Press any button except ${avoidInk.name}.`,
          };
        }

        case 'WAIT': {
          const prompts = [
            'DO NOTHING!',
            'HANDS OFF!',
            'DON’T TOUCH ANYTHING!',
            'LET IT RUN OUT.',
          ];
          return {
            type,
            tag: 'HANDS OFF',
            mainText: prompts[Math.floor(Math.random() * prompts.length)],
            subText: 'Let the thread run all the way out.',
            highlightColor: PALETTE.orangeDeep,
            validColors: [],
            isWait: true,
            explanation: 'Do nothing. Let the clock run down completely.',
          };
        }

        case 'STROOP_WORD': {
          const otherColors = colors.filter((color) => color !== chosenColor);
          const inkColor = otherColors[Math.floor(Math.random() * otherColors.length)];
          const inkDef = BUTTONS[inkColor];
          const inkInk = TOKEN_INK[inkColor];
          return {
            type,
            tag: 'READ THE WORD',
            mainText: chosenDef.name,
            subText: 'Read the word. Ignore the ink.',
            textColor: chosenInk.text,
            highlightColor: PALETTE.plumDeep,
            validColors: [chosenColor],
            isWait: false,
            explanation: `The word said ${chosenInk.name} (printed in ${inkInk.name}). Press ${chosenInk.name}.`,
          };
        }

        case 'STROOP_INK': {
          const otherColors = colors.filter((color) => color !== chosenColor);
          const wordColor = otherColors[Math.floor(Math.random() * otherColors.length)];
          const wordDef = BUTTONS[wordColor];
          const wordInk = TOKEN_INK[wordColor];
          return {
            type,
            tag: 'MATCH THE INK',
            mainText: wordDef.name,
            subText: 'Match the ink. Ignore the word.',
            textColor: chosenInk.text,
            highlightColor: PALETTE.blueDeep,
            validColors: [chosenColor],
            isWait: false,
            explanation: `The ink was ${chosenInk.name} (the word said ${wordInk.name}). Press ${chosenInk.name}.`,
          };
        }

        case 'RULE_SHIFT': {
          const otherColors = colors.filter((color) => color !== chosenColor);
          const aliasTarget = otherColors[Math.floor(Math.random() * otherColors.length)];
          const aliasInk = TOKEN_INK[aliasTarget];
          return {
            type,
            tag: 'NEW RULE',
            mainText: `${chosenDef.name} IS NOW ${aliasInk.name.toUpperCase()}!`,
            subText: 'The names have swapped for this round.',
            highlightColor: PALETTE.plumDeep,
            validColors: [aliasTarget],
            isWait: false,
            explanation: `${chosenInk.name} now means ${aliasInk.name}. Press ${aliasInk.name}.`,
          };
        }

        case 'HISTORY': {
          const previous = lastCorrectColorRef.current || 'red';
          const previousInk = TOKEN_INK[previous];
          return {
            type,
            tag: 'MEMORY',
            mainText: 'PRESS YOUR LAST COLOR!',
            subText: 'The last button you pressed.',
            highlightColor: PALETTE.greenDeep,
            validColors: [previous],
            isWait: false,
            explanation: `Your last button was ${previousInk.name}. Press ${previousInk.name}.`,
          };
        }

        case 'POSITION': {
          const sides: Record<ButtonColor, string> = {
            red: 'TOP-LEFT',
            blue: 'TOP-RIGHT',
            yellow: 'BOTTOM-LEFT',
            green: 'BOTTOM-RIGHT',
          };
          return {
            type,
            tag: 'COMPASS',
            mainText: `PRESS ${sides[chosenColor]}`,
            subText: 'Follow the compass.',
            highlightColor: PALETTE.blueDeep,
            validColors: [chosenColor],
            isWait: false,
            explanation: `Press the ${sides[chosenColor]} button (${chosenInk.name}).`,
          };
        }

        default:
          return {
            type: 'DIRECT',
            tag: 'STRAIGHT UP',
            mainText: `PRESS ${chosenDef.name}`,
            highlightColor: chosenInk.text,
            validColors: [chosenColor],
            isWait: false,
            explanation: `Press ${chosenInk.name}.`,
          };
      }
    },
    [BUTTONS],
  );

  const spawnSparks = useCallback(
    (x: number, y: number, color: string, count = 22) => {
      const accents = [color, color, PALETTE.cream, PALETTE.yellow, PALETTE.ink];
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 70 + Math.random() * 310;
        const shapeRoll = Math.random();
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 30,
          color: accents[Math.floor(Math.random() * accents.length)],
          size: 2.5 + Math.random() * 5.5,
          alpha: 1,
          life: 0,
          maxLife: 0.42 + Math.random() * 0.5,
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 10,
          shape: shapeRoll > 0.78 ? 'star' : shapeRoll > 0.46 ? 'fleck' : 'dot',
        });
      }
    },
    [],
  );

  const spawnShockwave = useCallback((x: number, y: number, color: string) => {
    shockwavesRef.current.push({
      x,
      y,
      radius: 46,
      maxRadius: 238,
      color,
      alpha: 0.8,
    });
  }, []);

  const startNextRound = useCallback(
    (isFirst = false) => {
      if (isFirst) {
        roundRef.current = 1;
        streakRef.current = 0;
        lastCorrectColorRef.current = null;
      } else {
        roundRef.current += 1;
      }

      const directive = generateDirective(roundRef.current);
      currentDirectiveRef.current = directive;

      const initialDuration = getConfig('initialRoundDuration') as number;
      const minDuration = getConfig('minRoundDuration') as number;
      const waitDuration = getConfig('waitRoundDuration') as number;

      let duration = initialDuration;
      if (directive.isWait) {
        duration = waitDuration;
      } else {
        const decay = Math.min(2.3, roundRef.current * 0.12);
        duration = Math.max(minDuration, initialDuration - decay);
      }

      roundTimerRef.current = duration;
      roundMaxDurationRef.current = duration;
    },
    [generateDirective],
  );

  const triggerGameOver = useCallback(
    (diagnostic: FailureDiagnostic) => {
      setFailureReport(diagnostic);
      screenShakeRef.current = 14;
      shakeEndTimeRef.current = performance.now() + 320;
      gameAudio.playErrorBuzz();

      window.setTimeout(() => {
        screenShakeRef.current = 0;
        shakeEndTimeRef.current = 0;
      }, 330);

      const finalScore = gameStateRef.current.score;
      const finalStreak = streakRef.current;
      if (finalScore > highScore) {
        setHighScore(finalScore);
        try {
          localStorage.setItem('wrong_button_highscore', finalScore.toString());
        } catch {}
      }
      if (finalStreak > maxStreak) {
        setMaxStreak(finalStreak);
        try {
          localStorage.setItem('wrong_button_maxstreak', finalStreak.toString());
        } catch {}
      }

      setGameState((prev) => ({...prev, status: 'GAME_OVER'}));
    },
    [highScore, maxStreak],
  );

  const handleButtonAction = useCallback(
    (pressedColor: ButtonColor) => {
      if (gameStateRef.current.status !== 'PLAYING') return;
      if (isGameMenuOpen || isHowToPlayOpen) return;

      const now = performance.now();
      if (now - lastActionTimestampRef.current < 55) return;
      lastActionTimestampRef.current = now;

      const directive = currentDirectiveRef.current;
      if (!directive) return;

      const pressedDef = BUTTONS[pressedColor];
      const pressedInk = TOKEN_INK[pressedColor];
      buttonPressScaleRef.current[pressedColor] = 0.86;

      if (directive.isWait) {
        triggerGameOver({
          promptText: directive.mainText,
          playerAction: `Pressed ${pressedInk.name}`,
          expectedAction: 'Do nothing — let the clock run out',
          ruleTag: directive.tag,
        });
        return;
      }

      const isCorrect = directive.validColors.includes(pressedColor);

      if (isCorrect) {
        streakRef.current += 1;
        const currentStreak = streakRef.current;
        const basePoints = getConfig('basePointsPerRound') as number;
        const timeBonusMultiplier = getConfig('timeBonusMultiplier') as number;
        const timeFraction = Math.max(
          0,
          roundTimerRef.current / roundMaxDurationRef.current,
        );
        const timeBonus = Math.floor(timeFraction * timeBonusMultiplier);
        const multiplier = Math.min(10, 1 + Math.floor(currentStreak / 3));
        const roundPoints = (basePoints + timeBonus) * multiplier;

        lastCorrectColorRef.current = pressedColor;

        gameAudio.playConfirmSelect();
        spawnSparks(pressedDef.x, pressedDef.y, pressedInk.fill, 26);
        spawnShockwave(pressedDef.x, pressedDef.y, pressedInk.fill);

        if (currentStreak % 5 === 0) {
          gameAudio.playLevelUpStinger();
          spawnSparks(canvasWidth / 2, canvasHeight / 2, PALETTE.yellow, 42);
          scorePopupsRef.current.push({
            x: canvasWidth / 2,
            y: canvasHeight / 2 - 118,
            text: `${currentStreak} IN A ROW!`,
            color: PALETTE.redDeep,
            alpha: 1,
            scale: 1,
          });
          try {
            navigator.vibrate?.([18, 30, 18]);
          } catch {}
        }

        scorePopupsRef.current.push({
          x: pressedDef.x,
          y: pressedDef.y - pressedDef.radius - 28,
          text: `+${roundPoints}  ×${multiplier}`,
          color: pressedInk.text,
          alpha: 1,
          scale: 1,
        });

        setGameState((prev) => ({
          ...prev,
          score: prev.score + roundPoints,
          level: 1 + Math.floor(currentStreak / 5),
        }));

        startNextRound(false);
      } else {
        triggerGameOver({
          promptText: directive.mainText,
          playerAction: `Pressed ${pressedInk.name}`,
          expectedAction: directive.explanation,
          ruleTag: directive.tag,
        });
      }
    },
    [
      BUTTONS,
      triggerGameOver,
      startNextRound,
      spawnSparks,
      spawnShockwave,
      canvasWidth,
      canvasHeight,
      isGameMenuOpen,
      isHowToPlayOpen,
    ],
  );

  const startRun = useCallback(
    (level: number, score: number) => {
      levelStartScoreRef.current = score;
      prevLevelRef.current = level;
      runWonRef.current = false;
      setIsGameMenuOpen(false);
      setIsHowToPlayOpen(false);
      setFailureReport(null);
      screenShakeRef.current = 0;
      shakeEndTimeRef.current = 0;

      particlesRef.current = [];
      shockwavesRef.current = [];
      scorePopupsRef.current = [];
      (Object.keys(buttonPressScaleRef.current) as ButtonColor[]).forEach((color) => {
        buttonPressScaleRef.current[color] = 1;
      });

      setGameState({status: 'PLAYING', level, score});
      startNextRound(true);
      gameAudio.resume();

      if (sdk) sdk.startGame();
    },
    [sdk, startNextRound],
  );

  const initGame = useCallback(() => {
    if (persistenceEnabled && !runWonRef.current) {
      startRun(gameStateRef.current.level, levelStartScoreRef.current);
    } else {
      startRun(1, 0);
    }
  }, [startRun, persistenceEnabled]);

  const resetGame = useCallback(() => {
    startRun(1, 0);
  }, [startRun]);

  const returnToTitle = useCallback(() => {
    setIsGameMenuOpen(false);
    setIsHowToPlayOpen(false);
    setFailureReport(null);
    setGameState((prev) => ({...prev, status: 'START'}));
  }, []);

  usePlaygroundGameLifecycle(gameState, sdk);

  // Optional auto-play query for capture tools.
  const hasAutoplayed = useRef(false);
  useEffect(() => {
    if (
      !hasAutoplayed.current &&
      new URLSearchParams(window.location.search).has('autoplay') &&
      fontsReady
    ) {
      hasAutoplayed.current = true;
      initGame();
    }
  }, [initGame, fontsReady]);

  const handleCanvasPointerPress = useCallback(
    (clientX: number, clientY: number) => {
      if (gameStateRef.current.status !== 'PLAYING') return;
      if (isGameMenuOpen || isHowToPlayOpen) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const px = (clientX - rect.left) * (canvasWidth / rect.width);
      const py = (clientY - rect.top) * (canvasHeight / rect.height);

      for (const color of ['red', 'blue', 'yellow', 'green'] as ButtonColor[]) {
        const button = BUTTONS[color];
        const distance = Math.hypot(px - button.x, py - button.y);
        if (distance <= button.radius * 1.32) {
          handleButtonAction(color);
          return;
        }
      }

      const cx = canvasWidth / 2;
      const cy = canvasHeight / 2;
      if (px < cx && py < cy) handleButtonAction('red');
      else if (px >= cx && py < cy) handleButtonAction('blue');
      else if (px < cx && py >= cy) handleButtonAction('yellow');
      else if (px >= cx && py >= cy) handleButtonAction('green');
    },
    [
      BUTTONS,
      canvasWidth,
      canvasHeight,
      handleButtonAction,
      isGameMenuOpen,
      isHowToPlayOpen,
    ],
  );

  const update = (deltaTime: number) => {
    if (screenShakeRef.current > 0) {
      screenShakeRef.current = Math.max(0, screenShakeRef.current - deltaTime * 48);
    }

    // Let tactile feedback finish even if the round has just ended.
    (Object.keys(buttonPressScaleRef.current) as ButtonColor[]).forEach((color) => {
      const scale = buttonPressScaleRef.current[color];
      if (scale < 1) {
        buttonPressScaleRef.current[color] = Math.min(1, scale + deltaTime * 4.2);
      }
    });

    for (let i = particlesRef.current.length - 1; i >= 0; i -= 1) {
      const particle = particlesRef.current[i];
      particle.life += deltaTime;
      if (particle.life >= particle.maxLife) {
        particlesRef.current.splice(i, 1);
        continue;
      }
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.vy += 150 * deltaTime;
      particle.vx *= 0.965;
      particle.vy *= 0.975;
      particle.rotation += particle.spin * deltaTime;
      particle.alpha = Math.max(0, 1 - particle.life / particle.maxLife);
    }

    for (let i = shockwavesRef.current.length - 1; i >= 0; i -= 1) {
      const wave = shockwavesRef.current[i];
      wave.radius += (wave.maxRadius - wave.radius) * deltaTime * 7.5;
      wave.alpha = Math.max(0, wave.alpha - deltaTime * 2);
      if (wave.alpha <= 0.01 || wave.radius >= wave.maxRadius - 5) {
        shockwavesRef.current.splice(i, 1);
      }
    }

    for (let i = scorePopupsRef.current.length - 1; i >= 0; i -= 1) {
      const popup = scorePopupsRef.current[i];
      popup.y -= 46 * deltaTime;
      popup.alpha -= deltaTime * 1.35;
      popup.scale = Math.min(1.2, popup.scale + deltaTime * 0.7);
      if (popup.alpha <= 0.02) scorePopupsRef.current.splice(i, 1);
    }

    if (gameState.status !== 'PLAYING') return;
    if (isGameMenuOpen || isHowToPlayOpen) return;

    if (roundTimerRef.current > 0) {
      roundTimerRef.current = Math.max(0, roundTimerRef.current - deltaTime);

      if (roundTimerRef.current === 0) {
        const directive = currentDirectiveRef.current;
        if (!directive) return;

        if (directive.isWait) {
          streakRef.current += 1;
          const currentStreak = streakRef.current;
          const basePoints = getConfig('basePointsPerRound') as number;
          const multiplier = Math.min(10, 1 + Math.floor(currentStreak / 3));
          const waitPoints = basePoints * 2 * multiplier;

          gameAudio.playCoinPickup();
          spawnSparks(canvasWidth / 2, canvasHeight / 2, PALETTE.green, 30);
          scorePopupsRef.current.push({
            x: canvasWidth / 2,
            y: canvasHeight / 2 - 118,
            text: `PATIENCE BONUS  +${waitPoints}`,
            color: PALETTE.greenDeep,
            alpha: 1,
            scale: 1.08,
          });

          setGameState((prev) => ({
            ...prev,
            score: prev.score + waitPoints,
            level: 1 + Math.floor(currentStreak / 5),
          }));

          startNextRound(false);
        } else {
          triggerGameOver({
            promptText: directive.mainText,
            playerAction: 'Out of time',
            expectedAction: directive.explanation,
            ruleTag: directive.tag,
          });
        }
      }
    }

    const input = inputRef.current;
    const px = input.pointer.x;
    const py = input.pointer.y;
    let hovered: ButtonColor | null = null;
    (Object.keys(BUTTONS) as ButtonColor[]).forEach((color) => {
      const button = BUTTONS[color];
      if (Math.hypot(px - button.x, py - button.y) <= button.radius + 12) {
        hovered = color;
      }
    });
    hoveredButtonRef.current = hovered;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameStateRef.current.status !== 'PLAYING') return;
      if (isGameMenuOpen || isHowToPlayOpen) return;

      const key = event.key;
      if (['p', 'P'].includes(key)) {
        event.preventDefault();
        setIsGameMenuOpen(true);
        return;
      }

      const matched = BUTTON_META.find((meta) => meta.keys.includes(key));
      if (matched) {
        event.preventDefault();
        handleButtonAction(matched.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButtonAction, isGameMenuOpen, isHowToPlayOpen]);

  const drawButton = (
    ctx: CanvasRenderingContext2D,
    button: ButtonDefinition,
    pressScale: number,
    hovered: boolean,
    now: number,
  ) => {
    const ink = TOKEN_INK[button.id];
    const radius = button.radius;
    const idlePulse = hovered ? 1 + Math.sin(now * 4.2) * 0.006 : 1;

    ctx.save();
    ctx.translate(button.x, button.y);

    // A wash of colour behind each specimen, like a screen-printed swatch.
    drawBlob(ctx, 0, 3, (radius + 45) * idlePulse, button.seed + 4, {
      fill: withAlpha(ink.tint, hovered ? 0.72 : 0.5),
      wobble: 4.4,
    });

    if (hovered) {
      ctx.save();
      ctx.rotate(now * 0.18);
      ctx.strokeStyle = withAlpha(ink.deep, 0.55);
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 10]);
      tracePoints(
        ctx,
        irregularCircle(0, 0, radius + 27, button.seed + 9, 2.7),
      );
      ctx.stroke();
      ctx.restore();
      drawSparkle(
        ctx,
        Math.cos(now * 1.3) * (radius + 37),
        Math.sin(now * 1.7) * (radius + 31),
        7,
        withAlpha(ink.deep, 0.6),
        now * 0.4,
      );
      drawSparkle(
        ctx,
        Math.cos(now * 1.1 + 2.4) * (radius + 32),
        Math.sin(now * 1.4 + 2.4) * (radius + 40),
        4.5,
        withAlpha(PALETTE.ink, 0.4),
        -now * 0.3,
      );
    }

    // Hard printed shadow.
    drawBlob(ctx, 5, 10, radius, button.seed + 2, {
      fill: 'rgba(46, 36, 25, 0.2)',
      wobble: 3.4,
    });

    ctx.save();
    ctx.scale(pressScale, pressScale);
    ctx.rotate(button.rotation);

    // Rim.
    drawBlob(ctx, 0, 0, radius, button.seed, {
      fill: ink.tint,
      stroke: PALETTE.ink,
      lineWidth: 4.2,
      wobble: 2.7,
    });

    // Painted face.
    drawBlob(ctx, 0, -2, radius - 9, button.seed + 1, {
      fill: ink.fill,
      stroke: ink.deep,
      lineWidth: 1.8,
      wobble: 2.5,
    });

    // Cross-hatching and a soft off-register highlight.
    ctx.save();
    tracePoints(ctx, irregularCircle(0, -2, radius - 10, button.seed + 1, 2.5));
    ctx.clip();
    ctx.strokeStyle = withAlpha(ink.deep, 0.25);
    ctx.lineWidth = 1.35;
    for (let line = -radius * 1.8; line < radius * 1.8; line += 11) {
      ctx.beginPath();
      ctx.moveTo(line, -radius);
      ctx.lineTo(line + radius * 1.4, radius);
      ctx.stroke();
    }
    ctx.strokeStyle = withAlpha(PALETTE.cream, 0.42);
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, -2, radius - 22, Math.PI * 1.1, Math.PI * 1.56);
    ctx.stroke();
    ctx.restore();

    // A ring of tiny stitches around the face.
    ctx.strokeStyle = withAlpha(PALETTE.cream, 0.46);
    ctx.lineWidth = 1.4;
    ctx.setLineDash([2, 10]);
    tracePoints(ctx, irregularCircle(0, -2, radius - 25, button.seed + 7, 1.6));
    ctx.stroke();
    ctx.setLineDash([]);

    // Cream inlay and the colour-blind shape.
    drawBlob(ctx, 0, -4, radius * 0.545, button.seed + 3, {
      fill: PALETTE.cream,
      stroke: PALETTE.ink,
      lineWidth: 3,
      wobble: 1.5,
    });
    drawSymbolGlyph(
      ctx,
      button.glyph,
      0,
      -4,
      radius * 0.5,
      ink.text,
    );

    // Two flecks of printer's ink.
    drawBlob(ctx, -radius * 0.52, radius * 0.45, 2.2, button.seed + 11, {
      fill: withAlpha(ink.deep, 0.35),
      wobble: 0.8,
    });
    drawBlob(ctx, radius * 0.61, -radius * 0.3, 1.6, button.seed + 12, {
      fill: withAlpha(PALETTE.cream, 0.4),
      wobble: 0.5,
    });

    ctx.restore();

    // Specimen caption and its little paper tag.
    drawTrackedText(
      ctx,
      `${button.specimen} · ${ink.name.toUpperCase()}`,
      0,
      -radius - 40,
      {
        font: `700 ${8.5 * layout.labelScale}px ${FONT.body}`,
        color: withAlpha(PALETTE.ink, 0.4),
        spacing: 2,
      },
    );

    const labelScale = layout.labelScale;
    ctx.save();
    ctx.translate(0, radius + 57);
    ctx.rotate(button.rotation * -0.75);
    drawPaperCard(
      ctx,
      -92 * labelScale,
      -29,
      184 * labelScale,
      58,
      button.seed + 5,
      {
        fill: PALETTE.paperLight,
        radius: 5,
        shadow: 4,
        lineWidth: 2.2,
        stitched: false,
      },
    );
    drawTrackedText(ctx, ink.name.toUpperCase(), 0, -10, {
      font: `800 ${20 * labelScale}px ${FONT.display}`,
      color: PALETTE.ink,
      spacing: 1.2 * labelScale,
    });
    drawTrackedText(ctx, button.keyHint, 0, 12, {
      font: `600 ${20 * labelScale}px ${FONT.hand}`,
      color: PALETTE.inkSoft,
      spacing: 0.5,
    });
    drawSparkle(
      ctx,
      -78 * labelScale,
      -14,
      3.4,
      withAlpha(ink.deep, 0.45),
      0.2,
    );
    drawSparkle(
      ctx,
      78 * labelScale,
      -14,
      3.4,
      withAlpha(ink.deep, 0.45),
      0.2,
    );
    ctx.restore();

    ctx.restore();
  };

  const drawPromptCard = (
    ctx: CanvasRenderingContext2D,
    directive: Directive | null,
    now: number,
  ) => {
    const width = layout.cardWidth;
    const height = layout.cardHeight;
    const isLive =
      gameState.status === 'PLAYING' && !isGameMenuOpen && !isHowToPlayOpen;
    const maxTime = roundMaxDurationRef.current;
    const currentTime = roundTimerRef.current;
    const progress = maxTime > 0 ? Math.max(0, Math.min(1, currentTime / maxTime)) : 0;
    const accent = directive?.highlightColor || PALETTE.inkSoft;
    const mainInk = directive?.textColor || PALETTE.ink;
    const timerColor = !isLive
      ? PALETTE.inkSoft
      : directive?.isWait
        ? PALETTE.orangeDeep
        : progress < 0.26
          ? PALETTE.redDeep
          : PALETTE.inkSoft;

    const tremble =
      isLive && progress < 0.26
        ? {
            x: Math.sin(now * 47) * (1 - progress / 0.26) * 1.8,
            y: Math.cos(now * 53) * (1 - progress / 0.26) * 1.2,
          }
        : {x: 0, y: 0};

    ctx.save();
    ctx.translate(canvasWidth / 2 + tremble.x, canvasHeight / 2 + tremble.y);
    ctx.rotate(-0.003);

    drawPaperCard(ctx, -width / 2, -height / 2, width, height, 31, {
      fill: PALETTE.paperLight,
      radius: 8,
      shadow: 11,
      lineWidth: 3,
      stitched: true,
      stitchColor: withAlpha(PALETTE.ink, 0.24),
    });

    // Torn strips of tape across the top corners.
    drawTape(
      ctx,
      -width / 2 + 66,
      -height / 2 + 1,
      100,
      27,
      -0.11,
      withAlpha(accent, 0.27),
      3,
    );
    drawTape(
      ctx,
      width / 2 - 66,
      -height / 2 + 1,
      100,
      27,
      0.09,
      withAlpha(accent, 0.22),
      7,
    );

    if (!directive) {
      ctx.fillStyle = PALETTE.inkSoft;
      ctx.font = `italic 700 ${height > 360 ? 44 : 38}px ${FONT.display}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Ready when you are.', 0, 4);
      drawTrackedText(ctx, 'THE BUTTON MUSEUM', 0, 72, {
        font: `700 10px ${FONT.body}`,
        color: withAlpha(PALETTE.ink, 0.42),
        spacing: 3,
      });
      ctx.restore();
      return;
    }

    // Rubber-stamp style rule tag.
    const tagFont = `800 ${height > 360 ? 11.5 : 11}px ${FONT.body}`;
    const tagSpacing = 1.8;
    ctx.save();
    ctx.font = tagFont;
    const tagText = directive.tag;
    const tagTextWidth =
      ctx.measureText(tagText).width + Math.max(0, tagText.length - 1) * tagSpacing;
    const tagWidth = tagTextWidth + 44;
    const tagHeight = height > 360 ? 31 : 28;
    const tagX = -width / 2 + 30;
    const tagY = -height / 2 + 21;
    ctx.translate(tagX, tagY);
    ctx.rotate(-0.03);
    ctx.beginPath();
    ctx.roundRect(0, 0, tagWidth, tagHeight, 4);
    ctx.fillStyle = withAlpha(accent, 0.14);
    ctx.fill();
    ctx.strokeStyle = withAlpha(accent, 0.9);
    ctx.lineWidth = 2;
    ctx.stroke();
    drawRuleIcon(ctx, directive.type, 14, tagHeight / 2 + 0.5, 12, accent);
    drawTrackedText(ctx, tagText, 25, tagHeight / 2 + 0.5, {
      font: tagFont,
      color: accent,
      spacing: tagSpacing,
      align: 'left',
    });
    ctx.restore();

    // Tiny hand-drawn clock and numeric timer.
    const clockX = width / 2 - 182;
    const clockY = -height / 2 + 37;
    ctx.save();
    ctx.translate(clockX, clockY);
    drawBlob(ctx, 0, 0, 12.5, 44, {
      fill: withAlpha(PALETTE.cream, 0.6),
      stroke: withAlpha(PALETTE.ink, 0.55),
      lineWidth: 1.5,
      wobble: 0.8,
    });
    ctx.strokeStyle = withAlpha(PALETTE.ink, 0.5);
    ctx.lineWidth = 1.2;
    for (let tick = 0; tick < 12; tick += 1) {
      const angle = (tick / 12) * Math.PI * 2;
      const inner = tick % 3 === 0 ? 7.3 : 8.7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * 10.4, Math.sin(angle) * 10.4);
      ctx.stroke();
    }
    // Remaining-time wedge.
    ctx.fillStyle = withAlpha(timerColor, 0.18);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = timerColor;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.cos(-Math.PI / 2 + Math.PI * 2 * progress) * 8.2,
      Math.sin(-Math.PI / 2 + Math.PI * 2 * progress) * 8.2,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.ink;
    ctx.fill();
    ctx.restore();

    ctx.font = `800 ${height > 360 ? 22 : 19}px ${FONT.body}`;
    ctx.fillStyle = timerColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${currentTime.toFixed(1)}s`, clockX + 22, clockY + 1);
    drawTrackedText(ctx, 'ON THE CLOCK', clockX + 22, clockY + 16, {
      font: `700 7.5px ${FONT.body}`,
      color: withAlpha(PALETTE.ink, 0.38),
      spacing: 1.6,
      align: 'left',
    });

    // Main instruction.
    const fitted = fitDisplayText(ctx, directive.mainText, width - 105, {
      maxSize: layout.promptMax,
      minSize: layout.promptMin,
      maxLines: 2,
      weight: 900,
    });
    const mainFont = `900 ${fitted.fontSize}px ${FONT.display}`;
    const lineHeight = fitted.lineHeight;
    const totalHeight = fitted.lines.length * lineHeight;
    const mainCenter = -height * 0.025;
    const firstLineY = mainCenter - totalHeight / 2 + lineHeight / 2;

    ctx.font = mainFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    fitted.lines.forEach((line, index) => {
      const lineY = firstLineY + index * lineHeight;
      // Slightly mis-registered underprint, like a two-pass letterpress.
      ctx.fillStyle = withAlpha(accent, 0.22);
      ctx.fillText(line, -1.6, lineY + 1.2);
      ctx.fillStyle = mainInk;
      ctx.fillText(line, 0, lineY);
    });

    // Subtitle / nudge.
    const subSize = height > 360 ? 16 : 15;
    const subLines = directive.subText
      ? splitLines(
          ctx,
          directive.subText,
          width - 130,
          `600 ${subSize}px ${FONT.body}`,
        ).slice(0, 2)
      : [];
    const mainBottom =
      firstLineY + (fitted.lines.length - 1) * lineHeight + lineHeight / 2;
    const subTop = Math.min(height / 2 - 92, mainBottom + 26);
    ctx.font = `600 ${subSize}px ${FONT.body}`;
    ctx.fillStyle = PALETTE.inkSoft;
    ctx.textAlign = 'center';
    subLines.forEach((line, index) => {
      ctx.fillText(line, 0, subTop + index * (subSize + 4));
    });

    // The thread timer.
    const barY = height / 2 - 42;
    const barLeft = -width / 2 + 34;
    const barRight = width / 2 - 34;
    const stitchCount = height > 360 ? 26 : 22;
    drawStitches(
      ctx,
      barLeft,
      barY,
      barRight,
      barY,
      stitchCount,
      withAlpha(PALETTE.ink, 0.13),
      5.2,
      6,
    );
    if (progress > 0.002) {
      const activeCount = Math.max(1, Math.round(stitchCount * progress));
      drawStitches(
        ctx,
        barLeft,
        barY,
        barLeft + (barRight - barLeft) * progress,
        barY,
        activeCount,
        timerColor,
        isLive && progress < 0.26 ? 6.2 : 5.6,
        6,
      );
    }
    if (isLive && progress < 0.26) {
      drawSparkle(
        ctx,
        barLeft - 12,
        barY,
        5 + Math.sin(now * 12) * 1.5,
        withAlpha(PALETTE.redDeep, 0.65),
        0.1,
      );
      drawSparkle(
        ctx,
        barRight + 12,
        barY,
        5 + Math.cos(now * 12) * 1.5,
        withAlpha(PALETTE.redDeep, 0.65),
        0.1,
      );
    }

    drawTrackedText(
      ctx,
      `INSTRUCTION No. ${String(roundRef.current).padStart(3, '0')}`,
      -width / 2 + 34,
      height / 2 - 16,
      {
        font: `700 8px ${FONT.body}`,
        color: withAlpha(PALETTE.ink, 0.42),
        spacing: 1.8,
        align: 'left',
      },
    );
    drawTrackedText(
      ctx,
      directive.isWait ? 'LET THE THREAD RUN OUT' : 'PRESS BEFORE IT RUNS OUT',
      width / 2 - 34,
      height / 2 - 16,
      {
        font: `700 8px ${FONT.body}`,
        color: withAlpha(PALETTE.ink, 0.35),
        spacing: 1.5,
        align: 'right',
      },
    );

    ctx.restore();
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    prepareCanvas(ctx, canvasWidth, canvasHeight);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const rings = (Object.keys(BUTTONS) as ButtonColor[]).map(
      (color) =>
        [BUTTONS[color].x, BUTTONS[color].y, BUTTONS[color].radius + 42] as [
          number,
          number,
          number,
        ],
    );
    const backdrop = getPaperBackdrop(
      canvasWidth,
      canvasHeight,
      window.devicePixelRatio || 1,
      rings,
    );
    if (backdrop) {
      ctx.drawImage(backdrop, 0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = PALETTE.paper;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    const now = performance.now() / 1000;

    ctx.save();
    if (shakeEndTimeRef.current > performance.now() && screenShakeRef.current > 0) {
      const remaining = shakeEndTimeRef.current - performance.now();
      const magnitude = screenShakeRef.current * Math.max(0, remaining / 330);
      ctx.translate(
        (Math.random() - 0.5) * magnitude,
        (Math.random() - 0.5) * magnitude,
      );
    }

    // Ink ripples.
    shockwavesRef.current.forEach((wave) => {
      ctx.save();
      ctx.translate(wave.x, wave.y);
      ctx.rotate(now * 0.3);
      ctx.strokeStyle = withAlpha(wave.color, wave.alpha * 0.65);
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.setLineDash([11, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0, wave.radius), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([2, 10]);
      ctx.strokeStyle = withAlpha(PALETTE.ink, wave.alpha * 0.22);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0, wave.radius + 7), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });

    (Object.keys(BUTTONS) as ButtonColor[]).forEach((color) => {
      const button = BUTTONS[color];
      drawButton(
        ctx,
        button,
        buttonPressScaleRef.current[color],
        hoveredButtonRef.current === color &&
          gameState.status === 'PLAYING' &&
          !isGameMenuOpen &&
          !isHowToPlayOpen,
        now,
      );
    });

    drawPromptCard(ctx, currentDirectiveRef.current, now);

    // Loose ink flecks and confetti.
    particlesRef.current.forEach((particle) => {
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.globalAlpha = Math.max(0, particle.alpha);
      ctx.fillStyle = particle.color;
      if (particle.shape === 'star') {
        drawStar(
          ctx,
          0,
          0,
          particle.size * 1.4,
          particle.size * 0.6,
          particle.color,
          -Math.PI / 2,
          0.3,
          4,
        );
      } else if (particle.shape === 'fleck') {
        tracePoints(
          ctx,
          [
            {x: -particle.size, y: -particle.size * 0.35},
            {x: particle.size * 0.8, y: -particle.size * 0.6},
            {x: particle.size, y: particle.size * 0.4},
            {x: -particle.size * 0.7, y: particle.size * 0.55},
          ],
        );
        ctx.fill();
      } else {
        drawBlob(ctx, 0, 0, particle.size, particle.size * 7, {
          fill: particle.color,
          wobble: 0.8,
        });
      }
      ctx.restore();
    });

    // Floating scores in italic display type.
    scorePopupsRef.current.forEach((popup) => {
      ctx.save();
      ctx.translate(popup.x, popup.y);
      ctx.rotate(-0.02);
      ctx.scale(popup.scale, popup.scale);
      ctx.globalAlpha = Math.max(0, popup.alpha);
      ctx.font = `italic 800 31px ${FONT.display}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = PALETTE.paperLight;
      ctx.lineWidth = 7;
      ctx.strokeText(popup.text, 0, 0);
      ctx.fillStyle = popup.color;
      ctx.fillText(popup.text, 0, 0);
      ctx.restore();
    });

    ctx.restore();
  };

  const updateRef = useRef(update);
  const drawRef = useRef(draw);
  updateRef.current = update;
  drawRef.current = draw;

  useEffect(() => {
    let raf = 0;
    const loop = (time: number) => {
      if (inputRef.current) {
        const cancelPressed = inputRef.current.actions.cancel;
        if (cancelPressed && !lastCancelRef.current) {
          const status = gameStateRef.current.status;
          if (status === 'PLAYING') {
            setIsGameMenuOpen((previous) => !previous);
          } else if (status === 'START') {
            exitChat({}).catch(() => {});
          } else if (status === 'GAME_OVER' || status === 'VICTORY') {
            setGameState((previous) => ({...previous, status: 'START'}));
          }
        }
        lastCancelRef.current = cancelPressed;
      }

      stepperRef.current?.(time, (dt) => updateRef.current(dt));
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawRef.current(ctx);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [exitChat]);

  const isMusicPlaying =
    !['START', 'GAME_OVER', 'VICTORY'].includes(gameState.status) &&
    !isGameMenuOpen;

  const currentStreak = streakRef.current;
  const currentMultiplier = Math.min(10, 1 + Math.floor(currentStreak / 3));
  const failure = failureReport;
  const allMuted = isSfxMuted && isMusicMuted;

  return (
    <div className="wb-shell">
      <style>{GAME_CSS}</style>
      <BackgroundMusic
        url={BACKGROUND_MUSIC_URL}
        isPlaying={isMusicPlaying}
        isMuted={isMusicMuted}
        volume={musicVolume}
      />

      <header className="wb-header">
        <div className="wb-brand">
          <BrandMark className="wb-brand-mark" />
          <div>
            <div className="wb-wordmark">
              Wrong <em>Button</em>
            </div>
            <div className="wb-kicker">the button museum · est. today</div>
          </div>
        </div>

        <div className="wb-hud" aria-live="polite">
          <div className="wb-stat">
            <span className="wb-stat-label">Score</span>
            <span className="wb-stat-value">{gameState.score}</span>
          </div>
          <span className="wb-hud-rule" aria-hidden="true" />
          <div className="wb-stat">
            <span className="wb-stat-label">Streak</span>
            <span className="wb-stat-value">
              <IconStar className="wb-streak-star" size={13} />
              {currentStreak}
              <span className="wb-stat-mult">×{currentMultiplier}</span>
            </span>
          </div>
          <span className="wb-hud-rule" aria-hidden="true" />
          <div className="wb-stat">
            <span className="wb-stat-label">Round</span>
            <span className="wb-stat-value">{roundRef.current}</span>
          </div>
        </div>

        <div className="wb-controls">
          <button
            type="button"
            className={`wb-control${allMuted ? ' is-muted' : ''}`}
            onClick={toggleAllAudio}
            aria-label={allMuted ? 'Unmute sound and music' : 'Mute sound and music'}
            title={allMuted ? 'Unmute' : 'Mute'}>
            <IconSound muted={allMuted} size={18} />
          </button>
          <button
            type="button"
            className="wb-control wb-help-control"
            onClick={() => setIsHowToPlayOpen(true)}
            aria-label="How to play"
            title="How to play">
            <IconHelp size={18} />
          </button>
          {gameState.status === 'PLAYING' && (
            <button
              type="button"
              className="wb-control"
              onClick={() => setIsGameMenuOpen(true)}
              aria-label="Pause"
              title="Pause (P)">
              <IconPause size={18} />
            </button>
          )}
        </div>
      </header>

      <main className="wb-main">
        <div className="wb-stage" ref={stageRef}>
          <div
            className="wb-canvas-frame"
            style={{
              width: stageSize.width || undefined,
              height: stageSize.height || undefined,
              aspectRatio: `${canvasWidth} / ${canvasHeight}`,
            }}>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="wb-canvas"
              aria-label="Wrong Button game board — press the specimen the instruction calls for"
              onPointerDown={(event) =>
                handleCanvasPointerPress(event.clientX, event.clientY)
              }
            />
          </div>
        </div>
      </main>

      <footer className="wb-footer">
        <div className="wb-keys">
          <span className="wb-key-group">
            <kbd>1</kbd>
            <kbd>Q</kbd>
            <kbd>←</kbd> Red
          </span>
          <span className="wb-key-group">
            <kbd>2</kbd>
            <kbd>W</kbd>
            <kbd>↑</kbd> Blue
          </span>
          <span className="wb-key-group">
            <kbd>3</kbd>
            <kbd>E</kbd>
            <kbd>↓</kbd> Yellow
          </span>
          <span className="wb-key-group">
            <kbd>4</kbd>
            <kbd>R</kbd>
            <kbd>→</kbd> Green
          </span>
          <span className="wb-key-group">
            <kbd>P</kbd> Pause
          </span>
        </div>
        <span className="wb-foot-note">read the label, mind the ink —</span>
        <div className="wb-records">
          <span className="wb-records-label">Records</span>
          <strong>Best {highScore}</strong>
          <i aria-hidden="true" />
          <span>Streak {maxStreak}</span>
        </div>
      </footer>

      {/* Title poster */}
      {gameState.status === 'START' && (
        <MenuOverlay tone="neutral">
          <div className="wb-poster">
            <span className="wb-tape wb-tape-left" aria-hidden="true" />
            <span className="wb-tape wb-tape-right" aria-hidden="true" />
            <p className="wb-eyebrow">Welcome to the Button Museum</p>
            <h1>
              Wrong <em>Button</em>
            </h1>
            <Squiggle className="wb-title-squiggle" />
            <p className="wb-tagline">
              <strong>Four buttons. One instruction. No mercy.</strong> Read
              the label, mind the ink, and press the right specimen before the
              thread runs out.
            </p>
            <SpecimenStrip buttons={BUTTON_META} />
            <div className="wb-actions">
              <button
                type="button"
                data-testid="start-button"
                className="wb-btn wb-btn-primary"
                onClick={initGame}>
                <IconPlay size={17} />
                Start the tour
                <IconArrowRight size={17} />
              </button>
              <button
                type="button"
                className="wb-btn wb-btn-blue"
                onClick={() => setIsHowToPlayOpen(true)}>
                <IconHelp size={17} />
                How to play
              </button>
            </div>
            {highScore > 0 || maxStreak > 0 ? (
              <div className="wb-records-strip">
                <span>
                  Best score <strong>{highScore}</strong>
                </span>
                <span>
                  Longest streak <strong>{maxStreak}</strong>
                </span>
              </div>
            ) : (
              <p className="wb-quiet-record">
                No visitors yet — be the first name in the ledger.
              </p>
            )}
            <p className="wb-footnote">
              Hands off when it says hands off. That one counts.
            </p>
          </div>
        </MenuOverlay>
      )}

      {/* Game-over diagnostic */}
      {gameState.status === 'GAME_OVER' && (
        <MenuOverlay tone="danger">
          <div className="wb-poster wb-poster-narrow">
            <span className="wb-tape wb-tape-left" aria-hidden="true" />
            <span className="wb-tape wb-tape-right" aria-hidden="true" />
            <span className="wb-wrong-stamp">Wrong button</span>
            <p className="wb-eyebrow">Exhibit closed early</p>
            <h1>
              Wrong <em>button!</em>
            </h1>
            {failure && (
              <div className="wb-diagnostic">
                <div className="wb-diagnostic-head">
                  <span className="wb-diagnostic-title">What the label said</span>
                  <span className="wb-rule-tag">{failure.ruleTag}</span>
                </div>
                <p className="wb-prompt-quote">“{failure.promptText}”</p>
                <div className="wb-diagnostic-grid">
                  <div className="wb-diagnostic-cell">
                    <span>You pressed</span>
                    <strong>{failure.playerAction}</strong>
                  </div>
                  <div className="wb-diagnostic-cell is-right">
                    <span>The label meant</span>
                    <strong>{failure.expectedAction}</strong>
                  </div>
                </div>
              </div>
            )}
            <div className="wb-score-strip">
              <div className="wb-score-cell">
                <span>Score</span>
                <strong>{gameState.score}</strong>
              </div>
              <div className="wb-score-cell is-best">
                <span>{gameState.score >= highScore && gameState.score > 0 ? 'New best' : 'Best'}</span>
                <strong>{highScore}</strong>
              </div>
              <div className="wb-score-cell is-streak">
                <span>Streak</span>
                <strong>{currentStreak}</strong>
              </div>
            </div>
            <p className="wb-curator-note">
              The curator has logged the mishap. The buttons forgive — the
              clock does not.
            </p>
            <div className="wb-actions">
              <button
                type="button"
                data-testid="start-button"
                className="wb-btn wb-btn-primary"
                onClick={resetGame}>
                <IconRestart size={17} />
                Try again
              </button>
              <button
                type="button"
                data-testid="menu-button"
                className="wb-btn wb-btn-quiet"
                onClick={returnToTitle}>
                Back to the lobby
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* Victory fallback */}
      {gameState.status === 'VICTORY' && (
        <MenuOverlay tone="victory">
          <div className="wb-poster wb-poster-narrow">
            <span className="wb-tape wb-tape-left" aria-hidden="true" />
            <span className="wb-tape wb-tape-right" aria-hidden="true" />
            <p className="wb-eyebrow">Full house</p>
            <h1>
              Every label <em>obeyed.</em>
            </h1>
            <p className="wb-tagline">
              <strong>A flawless tour.</strong> The specimens are impressed,
              and so is the curator.
            </p>
            <div className="wb-score-strip">
              <div className="wb-score-cell">
                <span>Score</span>
                <strong>{gameState.score}</strong>
              </div>
              <div className="wb-score-cell is-best">
                <span>Best</span>
                <strong>{highScore}</strong>
              </div>
              <div className="wb-score-cell is-streak">
                <span>Streak</span>
                <strong>{currentStreak}</strong>
              </div>
            </div>
            <div className="wb-actions">
              <button
                type="button"
                data-testid="start-button"
                className="wb-btn wb-btn-primary"
                onClick={resetGame}>
                <IconRestart size={17} />
                Tour again
              </button>
              <button
                type="button"
                data-testid="menu-button"
                className="wb-btn wb-btn-quiet"
                onClick={returnToTitle}>
                Back to the lobby
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* Pause sheet */}
      {isGameMenuOpen && gameState.status === 'PLAYING' && (
        <MenuOverlay tone="neutral">
          <div className="wb-poster wb-poster-narrow">
            <span className="wb-tape wb-tape-left" aria-hidden="true" />
            <span className="wb-tape wb-tape-right" aria-hidden="true" />
            <p className="wb-eyebrow">Intermission</p>
            <h1>
              Mid-tour <em>pause</em>
            </h1>
            <div className="wb-pause-stats">
              <div className="wb-pause-stat">
                <span>Score</span>
                <strong>{gameState.score}</strong>
              </div>
              <span className="wb-pause-rule" aria-hidden="true" />
              <div className="wb-pause-stat">
                <span>Streak</span>
                <strong>{currentStreak}</strong>
              </div>
              <span className="wb-pause-rule" aria-hidden="true" />
              <div className="wb-pause-stat">
                <span>Round</span>
                <strong>{roundRef.current}</strong>
              </div>
            </div>
            <div className="wb-menu-list">
              <button
                type="button"
                data-testid="start-button"
                className="wb-btn wb-btn-primary wb-btn-wide"
                onClick={() => setIsGameMenuOpen(false)}>
                <IconPlay size={17} />
                Resume the tour
              </button>
              <button
                type="button"
                className="wb-btn wb-btn-quiet wb-btn-wide"
                onClick={resetGame}>
                <IconRestart size={17} />
                Restart from the lobby
              </button>
              <div className="wb-sound-row">
                <button
                  type="button"
                  className={`wb-toggle${isMusicMuted ? ' is-muted' : ''}`}
                  onClick={() => setIsMusicMuted((value) => !value)}
                  aria-pressed={isMusicMuted}>
                  <IconMusic muted={isMusicMuted} size={16} />
                  Music {isMusicMuted ? 'off' : 'on'}
                </button>
                <button
                  type="button"
                  className={`wb-toggle${isSfxMuted ? ' is-muted' : ''}`}
                  onClick={() => {
                    const nextMuted = !isSfxMuted;
                    setIsSfxMuted(nextMuted);
                    gameAudio.setMuted(nextMuted);
                  }}
                  aria-pressed={isSfxMuted}>
                  <IconSound muted={isSfxMuted} size={16} />
                  Sound {isSfxMuted ? 'off' : 'on'}
                </button>
              </div>
              <button
                type="button"
                data-testid="menu-button"
                className="wb-btn wb-btn-quiet wb-btn-danger-quiet wb-btn-wide"
                onClick={returnToTitle}>
                Leave to the lobby
              </button>
            </div>
            <p className="wb-footnote">P or Esc returns you to the buttons.</p>
          </div>
        </MenuOverlay>
      )}

      {/* Rules poster */}
      {isHowToPlayOpen && (
        <MenuOverlay tone="neutral">
          <div className="wb-poster">
            <span className="wb-tape wb-tape-left" aria-hidden="true" />
            <span className="wb-tape wb-tape-right" aria-hidden="true" />
            <button
              type="button"
              className="wb-x"
              onClick={() => setIsHowToPlayOpen(false)}
              aria-label="Close house rules">
              <IconClose size={16} />
            </button>
            <p className="wb-eyebrow">House rules</p>
            <h1 className="wb-rules-title">
              How to <em>play</em>
            </h1>
            <div className="wb-rules-scroll">
              <section className="wb-rule-section">
                <span className="wb-rule-number">1</span>
                <div>
                  <h2>Read the label</h2>
                  <p>
                    Each card names exactly one specimen. Press it before the
                    thread runs out — faster presses earn a little more ink on
                    the score.
                  </p>
                  <div className="wb-rule-examples">
                    <span className="wb-rule-example">
                      <b>PRESS RED</b> → the red button
                    </span>
                    <span className="wb-rule-example">
                      <b>FIND THE STAR</b> → the yellow button
                    </span>
                  </div>
                </div>
              </section>
              <section className="wb-rule-section">
                <span className="wb-rule-number">2</span>
                <div>
                  <h2>Mind the ink</h2>
                  <p>
                    Sometimes the word and the colour disagree. The card tells
                    you which one to trust — the word or the ink. Trust the
                    one it names, never the other.
                  </p>
                  <div className="wb-rule-examples">
                    <span className="wb-rule-example">
                      <b>READ THE WORD</b> → press what it says
                    </span>
                    <span className="wb-rule-example">
                      <b>MATCH THE INK</b> → press what it looks like
                    </span>
                  </div>
                </div>
              </section>
              <section className="wb-rule-section">
                <span className="wb-rule-number">3</span>
                <div>
                  <h2>Hands off means hands off</h2>
                  <p>
                    When the card says do not touch, touch nothing. Let the
                    clock run all the way out for a patience bonus. Any press
                    ends the tour.
                  </p>
                  <div className="wb-rule-examples">
                    <span className="wb-rule-example">
                      <b>DO NOTHING!</b> → wait it out
                    </span>
                  </div>
                </div>
              </section>
              <section className="wb-rule-section">
                <span className="wb-rule-number">4</span>
                <div>
                  <h2>Watch for swaps &amp; memory</h2>
                  <p>
                    Names can swap for a round, and later cards may ask for the
                    last colour you pressed. The tag on the card — STRAIGHT
                    UP, REVERSE, MEMORY and friends — tells you the trick.
                  </p>
                  <div className="wb-rule-examples">
                    <span className="wb-rule-example">
                      <b>RED IS NOW BLUE!</b> → press blue
                    </span>
                    <span className="wb-rule-example">
                      <b>PRESS YOUR LAST COLOR!</b> → repeat it
                    </span>
                  </div>
                </div>
              </section>
              <section className="wb-rule-section">
                <span className="wb-rule-number">5</span>
                <div>
                  <h2>The specimens</h2>
                  <p>
                    Every button carries a shape as well as a colour, so the
                    tour never relies on colour alone. Tap, click, or use the
                    keys below.
                  </p>
                  <div className="wb-rule-tokens">
                    {BUTTON_META.map((button) => (
                      <span className="wb-rule-token" key={button.id}>
                        <TokenIcon
                          color={button.id}
                          glyph={button.glyph}
                          size={22}
                        />
                        {button.name}
                        <span>{button.keyHint}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
            <div className="wb-rules-footer">
              <button
                type="button"
                data-testid="start-button"
                className="wb-btn wb-btn-primary"
                onClick={() => {
                  setIsHowToPlayOpen(false);
                  setIsGameMenuOpen(false);
                  if (gameState.status === 'START') {
                    initGame();
                  }
                }}>
                <IconPlay size={17} />
                {gameState.status === 'START'
                  ? 'Start the tour'
                  : 'Back to the buttons'}
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* Font loading veil */}
      {!fontsReady && (
        <div className="wb-loader" aria-live="polite">
          <TokenIcon
            color="red"
            glyph="circle"
            size={56}
            className="wb-loader-mark"
          />
          <span className="wb-loader-line">Threading the buttons…</span>
        </div>
      )}
    </div>
  );
}
