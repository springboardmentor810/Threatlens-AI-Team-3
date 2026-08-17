'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken } from '../lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 rounded-2xl border-3 border-cyber-accent border-t-transparent animate-spin shadow-accent-glow" />
        <p className="text-xs font-mono text-cyber-accent tracking-widest uppercase font-bold">
          Initializing ThreatLens AI Engine...
        </p>
      </div>
    </div>
  );
}
