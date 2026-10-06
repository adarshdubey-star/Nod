import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { OrbState, Command } from '../types';

interface Props {
  lastCommand: Command | null;
  isListening: boolean;
  gotoSlideNumber?: number;
  size?: number;
  showBadge?: boolean;
}

function toState(cmd: Command | null, mic: boolean): OrbState {
  if (!cmd) return mic ? 'listening' : 'idle';
  switch (cmd.type) {
    case 'next': return 'nextSlide';
    case 'previous': return 'prevSlide';
    case 'goto':
    case 'first':
    case 'last': return 'gotoSlide';
    case 'unknown': return 'confused';
    default: return 'idle';
  }
}

/* ───────── face data per state ───────── */
interface Face {
  leftPupilX: number;
  rightPupilX: number;
  pupilY: number;
  eyeScaleL: number;
  eyeScaleR: number;
  leftBrowY: number;
  rightBrowY: number;
  leftBrowAngle: number;
  rightBrowAngle: number;
  showBrows: boolean;
  closed: boolean;
  mouth: 'smile' | 'smirk' | 'o' | 'flat' | 'wide' | 'yawn';
}

function face(s: OrbState): Face {
  const def: Face = {
    leftPupilX: 0, rightPupilX: 0, pupilY: 0,
    eyeScaleL: 1, eyeScaleR: 1,
    leftBrowY: 0, rightBrowY: 0,
    leftBrowAngle: 0, rightBrowAngle: 0,
    showBrows: true, closed: false, mouth: 'smile',
  };
  switch (s) {
    case 'idle': return def;
    case 'listening': return { ...def, eyeScaleL: 1.15, eyeScaleR: 1.15, leftBrowY: -2, rightBrowY: -2, mouth: 'o' };
    case 'nextSlide': return { ...def, leftPupilX: 5, rightPupilX: 5, leftBrowAngle: -12, rightBrowAngle: 4, leftBrowY: -3, mouth: 'smirk' };
    case 'prevSlide': return { ...def, leftPupilX: -5, rightPupilX: -5, leftBrowAngle: -4, rightBrowAngle: 12, rightBrowY: -3, mouth: 'smirk' };
    case 'gotoSlide': return { ...def, eyeScaleL: 1.2, eyeScaleR: 1.2, leftBrowY: -4, rightBrowY: -4, mouth: 'wide' };
    case 'confused': return { ...def, leftPupilX: 3, pupilY: -1, eyeScaleR: 0.85, leftBrowAngle: -15, rightBrowAngle: 12, leftBrowY: -4, rightBrowY: 1, mouth: 'flat' };
    case 'sleeping': return { ...def, closed: true, showBrows: false, mouth: 'yawn' };
    case 'greeting': return { ...def, eyeScaleL: 1.2, eyeScaleR: 1.2, leftBrowY: -5, rightBrowY: -5, mouth: 'wide' };
    default: return def;
  }
}

/* ───────── body motion ───────── */
function bodyMotion(s: OrbState) {
  switch (s) {
    case 'idle': return { y: [0, -6, 0], rotate: 0, x: 0, scale: 1, transition: { y: { repeat: Infinity, duration: 3, ease: 'easeInOut' as const } } };
    case 'listening': return { y: [0, -4, 0], scale: 1.03, rotate: 0, x: 0, transition: { y: { repeat: Infinity, duration: 1.8, ease: 'easeInOut' as const }, scale: { duration: 0.25 } } };
    case 'nextSlide': return { x: [0, 12, 0], rotate: [0, 5, 0], scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } };
    case 'prevSlide': return { x: [0, -12, 0], rotate: [0, -5, 0], scale: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } };
    case 'gotoSlide': return { y: [0, -16, 0], scale: [1, 1.08, 1], x: 0, rotate: 0, transition: { duration: 0.45 } };
    case 'confused': return { rotate: [0, -5, 5, -3, 0], scale: 1, x: 0, y: 0, transition: { duration: 0.5 } };
    case 'sleeping': return { y: 3, scale: 0.96, x: 0, rotate: 0, transition: { duration: 0.5 } };
    case 'greeting': return { y: [0, -14, 0], rotate: [0, -4, 4, 0], scale: [1, 1.08, 1], x: 0, transition: { duration: 0.7 } };
    default: return {};
  }
}

