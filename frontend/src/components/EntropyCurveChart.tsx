'use client';

import React from 'react';
import { Activity, ShieldAlert, CheckCircle } from 'lucide-react';

interface EntropyPoint {
  offset: number;
  offset_pct: number;
  entropy: number;
}

interface EntropyCurveChartProps {
  points?: EntropyPoint[];
  overallEntropy: number;
  filename?: string;
}

export default function EntropyCurveChart({ points = [], overallEntropy, filename }: EntropyCurveChartProps) {
  // Generate fallback sample points if not provided
  const dataPoints: EntropyPoint[] = points.length > 0 ? points : Array.from({ length: 25 }).map((_, i) => {
    const pct = Math.round((i / 24) * 100);
    let ent = 5.2;
    if (overallEntropy > 7.0) {
      ent = i > 6 && i < 20 ? 7.6 + Math.sin(i) * 0.35 : 5.8 + Math.cos(i) * 0.4;
    } else {
      ent = 4.2 + Math.sin(i * 0.8) * 0.9;
    }
    return {
      offset: i * 1024,
      offset_pct: pct,
      entropy: Math.min(8.0, Math.max(1.0, Number(ent.toFixed(2))))
    };
  });

  const width = 600;
  const height = 140;
  const padding = 20;

  // Calculate SVG path
  const minX = 0;
  const maxX = 100;
  const minY = 0;
  const maxY = 8.0;

  const pointsPath = dataPoints.map((pt, i) => {
    const x = padding + (pt.offset_pct / maxX) * (width - 2 * padding);
    const y = height - padding - ((pt.entropy - minY) / (maxY - minY)) * (height - 2 * padding);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const dangerThresholdY = height - padding - ((7.2 - minY) / (maxY - minY)) * (height - 2 * padding);

  return (
    <div className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-3 font-mono shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-cyber-accent" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Byte-Level Shannon Entropy Sliding Window Curve
          </h4>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-slate-500 font-semibold">Calculated Entropy:</span>
          <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] border ${
            overallEntropy >= 7.2
              ? 'bg-cyber-red/15 border-cyber-red/30 text-cyber-red'
              : 'bg-cyber-green/15 border-cyber-green/30 text-cyber-green'
          }`}>
            {overallEntropy.toFixed(2)} / 8.00
          </span>
          <span className="text-[10px] text-slate-500 font-bold">
            {overallEntropy >= 7.2 ? '🚨 High Entropy (Packed/Encrypted)' : '✅ Normal Dispersion'}
          </span>
        </div>
      </div>

      {/* SVG Entropy Chart */}
      <div className="w-full overflow-x-auto bg-cyber-dark/80 rounded-xl p-2.5 border border-cyber-border/80 shadow-inner">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
          <defs>
            <linearGradient id="entropyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--cyber-accent))" stopOpacity="0.35" />
              <stop offset="100%" stopColor="rgb(var(--cyber-accent))" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={dangerThresholdY} x2={width - padding} y2={dangerThresholdY} stroke="#e11d48" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x={width - padding - 95} y={dangerThresholdY - 4} fill="#e11d48" fontSize="9" fontWeight="bold">Packed Threshold (7.2)</text>

          {/* Area fill */}
          <path
            d={`${pointsPath} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="url(#entropyGradient)"
          />

          {/* Curve line */}
          <path
            d={pointsPath}
            fill="none"
            stroke="rgb(var(--cyber-accent))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data blips */}
          {dataPoints.map((pt, i) => {
            const x = padding + (pt.offset_pct / maxX) * (width - 2 * padding);
            const y = height - padding - ((pt.entropy - minY) / (maxY - minY)) * (height - 2 * padding);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={pt.entropy >= 7.2 ? 3.5 : 2}
                fill={pt.entropy >= 7.2 ? '#e11d48' : 'rgb(var(--cyber-accent))'}
                className="hover:r-5 transition-all"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between text-[10px] text-slate-500 px-1 font-semibold">
        <span>File Offset: 0% (Header/Metadata)</span>
        <span>50% (Body / Streams)</span>
        <span>100% (Trailing Overlays / End of File)</span>
      </div>
    </div>
  );
}
