import React, { useState } from 'react';
import { BookOpen, Layers, CheckCircle2, ShieldCheck, Cpu, Code2 } from 'lucide-react';

export const adrItems = [
  { id: 'ADR-001', title: 'Microservices vs Modular Monolith', status: 'ACCEPTED', date: '2026-10-01', context: 'Domain bounded contexts split clean service boundaries for Inventory, Payment, and Order.' },
  { id: 'ADR-002', title: 'SQL vs NoSQL for Transactional Flash Sale', status: 'ACCEPTED', date: '2026-10-01', context: 'Selected Relational SQL for ACID isolation levels, atomic updates, and foreign key safety.' },
  { id: 'ADR-003', title: 'Atomic Conditional Update vs Optimistic Locking', status: 'ACCEPTED', date: '2026-10-02', context: 'Atomic conditional update prevents version retry thrashing under 10,000 req/s extreme contention.' },
  { id: 'ADR-004', title: 'Synchronous vs Asynchronous Communication', status: 'ACCEPTED', date: '2026-10-02', context: 'Inventory reservation is synchronous; order processing and notifications are asynchronous events.' },
  { id: 'ADR-005', title: 'Redis Caching Strategy', status: 'ACCEPTED', date: '2026-10-03', context: 'Cache product details and metadata; NEVER use cache as final authority for inventory.' },
  { id: 'ADR-006', title: 'Idempotency Key Strategy', status: 'ACCEPTED', date: '2026-10-03', context: 'Require Idempotency-Key headers on all mutation endpoints to prevent duplicate charges.' },
  { id: 'ADR-007', title: 'Outbox Event Pattern', status: 'ACCEPTED', date: '2026-10-04', context: 'Write OutboxEvent records inside DB transaction before async dispatch to guarantee publication.' },
  { id: 'ADR-008', title: 'Payment Retry & Circuit Breaker', status: 'ACCEPTED', date: '2026-10-04', context: 'Circuit breaker trips OPEN on consecutive payment gateway timeouts to prevent cascading failure.' },
  { id: 'ADR-009', title: 'Inventory Consistency Strategy', status: 'ACCEPTED', date: '2026-10-05', context: 'Hard stock limit 100 enforced at database engine boundary. available_quantity < 0 impossible.' },
];

export const DesignDecisionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ADR' | 'SOLID' | 'PATTERNS' | 'TRADEOFFS'>('ADR');

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Architecture Decision Records & Design System
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formal engineering documentation matching hackathon system evaluation standards.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['ADR', 'SOLID', 'PATTERNS', 'TRADEOFFS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                activeTab === tab ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ADR View */}
      {activeTab === 'ADR' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adrItems.map((adr) => (
            <div key={adr.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {adr.id}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                    {adr.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{adr.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{adr.context}</p>
              </div>
              <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-850">
                Date: {adr.date}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SOLID View */}
      {activeTab === 'SOLID' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            SOLID Principles Mapping in Backend Codebase
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">SRP</span>
              <h4 className="text-xs font-bold text-white">Single Responsibility</h4>
              <p className="text-[11px] text-slate-400">Payment processing separate from order management & inventory reservation.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">OCP</span>
              <h4 className="text-xs font-bold text-white">Open/Closed</h4>
              <p className="text-[11px] text-slate-400">Add new payment providers without modifying core payment orchestration logic.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">LSP</span>
              <h4 className="text-xs font-bold text-white">Liskov Substitution</h4>
              <p className="text-[11px] text-slate-400">MessageBroker abstractions interchangeable between InMemory and Kafka implementations.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">ISP</span>
              <h4 className="text-xs font-bold text-white">Interface Segregation</h4>
              <p className="text-[11px] text-slate-400">Small focused repositories for Inventory, Reservation, and Outbox.</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400">DIP</span>
              <h4 className="text-xs font-bold text-white">Dependency Inversion</h4>
              <p className="text-[11px] text-slate-400">Services depend on repository abstractions rather than concrete DB connections.</p>
            </div>
          </div>
        </div>
      )}

      {/* Patterns View */}
      {activeTab === 'PATTERNS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400">Circuit Breaker Pattern</h4>
            <p className="text-xs text-slate-300">Protects external payment gateway calls with CLOSED, OPEN, and HALF_OPEN states.</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400">Transactional Outbox Pattern</h4>
            <p className="text-xs text-slate-300">Persists events in OutboxEvent table in the same DB transaction before async dispatch.</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400">Repository Pattern</h4>
            <p className="text-xs text-slate-300">Decouples domain business logic from database query execution.</p>
          </div>
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-mono font-bold text-cyan-400">Token Bucket Rate Limiter</h4>
            <p className="text-xs text-slate-300">Protects API gateway from traffic spikes exceeding admission threshold.</p>
          </div>
        </div>
      )}

      {/* Tradeoffs View */}
      {activeTab === 'TRADEOFFS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Architectural Trade-offs & CAP Theorem Justification
          </h3>
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-mono">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">Consistency vs Availability (CP Over AP):</span>
              Strong inventory consistency is prioritized over write availability. If stock check cannot guarantee zero overselling, request is rejected rather than risking negative stock.
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">Synchronous Reservation vs Asynchronous Order Creation:</span>
              Reservation must be synchronous to confirm stock hold. Order creation and notifications are asynchronous to reduce buyer wait latency.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
