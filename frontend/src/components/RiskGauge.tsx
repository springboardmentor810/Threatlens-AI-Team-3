'use client';

import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  classification?: string;
  size?: number;
}

export default function RiskGauge({ score, classification, size = 160 }: RiskGaugeProps) {
  const normalizedScore = Math.max(0, Math.min(100, score || 0));

  // Determine color based on risk score threshold
  const getColor = (s: number) => {
    if (s >= 75) return { stroke: '#e11d48', text: 'text-cyber-red', label: 'CRITICAL RISK', bg: 'bg-cyber-red/15 border-cyber-red/30' };
    if (s >= 50) return { stroke: '#d97706', text: 'text-cyber-amber', label: 'HIGH RISK', bg: 'bg-cyber-amber/15 border-cyber-amber/30' };
    if (s >= 25) return { stroke: '#0284c7', text: 'text-cyber-accent', label: 'SUSPICIOUS', bg: 'bg-cyber-accent/15 border-cyber-accent/30' };
    return { stroke: '#059669', text: 'text-cyber-green', label: 'BENIGN / LOW', bg: 'bg-cyber-green/15 border-cyber-green/30' };
  };

  const theme = getColor(normalizedScore);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} viewBox="0 0 160 160" className="transform -rotate-90">
          {/* Track Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-200"
          />
          {/* Animated Value Circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={theme.stroke}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${theme.stroke}40)`
            }}
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-black font-mono tracking-tighter ${theme.text}`}>
            {normalizedScore}
          </span>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest -mt-1 font-bold">
            / 100
          </span>
        </div>
      </div>

      <div className={`mt-3 px-3 py-1 rounded-full border text-[11px] font-mono font-bold uppercase tracking-wider ${theme.bg} ${theme.text} shadow-sm`}>
        {classification ? classification : theme.label}
      </div>
    </div>
  );
}
