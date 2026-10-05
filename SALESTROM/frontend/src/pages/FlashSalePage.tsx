import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ReservationResponse, PaymentResponse } from '../types';
import { ShoppingBag, Zap, ShieldCheck, CheckCircle2, Clock, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export const FlashSalePage: React.FC = () => {
  const [stockState, setStockState] = useState({
    available: 100,
    reserved: 0,
    sold: 0,
    version: 1
  });

  const [purchasing, setPurchasing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeReservation, setActiveReservation] = useState<ReservationResponse | null>(null);
  const [activePayment, setActivePayment] = useState<PaymentResponse | null>(null);

  const refreshInventory = async () => {
    try {
      const inv = await api.getInventoryState();
      setStockState({
        available: inv.available_quantity,
        reserved: inv.reserved_quantity,
        sold: inv.sold_quantity,
        version: inv.version
      });
    } catch (e) {}
  };

  useEffect(() => {
    refreshInventory();
    const interval = setInterval(refreshInventory, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleBuyNow = async () => {
    setPurchasing(true);
    setErrorMsg(null);
    setCurrentStep(1); // REQUEST RECEIVED

    const customerId = `CUST-${Math.floor(Math.random() * 90000) + 10000}`;
    const idempotencyKey = `BUY-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      await new Promise(r => setTimeout(r, 200));
      setCurrentStep(2); // VALIDATING

      await new Promise(r => setTimeout(r, 200));
      setCurrentStep(3); // INVENTORY CHECK

      // Call Backend Reservation API
      const res = await api.createReservation(customerId, 'SALESTORM-X-DEFAULT', idempotencyKey);
      setActiveReservation(res);
      setCurrentStep(4); // RESERVATION SUCCESS

      await new Promise(r => setTimeout(r, 300));
      setCurrentStep(5); // PAYMENT

      // Call Backend Payment API
      const payKey = `PAY-${idempotencyKey}`;
      const pay = await api.processPayment(res.reservation_id, 49999.0, payKey);
      setActivePayment(pay);
      setCurrentStep(6); // ORDER CONFIRMED

      await refreshInventory();
    } catch (err: any) {
      setErrorMsg(err.message || 'Purchase process failed');
    } finally {
      setPurchasing(false);
    }
  };

  const steps = [
    { num: 1, name: 'REQUEST RECEIVED' },
    { num: 2, name: 'VALIDATING' },
    { num: 3, name: 'INVENTORY CHECK' },
    { num: 4, name: 'RESERVATION' },
    { num: 5, name: 'PAYMENT' },
    { num: 6, name: 'ORDER CONFIRMED' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Product Card Showcase */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 gap-0">
        
        {/* Left Visual Area */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 relative">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 tracking-wider">
              FLASH SALE ITEM #001
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              SALESTORM X — Limited Edition
            </h2>
            <p className="text-xs text-slate-400">
              High-concurrency flagship demo unit. Only 100 physical allocations worldwide.
            </p>
          </div>

          {/* Price & Stock Badge */}
          <div className="py-8 space-y-3">
            <div className="text-3xl font-black text-white font-mono">
              ₹49,999 <span className="text-xs text-slate-400 font-normal font-sans">MSRP</span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Available Stock:</span>
                <span className="text-emerald-400 font-bold">{stockState.available} units</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${(stockState.available / 100) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Concurrency-Safe Atomic Conditional Update Protection</span>
          </div>
        </div>

        {/* Right Interactive Area */}
        <div className="md:col-span-7 p-8 space-y-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Live Purchase Terminal
            </h3>

            {/* Live Inventory Gauges */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">AVAILABLE</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">{stockState.available}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">RESERVED</div>
                <div className="text-lg font-bold text-amber-400 font-mono">{stockState.reserved}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">SOLD</div>
                <div className="text-lg font-bold text-blue-400 font-mono">{stockState.sold}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">VERSION</div>
                <div className="text-lg font-bold text-purple-400 font-mono">v{stockState.version}</div>
              </div>
            </div>

            {/* BUY NOW Button */}
            <button
              disabled={purchasing || stockState.available <= 0}
              onClick={handleBuyNow}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-600 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm uppercase tracking-widest transition shadow-xl shadow-cyan-950/50 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {purchasing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing Transaction...
                </>
              ) : stockState.available <= 0 ? (
                'OUT OF STOCK'
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 fill-current" />
                  BUY NOW (₹49,999)
                </>
              )}
            </button>
          </div>

          {/* Request Lifecycle Timeline */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Request Lifecycle Telemetry
            </div>

            <div className="grid grid-cols-6 gap-1">
              {steps.map((s) => (
                <div 
                  key={s.num}
                  className={`p-2 rounded text-center transition-all ${
                    currentStep >= s.num 
                      ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold' 
                      : 'bg-slate-900 text-slate-600 border border-slate-850'
                  }`}
                >
                  <div className="text-[9px] font-mono">0{s.num}</div>
                  <div className="text-[8px] font-semibold tracking-tighter truncate">{s.name}</div>
                </div>
              ))}
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-400 text-xs rounded-lg flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {activeReservation && (
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Reservation Created: {activeReservation.reservation_id}
                </div>
                <div className="text-slate-400 text-[11px]">
                  Idempotency Key: {activeReservation.idempotency_key}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
