import React from 'react';
import {PALETTE, TOKEN_INK, type TokenColor} from './utils/art';

type GlyphShape = 'circle' | 'diamond' | 'star' | 'square';

/* -------------------------------------------------------------------------- */
/*  Hand-inked interface icons                                                */
/* -------------------------------------------------------------------------- */

interface IconProps {
  size?: number;
  className?: string;
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.1,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconSound({size = 18, className, muted = false}: IconProps & {muted?: boolean}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...strokeProps} d="M4.2 9.1h3.1l4.1-3.7v12.8l-4.1-3.5H4.2z" />
      {muted ? (
        <>
          <path {...strokeProps} d="M15.1 9.5l4.4 5.2M19.5 9.5l-4.4 5.2" />
        </>
      ) : (
        <>
          <path {...strokeProps} d="M15 8.6c1.5 1.7 1.5 5 0 6.8M18 6.4c2.7 3 2.7 8.2 0 11.2" />
        </>
      )}
    </svg>
  );
}

export function IconHelp({size = 18, className}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...strokeProps} d="M8.2 8.1c.3-2 1.8-3.4 3.9-3.4 2.3 0 3.9 1.4 3.9 3.3 0 1.7-1.1 2.7-2.9 3.5-1.2.5-1.7 1.1-1.7 2.2v.6" />
      <circle {...strokeProps} cx="11.4" cy="19.1" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function IconPause({size = 18, className}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...strokeProps} d="M8.4 6.2v11.6M15.6 6.2v11.6" />
    </svg>
  );
}

export function IconPlay({size = 18, className}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...strokeProps} d="M8.1 5.3l10.7 6.5-10.7 6.9z" />
    </svg>
  );
}

export function IconArrowRight({size = 18, className}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...strokeProps} d="M3.5 12.1c5.1-.4 9.4-.4 15.9-.3M14.7 6.7l5 5.1-5.2 5.1" />
    </svg>
  );
}

export function IconRestart({size = 18, className}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...strokeProps} d="M5.2 9.2c1.4-3.2 4.7-5.1 8.1-4.3 3.8.9 6.2 4.7 5.3 8.5-.9 3.9-4.7 6.3-8.6 5.4-2.6-.6-4.6-2.5-5.4-4.9" />
      <path {...strokeProps} d="M4.6 4.6l.4 4.9 4.8-.5" />
    </svg>
  );
}

export function IconClose({size = 17, className}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...strokeProps} d="M6.3 6.5l11.4 11.2M17.7 6.5L6.3 17.7" />
    </svg>
  );
}

export function IconStar({size = 14, className}: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        d="M12 2.6l2.6 5.9 6.4.7-4.8 4.3 1.3 6.3-5.5-3.2-5.5 3.2 1.3-6.3L3 9.2l6.4-.7z"
      />
    </svg>
  );
}

export function IconMusic({size = 17, className, muted = false}: IconProps & {muted?: boolean}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...strokeProps} d="M9.1 17.2V6.4l9-2v10.8" />
      <path {...strokeProps} d="M9.1 8.6l9-2" />
      <ellipse {...strokeProps} cx="6.7" cy="17.6" rx="2.5" ry="1.9" />
      <ellipse {...strokeProps} cx="15.7" cy="15.6" rx="2.5" ry="1.9" />
      {muted && <path {...strokeProps} d="M3.5 3.8l17 16.4" />}
    </svg>
  );
}

export function Squiggle({className}: {className?: string}) {
  return (
    <svg
      className={className}
      viewBox="0 0 330 12"
      preserveAspectRatio="none"
      aria-hidden="true">
      <path
        d="M3 7.4C28 2.6 46 8.9 71 6.7c22-1.9 39-5.1 61-2.1 23 3.2 42-2.1 66 .8 20 2.4 35-1 49 1.4 20 3.5 39-2.4 77-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  The four specimens                                                        */
/* -------------------------------------------------------------------------- */

export function TokenIcon({
  color,
  glyph,
  size = 54,
  className,
}: {
  color: TokenColor;
  glyph: GlyphShape;
  size?: number;
  className?: string;
}) {
  const ink = TOKEN_INK[color];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true">
      <circle cx="33" cy="34.5" r="25.5" fill="rgba(46,36,25,0.16)" />
      <circle
        cx="32"
        cy="30.5"
        r="25.5"
        fill={ink.tint}
        stroke={PALETTE.ink}
        strokeWidth="2.5"
      />
      <circle
        cx="32"
        cy="29.5"
        r="20.3"
        fill={ink.fill}
        stroke={ink.deep}
        strokeWidth="1.35"
      />
      <circle
        cx="32"
        cy="29.5"
        r="16.2"
        fill="none"
        stroke="rgba(255,249,233,0.48)"
        strokeWidth="1.2"
        strokeDasharray="2 5"
      />
      <path
        d="M17.6 21.6c3.7-5 9.1-7.2 13.4-7.1"
        fill="none"
        stroke="rgba(255,249,233,0.44)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle
        cx="32"
        cy="29.5"
        r="11.8"
        fill={PALETTE.cream}
        stroke={PALETTE.ink}
        strokeWidth="2.1"
      />
      {glyph === 'circle' && <circle cx="32" cy="29.5" r="6.2" fill={ink.text} />}
      {glyph === 'diamond' && (
        <path d="M32 22.3l7.1 7.2-7.1 7.2-7.1-7.2z" fill={ink.text} />
      )}
      {glyph === 'star' && (
        <path
          d="M32 21.6l2.5 5.3 5.8.7-4.3 4 1.1 5.8-5.1-2.8-5.1 2.8 1.1-5.8-4.3-4 5.8-.7z"
          fill={ink.text}
        />
      )}
      {glyph === 'square' && (
        <rect x="25.4" y="23" width="13.2" height="13.2" rx="2.4" fill={ink.text} />
      )}
    </svg>
  );
}

export function BrandMark({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 52 52" className={className} aria-hidden="true">
      <circle cx="27" cy="28" r="21" fill="rgba(46,36,25,0.16)" />
      <circle cx="25.5" cy="25.5" r="21" fill={PALETTE.redTint} stroke={PALETTE.ink} strokeWidth="2.4" />
      <circle cx="25.5" cy="25.5" r="16.7" fill={PALETTE.red} stroke={PALETTE.redDeep} strokeWidth="1.4" />
      <circle cx="25.5" cy="25.5" r="13.3" fill="none" stroke="rgba(255,249,233,0.45)" strokeWidth="1" strokeDasharray="1.6 4" />
      <circle cx="21" cy="21" r="2.1" fill={PALETTE.cream} />
      <circle cx="30" cy="21" r="2.1" fill={PALETTE.cream} />
      <circle cx="21" cy="30" r="2.1" fill={PALETTE.cream} />
      <circle cx="30" cy="30" r="2.1" fill={PALETTE.cream} />
      <path d="M21 21c5 4 7 8 9 9" fill="none" stroke={PALETTE.ink} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M30 21c-1 4-4 6-9 9" fill="none" stroke={PALETTE.cream} strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export function SpecimenStrip({
  buttons,
}: {
  buttons: Array<{id: TokenColor; glyph: GlyphShape; name: string; keyHint: string}>;
}) {
  return (
    <div className="wb-specimens">
      {buttons.map((button) => (
        <div className="wb-specimen" key={button.id}>
          <TokenIcon
            color={button.id}
            glyph={button.glyph}
            size={56}
            className="wb-specimen-mark"
          />
          <span className="wb-specimen-name">{button.name}</span>
          <span className="wb-specimen-key">{button.keyHint}</span>
        </div>
      ))}
    </div>
  );
}