/* ───────── the component ───────── */
export default function DinoMascot({ lastCommand, isListening, gotoSlideNumber, size = 100, showBadge = true }: Props) {
  const [state, setState] = useState<OrbState>('idle');
  const base = useCallback(() => setState(isListening ? 'listening' : 'idle'), [isListening]);

  useEffect(() => {
    if (lastCommand) {
      setState(toState(lastCommand, isListening));
      const t = setTimeout(base, 700);
      return () => clearTimeout(t);
    }
    base();
  }, [lastCommand, isListening, base]);

  const f = face(state);
  const S = size;
  const half = S / 2;
  const eyeW = S * 0.14;
  const eyeH = S * 0.17;
  const gap = S * 0.18;
  const pupilR = S * 0.055;
  const browLen = S * 0.12;
  const eyeY = half - S * 0.02;
  const mouthY = half + S * 0.19;
  const browY = eyeY - eyeH - S * 0.03;
  const isSleeping = state === 'sleeping';

  return (
    <div className="relative flex items-center justify-center" style={{ width: S + 28, height: S + 28 }}>
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: S * 1.55, height: S * 1.55, background: 'radial-gradient(circle, #f59e0b30 0%, #f59e0b10 45%, transparent 65%)', filter: 'blur(10px)' }}
        animate={{ opacity: isSleeping ? 0.15 : [0.35, 0.65, 0.35], scale: isSleeping ? 0.75 : 1 }}
        transition={{ opacity: { repeat: Infinity, duration: 3, ease: 'easeInOut' }, scale: { duration: 0.5 } }}
      />

      {/* Sonar rings when listening */}
      <AnimatePresence>
        {state === 'listening' && (
          <>
            <motion.div className="absolute rounded-full" style={{ width: S, height: S, border: '1.5px solid #f59e0b44' }} initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 2.1, opacity: 0 }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }} />
            <motion.div className="absolute rounded-full" style={{ width: S, height: S, border: '1px solid #f59e0b22' }} initial={{ scale: 1, opacity: 0.3 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut', delay: 0.7 }} />
          </>
        )}
      </AnimatePresence>

      {/* ═══ THE SPHERE ═══ */}
      <motion.div
        className="relative overflow-hidden rounded-full"
        style={{
          width: S, height: S,
          background: 'radial-gradient(circle at 38% 32%, #fef9c3 0%, #fde68a 12%, #fbbf24 32%, #f59e0b 52%, #d97706 76%, #92400e 100%)',
          boxShadow: isSleeping
            ? '0 0 15px #f59e0b22, inset 0 -10px 22px #78350fbb'
            : '0 0 30px #f59e0b55, 0 0 60px #fbbf2422, 0 8px 28px #00000044, inset 0 -12px 24px #78350fbb, inset 0 6px 12px #fef3c744',
        }}
        animate={bodyMotion(state)}
      >
        {/* Specular highlight */}
        <div style={{ position: 'absolute', top: '7%', left: '14%', width: '38%', height: '22%', background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)', borderRadius: '50%', filter: 'blur(3px)', opacity: isSleeping ? 0.3 : 1, transition: 'opacity 0.4s' }} />
        <div style={{ position: 'absolute', top: '11%', left: '20%', width: '22%', height: '12%', background: 'rgba(255,255,255,0.4)', borderRadius: '50%', filter: 'blur(1px)', opacity: isSleeping ? 0.15 : 1, transition: 'opacity 0.4s' }} />

        {/* Rim light */}
        <div style={{ position: 'absolute', top: 2, left: '20%', width: '60%', height: 3, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)', borderRadius: '50%' }} />

        {/* Bottom shadow for 3D depth */}
        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 50% 115%, rgba(0,0,0,0.25) 0%, transparent 50%)' }} />

        {/* ═══ FACE ═══ */}
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} className="absolute inset-0">
          {/* LEFT EYE */}
          {f.closed ? (
            <path d={`M ${half - gap - eyeW} ${eyeY} Q ${half - gap} ${eyeY + eyeH * 0.45} ${half - gap + eyeW} ${eyeY}`} fill="none" stroke="#5d4037" strokeWidth={2.5} strokeLinecap="round" style={{ transition: 'all 0.3s' }} />
          ) : (
            <>
              <motion.ellipse cx={half - gap} cy={eyeY} fill="white" stroke="#e8d5b7" strokeWidth={0.5} animate={{ rx: eyeW * f.eyeScaleL, ry: eyeH * f.eyeScaleL }} transition={{ duration: 0.2 }} />
              <motion.circle cy={eyeY} r={pupilR} fill="#1a1a2e" animate={{ cx: half - gap + f.leftPupilX, cy: eyeY + f.pupilY }} transition={{ duration: 0.18 }} />
              <circle cx={half - gap + f.leftPupilX - pupilR * 0.5} cy={eyeY + f.pupilY - pupilR * 0.55} r={pupilR * 0.3} fill="white" />
            </>
          )}

          {/* RIGHT EYE */}
          {f.closed ? (
            <path d={`M ${half + gap - eyeW} ${eyeY} Q ${half + gap} ${eyeY + eyeH * 0.45} ${half + gap + eyeW} ${eyeY}`} fill="none" stroke="#5d4037" strokeWidth={2.5} strokeLinecap="round" style={{ transition: 'all 0.3s' }} />
          ) : (
            <>
              <motion.ellipse cx={half + gap} cy={eyeY} fill="white" stroke="#e8d5b7" strokeWidth={0.5} animate={{ rx: eyeW * f.eyeScaleR, ry: eyeH * f.eyeScaleR }} transition={{ duration: 0.2 }} />
              <motion.circle cy={eyeY} r={pupilR} fill="#1a1a2e" animate={{ cx: half + gap + f.rightPupilX, cy: eyeY + f.pupilY }} transition={{ duration: 0.18 }} />
              <circle cx={half + gap + f.rightPupilX - pupilR * 0.5} cy={eyeY + f.pupilY - pupilR * 0.55} r={pupilR * 0.3} fill="white" />
            </>
          )}

          {/* LEFT BROW */}
          {f.showBrows && (
            <motion.line x1={half - gap - browLen} x2={half - gap + browLen} stroke="#5d4037" strokeWidth={2.2} strokeLinecap="round" opacity={0.85} animate={{ y1: browY + f.leftBrowY + Math.sin(f.leftBrowAngle * Math.PI / 180) * browLen * 0.5, y2: browY + f.leftBrowY - Math.sin(f.leftBrowAngle * Math.PI / 180) * browLen * 0.5 }} transition={{ duration: 0.22 }} />
          )}

          {/* RIGHT BROW */}
          {f.showBrows && (
            <motion.line x1={half + gap - browLen} x2={half + gap + browLen} stroke="#5d4037" strokeWidth={2.2} strokeLinecap="round" opacity={0.85} animate={{ y1: browY + f.rightBrowY - Math.sin(f.rightBrowAngle * Math.PI / 180) * browLen * 0.5, y2: browY + f.rightBrowY + Math.sin(f.rightBrowAngle * Math.PI / 180) * browLen * 0.5 }} transition={{ duration: 0.22 }} />
          )}

          {/* MOUTH */}
          {f.mouth === 'smile' && <path d={`M ${half - S * 0.09} ${mouthY} Q ${half} ${mouthY + S * 0.07} ${half + S * 0.09} ${mouthY}`} fill="none" stroke="#5d4037" strokeWidth={2} strokeLinecap="round" />}
          {f.mouth === 'smirk' && <path d={`M ${half - S * 0.07} ${mouthY + 1} Q ${half + S * 0.02} ${mouthY + S * 0.055} ${half + S * 0.09} ${mouthY - 1}`} fill="none" stroke="#5d4037" strokeWidth={2} strokeLinecap="round" />}
          {f.mouth === 'o' && <ellipse cx={half} cy={mouthY + 1} rx={S * 0.04} ry={S * 0.045} fill="#5d4037" />}
          {f.mouth === 'yawn' && <ellipse cx={half} cy={mouthY + 2} rx={S * 0.06} ry={S * 0.065} fill="#5d4037" />}
          {f.mouth === 'flat' && <line x1={half - S * 0.07} y1={mouthY + 1} x2={half + S * 0.07} y2={mouthY + 1} stroke="#5d4037" strokeWidth={2} strokeLinecap="round" />}
          {f.mouth === 'wide' && <path d={`M ${half - S * 0.11} ${mouthY} Q ${half} ${mouthY + S * 0.1} ${half + S * 0.11} ${mouthY}`} fill="none" stroke="#5d4037" strokeWidth={2.2} strokeLinecap="round" />}

          {/* CONFUSED ? */}
          {state === 'confused' && <text x={half + S * 0.33} y={half - S * 0.22} fontSize={S * 0.2} fill="#78350f" fontWeight="bold" textAnchor="middle">?</text>}
        </svg>
      </motion.div>

      {/* Ground shadow */}
      <div style={{ position: 'absolute', bottom: 2, width: S * 0.5, height: 6, background: 'radial-gradient(ellipse, #92400e44 0%, transparent 70%)', filter: 'blur(3px)', opacity: isSleeping ? 0.15 : 0.5 }} />

      {/* Flash ring */}
      <AnimatePresence>
        {(state === 'nextSlide' || state === 'prevSlide' || state === 'gotoSlide') && (
          <motion.div className="absolute rounded-full" style={{ width: S, height: S, border: '2px solid #fbbf24', boxShadow: '0 0 14px #fbbf2488' }} initial={{ scale: 1, opacity: 0.85 }} animate={{ scale: 1.65, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
        )}
      </AnimatePresence>

      {/* Goto badge */}
      <AnimatePresence>
        {showBadge && state === 'gotoSlide' && gotoSlideNumber !== undefined && (
          <motion.span className="absolute flex items-center justify-center rounded-full text-xs font-bold shadow-lg" style={{ top: 0, right: 0, width: 24, height: 24, background: 'linear-gradient(135deg, #FDD835, #F9A825)', color: '#78350f' }} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            {gotoSlideNumber + 1}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
