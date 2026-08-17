'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'red' | 'amber' | 'green' | 'purple';
  trend?: string;
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'cyan', trend }: StatsCardProps) {
  const colorMap = {
    cyan: { text: 'text-cyber-accent', bg: 'bg-cyber-accent/15', border: 'border-cyber-accent/30', glow: 'hover:shadow-card-glow' },
    red: { text: 'text-cyber-red', bg: 'bg-cyber-red/15', border: 'border-cyber-red/30', glow: 'hover:shadow-card-glow' },
    amber: { text: 'text-cyber-amber', bg: 'bg-cyber-amber/15', border: 'border-cyber-amber/30', glow: 'hover:shadow-card-glow' },
    green: { text: 'text-cyber-green', bg: 'bg-cyber-green/15', border: 'border-cyber-green/30', glow: 'hover:shadow-card-glow' },
    purple: { text: 'text-cyber-purple', bg: 'bg-cyber-purple/15', border: 'border-cyber-purple/30', glow: 'hover:shadow-card-glow' },
  };

  const theme = colorMap[color] || colorMap.cyan;

  return (
    <div className={`p-5 rounded-2xl bg-cyber-card border border-cyber-border hover:border-cyber-accent/40 transition-all shadow-sm ${theme.glow}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.border} border flex items-center justify-center ${theme.text} shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-black font-mono tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${theme.bg} ${theme.text} border ${theme.border}`}>
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-[11px] text-slate-500 font-mono leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
