import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, Play, Code } from 'lucide-react';

export const ApiExplorerPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('POST /api/v1/reservations');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(`IDEM-${Date.now()}`);
  const [requestBody, setRequestBody] = useState<string>(JSON.stringify({
    product_id: "SALESTORM-X-DEFAULT",
    customer_id: "CUST-00042",
    quantity: 1,
    idempotency_key: `IDEM-${Date.now()}`
  }, null, 2));

  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const endpoints = [
    'POST /api/v1/reservations',
    'POST /api/v1/reservations/{id}/release',
    'POST /api/v1/payments',
    'GET /api/v1/payments/{id}',
    'GET /api/v1/orders',
    'POST /api/v1/flash-sale/simulate',
    'POST /api/v1/failure/payment',
    'GET /api/v1/metrics',
    'GET /api/v1/events'
  ];

  const handleSendRequest = async () => {
    const t0 = performance.now();
    try {
      let res;
      if (selectedEndpoint === 'POST /api/v1/reservations') {
        const body = JSON.parse(requestBody);
        res = await fetch('/api/v1/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
          body: JSON.stringify(body)
        });
      } else if (selectedEndpoint === 'POST /api/v1/payments') {
        const body = JSON.parse(requestBody);
        res = await fetch('/api/v1/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
          body: JSON.stringify(body)
        });
      } else if (selectedEndpoint === 'GET /api/v1/metrics') {
        res = await fetch('/api/v1/metrics');
      } else if (selectedEndpoint === 'GET /api/v1/events') {
        res = await fetch('/api/v1/events');
      } else {
        res = await fetch('/api/v1/metrics');
      }

      const t1 = performance.now();
      setLatency(Math.round(t1 - t0));
      setResponseStatus(res.status);
      const data = await res.json();
      setResponseOutput(data);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseOutput({ error: err.message });
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            Interactive API Explorer & Idempotency Testing Playground
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test backend REST API endpoints with custom `Idempotency-Key` headers and inspect status codes & latency.
          </p>
        </div>
      </div>

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Endpoint List & Request Controls */}
        <div className="md:col-span-5 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <label className="text-xs font-mono text-slate-400 font-bold uppercase block">
            Select API Endpoint
          </label>

          <select
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            className="w-full bg-slate-950 text-white font-mono text-xs p-3 rounded-xl border border-slate-800 focus:border-cyan-500"
          >
            {endpoints.map((ep) => (
              <option key={ep} value={ep}>{ep}</option>
            ))}
          </select>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 font-bold uppercase block">
              Header: Idempotency-Key
            </label>
            <input
              type="text"
              value={idempotencyKey}
              onChange={(e) => setIdempotencyKey(e.target.value)}
              className="w-full bg-slate-950 text-cyan-400 font-mono text-xs p-3 rounded-xl border border-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 font-bold uppercase block">
              Request Payload (JSON)
            </label>
            <textarea
              rows={6}
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleSendRequest}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-950 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Request to Backend
          </button>
        </div>

        {/* Right Response Output Window */}
        <div className="md:col-span-7 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                Live Response Telemetry
              </h3>
              {responseStatus && (
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    responseStatus >= 200 && responseStatus < 300 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    HTTP {responseStatus}
                  </span>
                  {latency && <span className="text-slate-400">{latency} ms</span>}
                </div>
              )}
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto h-80">
              {responseOutput ? JSON.stringify(responseOutput, null, 2) : '// Response output will appear here...'}
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
};
