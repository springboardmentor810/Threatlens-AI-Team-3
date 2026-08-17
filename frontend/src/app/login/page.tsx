'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, KeyRound, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { login, fetchCurrentUser } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('analyst@threatlens.ai');
  const [password, setPassword] = useState('AnalystPass123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      await fetchCurrentUser();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or backend service unreachable');
    } finally {
      setLoading(false);
    }
  };

  const setTestRole = (u: string, p: string) => {
    setEmail(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center p-4 relative overflow-hidden cyber-bg-mesh">
      {/* Background Cyber Grid lines */}
      <div className="absolute inset-0 cyber-grid-pattern opacity-60 pointer-events-none" />

      <div className="w-full max-w-md bg-cyber-card/95 border border-cyber-border rounded-3xl p-8 shadow-card-glow backdrop-blur-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-cyber-accent/15 border border-cyber-accent/30 flex items-center justify-center mx-auto text-cyber-accent shadow-[0_0_25px_rgba(2,132,199,0.25)]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-slate-900 font-sans">
            THREAT<span className="text-cyber-accent">LENS</span> AI
          </h1>
          <p className="text-xs text-slate-500 font-mono font-semibold">
            DEFENSIVE MALWARE CLASSIFICATION & ANALYTICS
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-cyber-red/15 border border-cyber-red/30 text-cyber-red text-xs font-mono flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-mono">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-700 uppercase tracking-wider font-bold">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@threatlens.ai"
                className="w-full bg-cyber-dark border border-cyber-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent transition-all font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-700 uppercase tracking-wider font-bold">
              Security Token / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-cyber-dark border border-cyber-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyber-accent focus:ring-1 focus:ring-cyber-accent transition-all font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyber-accent text-white font-mono font-bold text-xs uppercase tracking-widest hover:shadow-[0_0_25px_rgba(2,132,199,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <span>Access Threat Portal</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* Quick Credentials Seeder */}
        <div className="pt-4 border-t border-cyber-border space-y-2.5">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider text-center font-bold">
            Demo Account Credentials (Select to Autofill)
          </p>
          <div className="grid grid-cols-2 gap-2.5 text-[10px] font-mono">
            <button
              onClick={() => setTestRole('analyst@threatlens.ai', 'AnalystPass123!')}
              className="p-2.5 rounded-xl bg-cyber-dark border border-cyber-border hover:border-cyber-accent/60 text-slate-700 text-left transition-all shadow-sm"
            >
              <div className="text-cyber-accent font-bold">Malware Analyst</div>
              <div className="text-slate-500 text-[9px] truncate font-medium">analyst@threatlens.ai</div>
            </button>
            <button
              onClick={() => setTestRole('admin@threatlens.ai', 'AdminPass123!')}
              className="p-2.5 rounded-xl bg-cyber-dark border border-cyber-border hover:border-cyber-accent/60 text-slate-700 text-left transition-all shadow-sm"
            >
              <div className="text-cyber-amber font-bold">SOC Administrator</div>
              <div className="text-slate-500 text-[9px] truncate font-medium">admin@threatlens.ai</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
