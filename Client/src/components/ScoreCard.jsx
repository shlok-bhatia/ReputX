import React, { useEffect, useState } from 'react';
import { scoreToFraction, getTierFromScore } from '../utils/scoreUtils';

/**
 * Circular score ring with animated stroke and tier badge.
 * Props: score (0-1000), size (px), strokeWidth (px)
 */
export default function ScoreCard({ score = 0, size = 200, strokeWidth = 8 }) {
  const [animatedOffset, setAnimatedOffset] = useState(0);
  const tier = getTierFromScore(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const fraction = scoreToFraction(score);

  useEffect(() => {
    // Animate from 0 to target
    const timeout = setTimeout(() => {
      setAnimatedOffset(circumference * (1 - fraction));
    }, 100);
    return () => clearTimeout(timeout);
  }, [fraction, circumference]);

  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={String(animatedOffset || 0)}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="score-ring-center">
        <span className="score-ring-number">{score}</span>
        <span className="score-ring-max">/ 1000</span>
      </div>
    </div>
  );
}
