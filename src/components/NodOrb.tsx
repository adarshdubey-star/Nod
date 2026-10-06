import { useEffect, useState, useCallback } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import type { OrbState, Command } from '../types';
import { SphereEye } from './NodOrbExpressions';

const ORB_SIZE = 88;

interface NodOrbProps {
  lastCommand: Command | null;
  isListening: boolean;
  gotoSlideNumber?: number;
}

function commandToOrbState(command: Command | null, isListening: boolean): OrbState {
  if (!command) {
    return isListening ? 'listening' : 'idle';
  }
  switch (command.type) {
    case 'next': return 'nextSlide';
    case 'previous': return 'prevSlide';
    case 'goto': return 'gotoSlide';
    case 'first': return 'gotoSlide';
    case 'last': return 'gotoSlide';
    case 'unknown': return 'confused';
    default: return 'idle';
  }
}

const orbVariants: Variants = {
  idle: {
    y: [0, -5, 0],
    scale: 1,
    x: 0,
    rotate: 0,
    transition: { y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' } },
  },
  listening: {
    y: [0, -4, 0],
    scale: 1.04,
    x: 0,
    rotate: 0,
    transition: {
      y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
      scale: { duration: 0.3 },
    },
  },
  nextSlide: {
    x: [0, 14, 0],
    scaleX: [1, 1.08, 1],
    scaleY: [1, 0.95, 1],
    rotate: [0, 2, 0],
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  prevSlide: {
    x: [0, -14, 0],
    scaleX: [1, 1.08, 1],
    scaleY: [1, 0.95, 1],
    rotate: [0, -2, 0],
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  gotoSlide: {
    y: [0, -12, 0],
    scale: [1, 1.07, 1],
    x: 0,
    rotate: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  confused: {
    rotate: [0, -5, 5, -3, 0],
    scale: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  sleeping: {
    y: 2,
    scale: 0.95,
    x: 0,
    rotate: 0,
    transition: { duration: 0.5 },
  },
  greeting: {
    rotate: [0, 360],
    scale: [1, 1.1, 1],
    x: 0,
    transition: { duration: 0.8, ease: 'easeInOut' },
  },
};

export default function NodOrb({ lastCommand, isListening, gotoSlideNumber }: NodOrbProps) {
  const [orbState, setOrbState] = useState<OrbState>('idle');

  const returnToBaseState = useCallback(() => {
    setOrbState(isListening ? 'listening' : 'idle');
  }, [isListening]);

  useEffect(() => {
    if (lastCommand) {
      const newState = commandToOrbState(lastCommand, isListening);
      setOrbState(newState);
      const timer = setTimeout(returnToBaseState, 600);
      return () => clearTimeout(timer);
    } else {
      setOrbState(isListening ? 'listening' : 'idle');
    }
  }, [lastCommand, isListening, returnToBaseState]);

  const isConfused = orbState === 'confused';
  const isSleeping = orbState === 'sleeping';

  const sphereBg = isConfused
    ? 'radial-gradient(circle at 40% 35%, #fef3c7 0%, #fde68a 15%, #fbbf24 35%, #f59e0b 55%, #d97706 80%, #92400e 100%)'
    : 'radial-gradient(circle at 40% 35%, #fef9c3 0%, #fde68a 15%, #fbbf24 35%, #f59e0b 55%, #d97706 80%, #92400e 100%)';

  const sphereShadow = isConfused
    ? '0 0 30px #f59e0b66, 0 0 60px #f59e0b22, inset 0 -10px 20px #78350faa'
    : isSleeping
    ? '0 0 15px #f59e0b22, inset 0 -10px 20px #92400eaa'
    : '0 0 30px #f59e0b55, 0 0 60px #fbbf2422, inset 0 -10px 20px #92400eaa';

  const glowColor = '#f59e0b';

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: ORB_SIZE + 28, height: ORB_SIZE + 28 }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: ORB_SIZE * 1.5,
          height: ORB_SIZE * 1.5,
          background: `radial-gradient(circle, ${glowColor}33 0%, ${glowColor}11 45%, transparent 70%)`,
          filter: 'blur(8px)',
        }}
        animate={{
          opacity: isSleeping ? 0.2 : [0.4, 0.7, 0.4],
          scale: isSleeping ? 0.8 : 1,
        }}
        transition={{
          opacity: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
          scale: { duration: 0.5 },
        }}
      />

      {/* Sonar rings when listening */}
      <AnimatePresence>
        {orbState === 'listening' && (
          <>
            <motion.div
              className="absolute rounded-full"
              style={{ width: ORB_SIZE, height: ORB_SIZE, border: `1.5px solid ${glowColor}44` }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute rounded-full"
              style={{ width: ORB_SIZE, height: ORB_SIZE, border: `1px solid ${glowColor}22` }}
              initial={{ scale: 1, opacity: 0.3 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut', delay: 0.7 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ===== THE SPHERE ===== */}
      <motion.div
        className="relative overflow-hidden rounded-full"
        style={{
          width: ORB_SIZE,
          height: ORB_SIZE,
          background: sphereBg,
          boxShadow: sphereShadow,
        }}
        variants={orbVariants}
        animate={orbState}
      >
        {/* Specular highlight — bright spot top-left like light on a ball */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: '15%',
            width: '35%',
            height: '20%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 100%)',
            borderRadius: '50%',
            filter: 'blur(4px)',
            opacity: isSleeping ? 0.3 : 1,
            transition: 'opacity 0.4s',
          }}
        />

        {/* Face — big, bold, emoji-style like MSG Sphere */}
        <SphereEye state={orbState} size={ORB_SIZE} />
      </motion.div>

      {/* Ground shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          width: ORB_SIZE * 0.5,
          height: 5,
          background: `radial-gradient(ellipse, ${glowColor}33 0%, transparent 70%)`,
          filter: 'blur(3px)',
          opacity: isSleeping ? 0.15 : 0.5,
          transition: 'opacity 0.4s',
        }}
      />

      {/* Flash ring on command */}
      <AnimatePresence>
        {(orbState === 'nextSlide' || orbState === 'prevSlide' || orbState === 'gotoSlide') && (
          <motion.div
            className="absolute rounded-full"
            style={{ width: ORB_SIZE, height: ORB_SIZE, border: '2px solid #38bdf8', boxShadow: '0 0 12px #38bdf866' }}
            initial={{ scale: 1, opacity: 0.9 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          />
        )}
      </AnimatePresence>

      {/* Goto badge */}
      <AnimatePresence>
        {orbState === 'gotoSlide' && gotoSlideNumber !== undefined && (
          <motion.span
            className="absolute flex items-center justify-center rounded-full text-xs font-bold shadow-lg"
            style={{ top: -2, right: -2, width: 24, height: 24, background: 'linear-gradient(135deg, #38bdf8, #6366f1)', color: '#fff' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2, ease: 'backOut' }}
          >
            {gotoSlideNumber + 1}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
