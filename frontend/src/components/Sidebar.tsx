'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  UploadCloud,
  FileCode2,
  ShieldAlert,
  Cpu,
  Settings,
  Terminal,
  Radio,
  Bot,
  Sparkles,
  Layers,
  BarChart3
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI SOC Copilot', href: '/copilot', icon: Bot, badge: 'AI Suite' },
  { name: 'Multi-Modal Scan', href: '/upload', icon: UploadCloud, badge: '5 Formats' },
  { name: 'Malware Samples', href: '/samples', icon: FileCode2 },
  { name: 'SOC Alert Queue', href: '/alerts', icon: ShieldAlert },
  { name: 'Threat Intel & Watchlist', href: '/intel', icon: Radio },
  { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  { name: 'Platform Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-cyber-border bg-cyber-card/70 backdrop-blur-md flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] sticky top-16 shadow-sm transition-colors">
      <div className="space-y-6">
        <div className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-slate-500 font-bold">
          Navigation Control
        </div>

        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyber-accent/15 border border-cyber-accent/40 text-cyber-accent shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-cyber-dark/80 hover:border-cyber-border border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyber-accent' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md border font-bold ${
                    item.badge.includes('AI')
                      ? 'bg-purple-500/15 text-purple-700 border-purple-500/30'
                      : 'bg-cyber-accent/15 text-cyber-accent border-cyber-accent/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Engine Status Box */}
      <div className="p-4 rounded-2xl bg-cyber-dark border border-cyber-border space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-800 font-mono font-bold">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" /> ThreatLens Core
          </span>
          <span className="text-[10px] text-purple-700 bg-purple-500/15 px-2 py-0.5 rounded-md border border-purple-500/30 font-bold">Active</span>
        </div>
        <div className="text-[11px] text-slate-600 font-mono leading-relaxed">
          Static PE & Multi-Modal Voice Deepfake, Video Polyglot & URL Classifier.
        </div>
        <div className="pt-2 border-t border-cyber-border flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-cyber-accent" /> 5 Modes Ready</span>
          <span className="text-cyber-green flex items-center gap-1 font-bold">
            <Terminal className="w-3 h-3" /> Live
          </span>
        </div>
      </div>
    </aside>
  );
}
