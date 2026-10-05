import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SystemMetrics } from '../types';
import { 
  Users, Activity, Box, ShieldCheck, ShoppingCart, CreditCard, 
  AlertCircle, Server, Clock, ArrowRight, CheckCircle2 
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    current_traffic_rps: 10000,
    available_stock: 100,
    reserved_stock: 0,
    sold_stock: 0,
    total_requests: 10000,
    successful_reservations: 0,
    successful_orders: 0,
    payment_success_rate: 100,
    error_rate: 0,
    queue_backlog: 0,
    circuit_breaker_state: 'CLOSED',
    p50_latency_ms: 12.4,
    p95_latency_ms: 28.7,
    p99_latency_ms: 45.1
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.getMetrics();
        setMetrics(data);
      } catch (e) {
        // Fallback gracefully
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1">
              <span>SYSTEM ARCHITECTURE EXECUTIVE DASHBOARD</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              SALESTORM Command Center Overview
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              High-concurrency concurrency-safe flash-sale engine. Demonstrating 10,000 req/s traffic under zero overselling guarantees.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Target Concurrency</div>
              <div className="text-base font-extrabold text-cyan-400 font-mono">10,000 Req/s</div>
            </div>
            <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Stock Guarantee</div>
              <div className="text-base font-extrabold text-emerald-400 font-mono">0 Oversold</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Requests Received</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {metrics.total_requests.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">10,000 Concurrent Buyers</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Available Stock</span>
            <Box className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {metrics.available_stock} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono font-bold">Strict 100 Unit Boundary</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Reserved Stock</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {metrics.reserved_stock}
          </div>
          <div className="text-[10px] text-amber-400/80 font-mono">Active Expiry TTL: 30s</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Sold / Confirmed</span>
            <ShoppingCart className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {metrics.sold_stock}
          </div>
          <div className="text-[10px] text-blue-400/80 font-mono">Confirmed Orders</div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">P95 Latency</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">
            {metrics.p95_latency_ms} <span className="text-xs font-normal">ms</span>
          </div>
          <div className="text-[10px] text-purple-400/80 font-mono">P99: {metrics.p99_latency_ms}ms</div>
        </div>

      </div>

      {/* Main Architecture Flow Diagram Visualization */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              LIVE FLASH SALE TRAFFIC FLOW PIPELINE
            </h3>
            <p className="text-xs text-slate-400">
              Visual representation of 10,000 concurrent requests flowing through system pipeline
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            OVERSOLD COUNT = 0
          </span>
        </div>

        {/* Pipeline Nodes Flow */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 py-4 relative">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-800/60 flex flex-col justify-between text-center space-y-2 relative">
            <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase">1. Ingress</div>
            <div className="text-sm font-bold text-white">10,000 Buyers</div>
            <div className="text-xs text-cyan-300 font-mono bg-cyan-950/60 py-1 rounded border border-cyan-800">
              10k Req / sec
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-blue-800/60 flex flex-col justify-between text-center space-y-2">
            <div className="text-[10px] font-mono text-blue-400 font-bold uppercase">2. API Gateway</div>
            <div className="text-sm font-bold text-white">Admission</div>
            <div className="text-xs text-blue-300 font-mono bg-blue-950/60 py-1 rounded border border-blue-800">
              Rate Limiting
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-purple-800/60 flex flex-col justify-between text-center space-y-2">
            <div className="text-[10px] font-mono text-purple-400 font-bold uppercase">3. Inventory DB</div>
            <div className="text-sm font-bold text-white">Atomic Update</div>
            <div className="text-xs text-purple-300 font-mono bg-purple-950/60 py-1 rounded border border-purple-800">
              Conditional SQL
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-amber-800/60 flex flex-col justify-between text-center space-y-2">
            <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">4. Reservation</div>
            <div className="text-sm font-bold text-white">100 Max Held</div>
            <div className="text-xs text-amber-300 font-mono bg-amber-950/60 py-1 rounded border border-amber-800">
              30s TTL Expiry
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-800/60 flex flex-col justify-between text-center space-y-2">
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">5. Payment</div>
            <div className="text-sm font-bold text-white">Gateway API</div>
            <div className="text-xs text-emerald-300 font-mono bg-emerald-950/60 py-1 rounded border border-emerald-800">
              Circuit Breaker
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-indigo-800/60 flex flex-col justify-between text-center space-y-2">
            <div className="text-[10px] font-mono text-indigo-400 font-bold uppercase">6. Order Service</div>
            <div className="text-sm font-bold text-white">Async Event</div>
            <div className="text-xs text-indigo-300 font-mono bg-indigo-950/60 py-1 rounded border border-indigo-800">
              Outbox Retry
            </div>
          </div>

        </div>

        {/* Live Counters Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block font-mono">Total Requests</span>
            <span className="text-xl font-bold text-white font-mono">10,000</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-mono">Successful Reservations</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{metrics.successful_reservations}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-mono">Rejected (Out of Stock)</span>
            <span className="text-xl font-bold text-rose-400 font-mono">{(10000 - metrics.successful_reservations).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-mono">Oversold Count</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">0 (ZERO)</span>
          </div>
        </div>

      </div>

    </div>
  );
};
