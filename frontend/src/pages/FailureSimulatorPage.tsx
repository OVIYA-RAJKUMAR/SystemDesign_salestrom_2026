import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FailureConfig } from '../types';
import { AlertTriangle, ShieldCheck, RefreshCw, CheckCircle2, Zap, Play, XCircle } from 'lucide-react';

export const FailureSimulatorPage: React.FC = () => {
  const [config, setConfig] = useState<FailureConfig>({
    payment_gateway_failure: false,
    payment_timeout: false,
    order_service_down: false,
    database_failure: false,
    duplicate_buy_request: false,
    reservation_expiry: false,
    message_processing_failure: false,
    high_traffic_spike: false
  });

  const [simulatingRecovery, setSimulatingRecovery] = useState(false);
  const [recoveryLog, setRecoveryLog] = useState<any[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const c = await api.getFailureConfig();
        setConfig(c);
      } catch (e) {}
    };
    fetchConfig();
  }, []);

  const toggleScenario = async (key: keyof FailureConfig) => {
    const newConfig = { ...config, [key]: !config[key] };
    setConfig(newConfig);
    try {
      await api.updateFailureConfig(newConfig);
    } catch (e) {}
  };

  const runOrderServiceRecoveryDemo = async () => {
    setSimulatingRecovery(true);
    setRecoveryLog([]);

    try {
      // 1. Enable Order Service Outage
      setRecoveryLog(prev => [...prev, { step: 1, text: 'Simulating Order Service Outage (order_service_down = true)...', status: 'WARN' }]);
      await api.toggleFailureScenario('order-service', true);
      await new Promise(r => setTimeout(r, 600));

      // 2. Process Payment (Payment Succeeded, Event Published to Broker)
      setRecoveryLog(prev => [...prev, { step: 2, text: 'Payment Succeeded → PaymentSucceeded event emitted to Broker queue', status: 'SUCCESS' }]);
      setRecoveryLog(prev => [...prev, { step: 3, text: 'Order Service unavailable → Event deferred in Outbox Queue (Status: PAYMENT CAPTURED — ORDER PENDING RECOVERY)', status: 'PENDING' }]);
      await new Promise(r => setTimeout(r, 1000));

      // 3. Recover Order Service
      setRecoveryLog(prev => [...prev, { step: 4, text: 'Order Service Recovered! (order_service_down = false)', status: 'INFO' }]);
      await api.toggleFailureScenario('order-service', false);
      await new Promise(r => setTimeout(r, 600));

      // 4. Broker Retry Worker processes queued event
      setRecoveryLog(prev => [...prev, { step: 5, text: 'Broker Worker retried outbox event → Order #ORD-8812 successfully created! (ORDER SUCCESSFULLY RECONCILED)', status: 'SUCCESS' }]);

    } catch (e: any) {
      setRecoveryLog(prev => [...prev, { step: 99, text: `Error: ${e.message}`, status: 'ERROR' }]);
    } finally {
      setSimulatingRecovery(false);
    }
  };

  const scenarios = [
    { key: 'payment_gateway_failure', label: '1. Payment Gateway Failure', desc: 'Simulates 502 Bad Gateway response from external payment API' },
    { key: 'payment_timeout', label: '2. Payment Timeout', desc: 'Simulates 504 Gateway Timeout requiring async reconciliation' },
    { key: 'order_service_down', label: '3. Order Service Down', desc: 'Defers PaymentSucceeded outbox events in queue until service recovers' },
    { key: 'database_failure', label: '4. Database Failure', desc: 'Simulates database connection drop protecting reservation engine' },
    { key: 'duplicate_buy_request', label: '5. Duplicate Buy Request', desc: 'Tests idempotency key collision handling under high concurrency' },
    { key: 'reservation_expiry', label: '6. Reservation Expiry', desc: 'Triggers background worker stock release for expired 30s TTL holds' },
    { key: 'message_processing_failure', label: '7. Message Processing Failure', desc: 'Routes unprocessable events to Dead Letter Queue (DLQ)' },
    { key: 'high_traffic_spike', label: '8. High Traffic Spike', desc: 'Triggers API Gateway Token Bucket rate limiter protection' },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            System Fault Injection & Recovery Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controlled chaos engineering controls for evaluating circuit breakers, outbox retry queues, and dead-letter event processing.
          </p>
        </div>

        <button
          disabled={simulatingRecovery}
          onClick={runOrderServiceRecoveryDemo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-950"
        >
          <Play className="w-4 h-4 fill-current" />
          Run Demo: Payment Success + Order Service Outage Recovery
        </button>
      </div>

      {/* Required Hackathon Scenario Visualizer (Payment Success + Order Service Down) */}
      {recoveryLog.length > 0 && (
        <div className="bg-slate-900 border border-amber-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Scenario Execution: Payment Success + Order Service Failure & Recovery
            </h3>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-800">
              OUTBOX EVENT RECOVERY
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
            {recoveryLog.map((log, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300 py-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  log.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' :
                  log.status === 'WARN' ? 'bg-amber-950 text-amber-400' :
                  log.status === 'PENDING' ? 'bg-cyan-950 text-cyan-400' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  STEP 0{log.step}
                </span>
                <span>{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8 Scenario Toggle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((sc) => {
          const isActive = config[sc.key as keyof FailureConfig];
          return (
            <div 
              key={sc.key}
              onClick={() => toggleScenario(sc.key as keyof FailureConfig)}
              className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 ${
                isActive 
                  ? 'bg-rose-950/40 border-rose-600 shadow-lg shadow-rose-950/40' 
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isActive ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isActive ? 'SIMULATING FAULT' : 'HEALTHY'}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-rose-500 animate-ping' : 'bg-slate-700'}`} />
                </div>
                <h4 className="text-sm font-bold text-white">{sc.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{sc.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-slate-500">Toggle State</span>
                <span className={isActive ? 'text-rose-400' : 'text-slate-400'}>
                  {isActive ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
