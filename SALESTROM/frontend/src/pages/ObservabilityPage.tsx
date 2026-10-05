import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, ShieldCheck, Database, Layers, Radio, Clock, AlertTriangle } from 'lucide-react';

export const ObservabilityPage: React.FC = () => {
  const [metrics, setMetrics] = useState({
    traffic_rps: 10000,
    error_rate: 0,
    p50_lat: 12.4,
    p95_lat: 28.7,
    p99_lat: 45.1,
    queue_backlog: 0,
    circuit_state: 'CLOSED'
  });

  const chartData = [
    { time: '09:41:00', rps: 1200, p95: 18, queue: 0 },
    { time: '09:41:05', rps: 4500, p95: 22, queue: 12 },
    { time: '09:41:10', rps: 10000, p95: 29, queue: 45 },
    { time: '09:41:15', rps: 9800, p95: 28, queue: 20 },
    { time: '09:41:20', rps: 3100, p95: 19, queue: 0 },
    { time: '09:41:25', rps: 800, p95: 14, queue: 0 },
  ];

  const recentEvents = [
    { name: 'INVENTORY_RESERVED', entity: 'Product #SALESTORM-X', reqId: 'REQ-9912', status: 'SUCCESS', time: '09:41:22' },
    { name: 'PAYMENT_INITIATED', entity: 'Reservation #RES-9821', reqId: 'REQ-9912', status: 'PROCESSING', time: '09:41:22' },
    { name: 'PAYMENT_SUCCEEDED', entity: 'Payment #PAY-1001', reqId: 'REQ-9912', status: 'SUCCESS', time: '09:41:23' },
    { name: 'ORDER_CREATED', entity: 'Order #ORD-501', reqId: 'REQ-9912', status: 'CONFIRMED', time: '09:41:23' },
    { name: 'DUPLICATE_REQUEST', entity: 'Idempotency Collision', reqId: 'REQ-9915', status: 'HANDLED', time: '09:41:24' },
    { name: 'CIRCUIT_BREAKER_OPEN', entity: 'Payment Gateway Timeout', reqId: 'SYSTEM', status: 'WARNING', time: '09:41:25' },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Live System Observability & Event Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time metrics, P50/P95/P99 latencies, message broker queue depth, and structured audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">CORRELATION TRACING: </span>
            <span className="text-emerald-400 font-bold">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Traffic Ingress Rate</div>
          <div className="text-2xl font-black text-cyan-400 font-mono">10,000 <span className="text-xs font-normal">req/s</span></div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">P95 Latency</div>
          <div className="text-2xl font-black text-purple-400 font-mono">28.7 <span className="text-xs font-normal">ms</span></div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Queue Depth</div>
          <div className="text-2xl font-black text-amber-400 font-mono">0 <span className="text-xs font-normal">msgs</span></div>
        </div>

        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Error Rate</div>
          <div className="text-2xl font-black text-emerald-400 font-mono">0.00 %</div>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Traffic Over Time */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Traffic Throughput Over Time (Req / sec)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                <Area type="monotone" dataKey="rps" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* P95 Latency Over Time */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            P95 Latency Profile Over Time (ms)
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} />
                <Area type="monotone" dataKey="p95" stroke="#a855f7" fillOpacity={1} fill="url(#colorLat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Structured Business Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Structured Domain Events Audit Trail
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <th className="py-3 px-4">Event Name</th>
                <th className="py-3 px-4">Entity Details</th>
                <th className="py-3 px-4">Correlation Request ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {recentEvents.map((e, idx) => (
                <tr key={idx} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 px-4 font-bold text-cyan-400">{e.name}</td>
                  <td className="py-3 px-4">{e.entity}</td>
                  <td className="py-3 px-4 text-slate-400">{e.reqId}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      e.status === 'SUCCESS' || e.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-400' :
                      e.status === 'HANDLED' ? 'bg-cyan-950 text-cyan-400' :
                      'bg-amber-950 text-amber-400'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">{e.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
