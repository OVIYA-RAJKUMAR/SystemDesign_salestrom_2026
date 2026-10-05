import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Box, Clock, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface MockReservation {
  id: string;
  customerId: string;
  product: string;
  qty: number;
  status: 'PENDING' | 'RESERVED' | 'PAYMENT_PENDING' | 'CONFIRMED' | 'RELEASED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  idempotencyKey: string;
}

export const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState({
    available_quantity: 80,
    reserved_quantity: 15,
    sold_quantity: 5,
    version: 12
  });

  const [reservations, setReservations] = useState<MockReservation[]>([
    {
      id: 'RES-9821-A',
      customerId: 'CUST-00042',
      product: 'SALESTORM X',
      qty: 1,
      status: 'RESERVED',
      createdAt: new Date().toLocaleTimeString(),
      expiresAt: new Date(Date.now() + 30000).toLocaleTimeString(),
      idempotencyKey: 'BUY-88219-X'
    },
    {
      id: 'RES-9822-B',
      customerId: 'CUST-00043',
      product: 'SALESTORM X',
      qty: 1,
      status: 'CONFIRMED',
      createdAt: new Date().toLocaleTimeString(),
      expiresAt: new Date(Date.now() + 30000).toLocaleTimeString(),
      idempotencyKey: 'BUY-88220-Y'
    },
    {
      id: 'RES-9823-C',
      customerId: 'CUST-00044',
      product: 'SALESTORM X',
      qty: 1,
      status: 'EXPIRED',
      createdAt: new Date(Date.now() - 40000).toLocaleTimeString(),
      expiresAt: new Date(Date.now() - 10000).toLocaleTimeString(),
      idempotencyKey: 'BUY-88221-Z'
    }
  ]);

  const refreshState = async () => {
    try {
      const data = await api.getInventoryState();
      setInventory(data);
    } catch (e) {}
  };

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleExpireManual = (resId: string) => {
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status: 'EXPIRED' } : r));
    setInventory(prev => ({
      ...prev,
      reserved_quantity: Math.max(0, prev.reserved_quantity - 1),
      available_quantity: prev.available_quantity + 1
    }));
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            Transactional Inventory System & Reservation Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Strong consistency boundary inspecting real-time allocation state, atomic versioning, and auto-expiring hold TTLs.
          </p>
        </div>
        <button
          onClick={refreshState}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh State
        </button>
      </div>

      {/* Inventory State Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 font-mono uppercase">Initial Total Allocation</div>
          <div className="text-3xl font-black text-white font-mono">100</div>
          <div className="text-[10px] text-slate-500 font-mono">Fixed Hard Stock Ceiling</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-emerald-900/50 space-y-2">
          <div className="text-xs text-emerald-400 font-mono uppercase">Available Stock</div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{inventory.available_quantity}</div>
          <div className="text-[10px] text-emerald-400/70 font-mono">Ready for reservation</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-amber-900/50 space-y-2">
          <div className="text-xs text-amber-400 font-mono uppercase">Reserved Stock</div>
          <div className="text-3xl font-black text-amber-400 font-mono">{inventory.reserved_quantity}</div>
          <div className="text-[10px] text-amber-400/70 font-mono">Payment pending / 30s TTL</div>
        </div>

        <div className="bg-slate-900 p-5 rounded-xl border border-blue-900/50 space-y-2">
          <div className="text-xs text-blue-400 font-mono uppercase">Sold / Confirmed</div>
          <div className="text-3xl font-black text-blue-400 font-mono">{inventory.sold_quantity}</div>
          <div className="text-[10px] text-blue-400/70 font-mono">Settled & fulfilled</div>
        </div>

      </div>

      {/* Reservation Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            Live Inventory Reservation Audit Records
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Auto Expiry Worker Active (30s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <th className="py-3 px-4">Reservation ID</th>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4">Expires At</th>
                <th className="py-3 px-4">Idempotency Key</th>
                <th className="py-3 px-4 text-right">Demonstration Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 px-4 font-bold text-cyan-400">{res.id}</td>
                  <td className="py-3 px-4">{res.customerId}</td>
                  <td className="py-3 px-4 font-bold">{res.qty}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      res.status === 'RESERVED' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      res.status === 'CONFIRMED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      res.status === 'EXPIRED' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{res.createdAt}</td>
                  <td className="py-3 px-4 text-slate-400">{res.expiresAt}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">{res.idempotencyKey}</td>
                  <td className="py-3 px-4 text-right">
                    {res.status === 'RESERVED' && (
                      <button
                        onClick={() => handleExpireManual(res.id)}
                        className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800 text-[10px] font-bold transition"
                      >
                        Expire Reservation
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
