import React from 'react';
import { Activity, ShieldCheck, Zap, Award, Server } from 'lucide-react';

interface HeaderProps {
  systemHealthy: boolean;
  circuitBreakerState: string;
  onOpenJuryDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ systemHealthy, circuitBreakerState, onOpenJuryDemo }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-xl shadow-lg shadow-cyan-900/30">
            <Zap className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                SALESTORM
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 tracking-wider">
                SYSCRAFTERS 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              High-Scale E-Commerce Flash Sale Control Center
            </p>
          </div>
        </div>

        {/* Center Health Indicators */}
        <div className="flex items-center gap-4 bg-slate-950/60 px-4 py-1.5 rounded-full border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${systemHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="font-semibold text-slate-300">
              STATUS: <span className={systemHealthy ? 'text-emerald-400' : 'text-rose-400'}>
                {systemHealthy ? 'SYSTEM HEALTHY' : 'SIMULATION DEGRADED'}
              </span>
            </span>
          </div>

          <div className="h-3.5 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>CIRCUIT BREAKER:</span>
            <span className={`font-mono font-bold px-1.5 rounded text-[10px] ${
              circuitBreakerState === 'CLOSED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              circuitBreakerState === 'HALF_OPEN' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              {circuitBreakerState}
            </span>
          </div>
        </div>

        {/* Action: Jury Demo Mode Button */}
        <button
          onClick={onOpenJuryDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-950/40 hover:scale-105 active:scale-95"
        >
          <Award className="w-4 h-4 stroke-[2.5]" />
          Jury Demo Mode
        </button>

      </div>
    </header>
  );
};
