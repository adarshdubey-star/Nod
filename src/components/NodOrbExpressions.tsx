import type { OrbState } from '../types';
import { motion } from 'framer-motion';

interface SphereEyeProps {
  state: OrbState;
  size: number;
}

export function SphereEye({ state, size }: SphereEyeProps) {
  const cx = size / 2;
  const cy = size / 2;

  const eyeW = size * 0.17;
  const eyeH = size * 0.2;
  const pupilR = size * 0.07;
  const eyeGap = size * 0.22;
  const eyeY = cy - size * 0.02;
  const mouthY = cy + size * 0.22;
  const browY = eyeY - eyeH - size * 0.04;
  const browLen = size * 0.14;

  const look = getLook(state);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="absolute inset-0"
    >
      {/* LEFT EYE */}
      {look.eyesClosed ? (
        <motion.path
          d={`M ${cx - eyeGap - eyeW} ${eyeY} Q ${cx - eyeGap} ${eyeY + eyeH * 0.5} ${cx - eyeGap + eyeW} ${eyeY}`}
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        />
      ) : (
        <>
          <motion.ellipse
            cx={cx - eyeGap}
            cy={eyeY}
            fill="white"
            initial={false}
            animate={{ rx: eyeW * look.eyeScaleX, ry: eyeH * look.eyeScaleY }}
            transition={{ duration: 0.2 }}
          />
          <motion.circle
            cy={eyeY}
            r={pupilR}
            fill="#0f172a"
            initial={false}
            animate={{ cx: cx - eyeGap + look.pupilX, cy: eyeY + look.pupilY }}
            transition={{ duration: 0.18 }}
          />
          <circle
            cx={cx - eyeGap + look.pupilX - pupilR * 0.45}
            cy={eyeY + look.pupilY - pupilR * 0.5}
            r={pupilR * 0.3}
            fill="white"
          />
        </>
      )}

      {/* RIGHT EYE */}
      {look.eyesClosed ? (
        <motion.path
          d={`M ${cx + eyeGap - eyeW} ${eyeY} Q ${cx + eyeGap} ${eyeY + eyeH * 0.5} ${cx + eyeGap + eyeW} ${eyeY}`}
          fill="none"
          stroke="white"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        />
      ) : (
        <>
          <motion.ellipse
            cx={cx + eyeGap}
            cy={eyeY}
            fill="white"
            initial={false}
            animate={{ rx: eyeW * look.rightEyeScaleX, ry: eyeH * look.rightEyeScaleY }}
            transition={{ duration: 0.2 }}
          />
          <motion.circle
            cy={eyeY}
            r={pupilR}
            fill="#0f172a"
            initial={false}
            animate={{ cx: cx + eyeGap + look.pupilX, cy: eyeY + look.pupilY }}
            transition={{ duration: 0.18 }}
          />
          <circle
            cx={cx + eyeGap + look.pupilX - pupilR * 0.45}
            cy={eyeY + look.pupilY - pupilR * 0.5}
            r={pupilR * 0.3}
            fill="white"
          />
        </>
      )}

      {/* LEFT EYEBROW */}
      {look.showBrows && (
        <motion.line
          x1={cx - eyeGap - browLen}
          x2={cx - eyeGap + browLen}
          stroke="white"
          strokeWidth={2.2}
          strokeLinecap="round"
          opacity={0.9}
          initial={false}
          animate={{
            y1: browY + look.leftBrowInner,
            y2: browY + look.leftBrowOuter,
          }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* RIGHT EYEBROW */}
      {look.showBrows && (
        <motion.line
          x1={cx + eyeGap - browLen}
          x2={cx + eyeGap + browLen}
          stroke="white"
          strokeWidth={2.2}
          strokeLinecap="round"
          opacity={0.9}
          initial={false}
          animate={{
            y1: browY + look.rightBrowOuter,
            y2: browY + look.rightBrowInner,
          }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* MOUTH */}
      {look.mouthType === 'smile' && (
        <path
          d={`M ${cx - size * 0.1} ${mouthY} Q ${cx} ${mouthY + size * 0.08} ${cx + size * 0.1} ${mouthY}`}
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
      {look.mouthType === 'smirk' && (
        <path
          d={`M ${cx - size * 0.08} ${mouthY + 2} Q ${cx + size * 0.02} ${mouthY + size * 0.06} ${cx + size * 0.1} ${mouthY - 1}`}
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
      {look.mouthType === 'o' && (
        <ellipse
          cx={cx}
          cy={mouthY + 2}
          rx={size * 0.05}
          ry={size * 0.055}
          fill="white"
          opacity={0.85}
        />
      )}
      {look.mouthType === 'big-o' && (
        <ellipse
          cx={cx}
          cy={mouthY + 2}
          rx={size * 0.08}
          ry={size * 0.07}
          fill="white"
          opacity={0.85}
        />
      )}
      {look.mouthType === 'flat' && (
        <line
          x1={cx - size * 0.08}
          y1={mouthY + 2}
          x2={cx + size * 0.08}
          y2={mouthY + 2}
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
      {look.mouthType === 'wide' && (
        <path
          d={`M ${cx - size * 0.12} ${mouthY} Q ${cx} ${mouthY + size * 0.12} ${cx + size * 0.12} ${mouthY}`}
          fill="none"
          stroke="white"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      )}

      {/* CONFUSED ? */}
      {state === 'confused' && (
        <text
          x={cx + size * 0.34}
          y={cy - size * 0.2}
          fontSize={size * 0.22}
          fill="#fbbf24"
          fontWeight="bold"
          textAnchor="middle"
        >
          ?
        </text>
      )}
    </svg>
  );
}

interface Look {
  eyeScaleX: number;
  eyeScaleY: number;
  rightEyeScaleX: number;
  rightEyeScaleY: number;
  pupilX: number;
  pupilY: number;
  eyesClosed: boolean;
  showBrows: boolean;
  leftBrowInner: number;
  leftBrowOuter: number;
  rightBrowInner: number;
  rightBrowOuter: number;
  mouthType: 'smile' | 'smirk' | 'o' | 'big-o' | 'flat' | 'wide' | 'none';
}

function getLook(state: OrbState): Look {
  const base: Look = {
    eyeScaleX: 1, eyeScaleY: 1,
    rightEyeScaleX: 1, rightEyeScaleY: 1,
    pupilX: 0, pupilY: 0,
    eyesClosed: false, showBrows: true,
    leftBrowInner: 0, leftBrowOuter: 0,
    rightBrowInner: 0, rightBrowOuter: 0,
    mouthType: 'smile',
  };

  switch (state) {
    case 'idle':
      return { ...base, mouthType: 'smile' };

    case 'listening':
      return {
        ...base,
        eyeScaleX: 1.1, eyeScaleY: 1.15,
        rightEyeScaleX: 1.1, rightEyeScaleY: 1.15,
        leftBrowInner: -3, leftBrowOuter: -2,
        rightBrowInner: -3, rightBrowOuter: -2,
        mouthType: 'o',
      };

    case 'nextSlide':
      return {
        ...base,
        rightEyeScaleX: 0.95, rightEyeScaleY: 0.9,
        pupilX: 4, pupilY: 0,
        leftBrowInner: 2, leftBrowOuter: -4,
        rightBrowInner: 0, rightBrowOuter: 2,
        mouthType: 'smirk',
      };

    case 'prevSlide':
      return {
        ...base,
        eyeScaleX: 0.95, eyeScaleY: 0.9,
        pupilX: -4, pupilY: 0,
        leftBrowInner: 0, leftBrowOuter: 2,
        rightBrowInner: 2, rightBrowOuter: -4,
        mouthType: 'smirk',
      };

    case 'gotoSlide':
      return {
        ...base,
        eyeScaleX: 1.15, eyeScaleY: 1.2,
        rightEyeScaleX: 1.15, rightEyeScaleY: 1.2,
        pupilY: -1,
        leftBrowInner: -4, leftBrowOuter: -3,
        rightBrowInner: -4, rightBrowOuter: -3,
        mouthType: 'wide',
      };

    case 'confused':
      return {
        ...base,
        rightEyeScaleX: 0.85, rightEyeScaleY: 0.8,
        pupilX: 3, pupilY: -1,
        leftBrowInner: 3, leftBrowOuter: -5,
        rightBrowInner: -1, rightBrowOuter: 3,
        mouthType: 'flat',
      };

    case 'sleeping':
      return {
        ...base,
        eyesClosed: true,
        showBrows: false,
        mouthType: 'o',
      };

    case 'greeting':
      return {
        ...base,
        eyeScaleX: 1.15, eyeScaleY: 1.2,
        rightEyeScaleX: 1.15, rightEyeScaleY: 1.2,
        leftBrowInner: -5, leftBrowOuter: -4,
        rightBrowInner: -5, rightBrowOuter: -4,
        mouthType: 'wide',
      };

    default:
      return base;
  }
}
