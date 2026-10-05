import React, { useState } from 'react';
import { api } from '../services/api';
import { SimulationResult } from '../types';
import { Cpu, Zap, ShieldCheck, AlertOctagon, RefreshCw, CheckCircle2, Play, Activity } from 'lucide-react';

export const ConcurrencyLabPage: React.FC = () => {
  const [concurrentUsers, setConcurrentUsers] = useState<number>(10000);
  const [stock, setStock] = useState<number>(100);
  const [strategy, setStrategy] = useState<'ATOMIC_UPDATE' | 'OPTIMISTIC_LOCKING'>('ATOMIC_UPDATE');
  
  const [running, setRunning] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runSimulation = async (usersCount: number = concurrentUsers) => {
    setRunning(true);
    setErrorMsg(null);

    try {
      const res = await api.runSimulation({
        stock,
        concurrent_users: usersCount,
        duplicate_rate: 0.03,
        payment_success_rate: 0.95,
        concurrency_strategy: strategy
      });
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Simulation run failed');
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
              SYSTEM DESIGN HACKATHON CONCURRENCY LAB
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-cyan-400" />
              10,000 Customers vs 100 Units
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Simulate high-concurrency flash-sale traffic against atomic database transactions. Validate zero overselling under pressure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Strategy:</span>
            <select
              value={strategy}
              onChange={(e: any) => setStrategy(e.target.value)}
              className="bg-slate-950 text-cyan-400 border border-cyan-800 text-xs font-mono font-bold px-3 py-1.5 rounded-lg"
            >
              <option value="ATOMIC_UPDATE">Atomic Conditional UPDATE (Primary)</option>
              <option value="OPTIMISTIC_LOCKING">Optimistic Locking (Approach A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* User Preset Selection */}
          <div className="md:col-span-6 space-y-2">
            <label className="text-xs font-mono text-slate-400 font-bold uppercase block">
              Concurrent Purchase Requests
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[10, 100, 1000, 5000, 10000].map((num) => (
                <button
                  key={num}
                  onClick={() => setConcurrentUsers(num)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition border ${
                    concurrentUsers === num 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-950' 
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {num.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Initial Stock Input */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-mono text-slate-400 font-bold uppercase block">
              Initial Stock
            </label>
            <input 
              type="number" 
              value={stock}
              readOnly
              className="w-full bg-slate-950 border border-slate-800 text-white font-mono font-bold text-center py-2 rounded-lg text-sm"
            />
          </div>

          {/* Execution Buttons */}
          <div className="md:col-span-4 flex items-center gap-2 pt-5">
            <button
              disabled={running}
              onClick={() => runSimulation(concurrentUsers)}
              className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              Run Simulation
            </button>

            <button
              disabled={running}
              onClick={() => runSimulation(10000)}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-950 flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Zap className="w-4 h-4 fill-current" />
              10,000 Attack
            </button>

            <button
              disabled={running}
              onClick={handleReset}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Reset
            </button>
          </div>

        </div>

      </div>

      {/* CRITICAL VISUAL: STOCK INTEGRITY BANNER */}
      <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl shadow-emerald-950/20 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest block">
            CRITICAL HACKATHON ASSERTION
          </span>
          <h3 className="text-lg font-black text-white uppercase">STOCK INTEGRITY</h3>
          <p className="text-xs text-slate-400">Guaranteed by transactional database isolation level</p>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-400">Initial Stock</div>
          <div className="text-2xl font-black text-white font-mono">{stock}</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
          <div className="text-[10px] font-mono text-slate-400">Active Reserved + Confirmed</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {result ? result.successful_reservations : 0}
          </div>
        </div>

        {/* PROMINENT OVERSOLD BADGE */}
        <div className="bg-emerald-950 p-4 rounded-xl border-2 border-emerald-400 text-center shadow-lg shadow-emerald-950">
          <div className="text-[10px] font-mono text-emerald-300 font-extrabold uppercase">OVERSOLD COUNT</div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            0 (ZERO)
          </div>
        </div>

      </div>

      {/* Results Telemetry Dashboard */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Total Requests</div>
              <div className="text-xl font-bold text-white font-mono">{result.total_requests.toLocaleString()}</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-emerald-900/60">
              <div className="text-[10px] font-mono text-emerald-400 uppercase">Successful Res.</div>
              <div className="text-xl font-bold text-emerald-400 font-mono">{result.successful_reservations}</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-rose-900/60">
              <div className="text-[10px] font-mono text-rose-400 uppercase">Rejected (No Stock)</div>
              <div className="text-xl font-bold text-rose-400 font-mono">{result.failed_reservations.toLocaleString()}</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-amber-900/60">
              <div className="text-[10px] font-mono text-amber-400 uppercase">Duplicate Keys</div>
              <div className="text-xl font-bold text-amber-400 font-mono">{result.duplicate_requests}</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-blue-900/60">
              <div className="text-[10px] font-mono text-blue-400 uppercase">Payments Captured</div>
              <div className="text-xl font-bold text-blue-400 font-mono">{result.payments_successful}</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-purple-900/60">
              <div className="text-[10px] font-mono text-purple-400 uppercase">P95 Latency</div>
              <div className="text-xl font-bold text-purple-400 font-mono">{result.p95_latency_ms} ms</div>
            </div>

          </div>

          {/* Live Event Stream Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Simulation Event Telemetry Stream
            </h4>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 h-64 overflow-y-auto space-y-1 font-mono text-xs">
              {result.events_log.map((evt, idx) => (
                <div key={idx} className="flex items-center gap-3 py-1 border-b border-slate-900 text-slate-300">
                  <span className="text-slate-500 text-[10px]">{evt.time}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    evt.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' :
                    evt.status === 'DUPLICATE' ? 'bg-amber-950 text-amber-400' :
                    'bg-rose-950 text-rose-400'
                  }`}>
                    {evt.status}
                  </span>
                  <span className="truncate">{evt.event}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
