'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ShieldAlert, User, LogOut, Bell, Search, Activity, Palette, Check, Sun, Moon, Sparkles } from 'lucide-react';
import { getStoredUser, logout } from '../lib/api';

const THEMES = [
  { id: 'azure', name: 'Azure Cyber (Light)', color: '#0284c7', bg: '#f4f7fc', isDark: false },
  { id: 'emerald', name: 'Emerald Matrix (Light)', color: '#059669', bg: '#f0fdf4', isDark: false },
  { id: 'sunset', name: 'Sunset Flare (Light)', color: '#ea580c', bg: '#fff7ed', isDark: false },
  { id: 'violet', name: 'Neon Violet (Light)', color: '#9333ea', bg: '#faf5ff', isDark: false },
  { id: 'dark', name: 'Dark Cyber', color: '#00f0ff', bg: '#0a0d14', isDark: true },
];

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [currentTheme, setCurrentTheme] = useState('azure');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getStoredUser());
    const saved = localStorage.getItem('threatlens_theme') || 'azure';
    setCurrentTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);

    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('threatlens_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    setThemeMenuOpen(false);
  };

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <header className="h-16 border-b border-cyber-border bg-cyber-card/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-colors">
      {/* Brand & Search */}
      <div className="flex items-center space-x-6">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-cyber-accent/10 border border-cyber-accent/30 flex items-center justify-center text-cyber-accent group-hover:shadow-[0_0_20px_rgba(2,132,199,0.3)] transition-all">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-wider text-slate-900 flex items-center gap-1.5 font-sans">
              THREAT<span className="text-cyber-accent">LENS</span>
              <span className="text-[10px] bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 px-1.5 py-0.5 rounded-md uppercase tracking-widest font-mono font-bold">AI</span>
            </span>
            <p className="text-[10px] text-slate-500 font-mono -mt-1 font-medium tracking-wide">MALWARE ANALYTICS PLATFORM</p>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search SHA-256 hash, YARA rule, threat family..."
            className="bg-cyber-dark border border-cyber-border rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent w-80 transition-all font-mono"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Theme Selector Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setThemeMenuOpen(!themeMenuOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-cyber-dark border border-cyber-border hover:border-cyber-accent/50 text-slate-700 text-xs font-mono transition-all shadow-sm"
            title="Change Color Theme"
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-inner shrink-0"
              style={{ backgroundColor: activeThemeObj.color }}
            />
            <span className="hidden sm:inline font-semibold text-slate-800">{activeThemeObj.name.split(' ')[0]}</span>
            <Palette className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-cyber-card border border-cyber-border shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-mono">
              <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-cyber-border mb-1">
                Select Theme Palette
              </div>
              <div className="space-y-1">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => changeTheme(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all ${
                      currentTheme === t.id
                        ? 'bg-cyber-accent/15 text-cyber-accent font-bold border border-cyber-accent/30'
                        : 'text-slate-700 hover:bg-cyber-dark/80 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: t.color }}
                      />
                      <span>{t.name}</span>
                    </div>
                    {currentTheme === t.id && <Check className="w-3.5 h-3.5 text-cyber-accent" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Copilot Quick Link */}
        <Link
          href="/copilot"
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 hover:bg-purple-500/20 text-xs font-mono transition-all font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span>AI COPILOT</span>
        </Link>

        {/* System Health Indicator */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-xs font-mono font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>ENGINES ONLINE</span>
        </div>

        {/* Notification Bell */}
        <Link
          href="/alerts"
          className="p-2 rounded-xl bg-cyber-dark border border-cyber-border text-slate-600 hover:text-cyber-accent hover:border-cyber-accent/50 transition-all relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyber-red animate-ping" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyber-red" />
        </Link>

        {/* User Info */}
        {user ? (
          <div className="flex items-center space-x-3 pl-2 border-l border-cyber-border">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-900">{user.full_name || user.email}</p>
              <p className="text-[10px] text-cyber-accent font-mono font-semibold">{user.role?.name || 'Security Analyst'}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl bg-cyber-red/10 border border-cyber-red/30 text-cyber-red hover:bg-cyber-red hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 text-xs font-bold text-white bg-cyber-accent rounded-xl hover:shadow-[0_0_15px_rgba(2,132,199,0.5)] transition-all font-mono"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
