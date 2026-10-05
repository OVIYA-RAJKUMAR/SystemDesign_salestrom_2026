import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, AlertOctagon, Award, Play } from 'lucide-react';

interface JuryDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunScenario: (scenarioIndex: number) => void;
}

export const jurySteps = [
  {
    step: 1,
    title: 'Traffic Spike',
    heading: '10,000 Concurrent Purchase Requests Arrive',
    description: 'Sudden flash-sale traffic hits the API Gateway simultaneously competing for only 100 available units of SALESTORM X.',
    highlight: 'Ingress Traffic: 10,000 req/sec',
    badge: 'TRAFFIC INGRESS',
    scenarioId: 1
  },
  {
    step: 2,
    title: 'Admission Control',
    heading: 'API Gateway Rate Limiter Protects Core Services',
    description: 'Token Bucket Rate Limiter evaluates incoming requests, preventing backend thread pool exhaustion and shedding excess load safely.',
    highlight: 'Protection: Token Bucket Limiter',
    badge: 'GATEWAY ADMISSION',
    scenarioId: 8
  },
  {
    step: 3,
    title: 'Consistency Boundary',
    heading: 'Inventory Service Enforces Strong Consistency',
    description: 'All reservation attempts pass through a single, strongly-consistent transactional inventory boundary rather than trusting cached values.',
    highlight: 'Boundary: Relational DB Engine Transaction',
    badge: 'CONSISTENCY BOUNDARY',
    scenarioId: 2
  },
  {
    step: 4,
    title: 'Atomic Reservation',
    heading: 'Atomic Conditional UPDATE Guarantees ZERO Overselling',
    description: 'SQL query `UPDATE inventory SET available = available - 1 WHERE product_id = X AND available >= 1` executes atomically. Only 100 rows match!',
    highlight: 'Result: Exactly 100 Successful Reservations, 0 Oversold',
    badge: 'ATOMIC CONCURRENCY',
    scenarioId: 1
  },
  {
    step: 5,
    title: 'Idempotency Check',
    heading: 'Duplicate Buy Requests Safely Handled',
    description: 'Requests with duplicate `Idempotency-Key` headers return existing reservation records without creating duplicate inventory deductions.',
    highlight: 'Check: Idempotency Key Unique Constraint',
    badge: 'IDEMPOTENCY',
    scenarioId: 3
  },
  {
    step: 6,
    title: 'Payment Gateway',
    heading: 'Payment Processing & Circuit Breaker Guard',
    description: 'External payment provider calls execute with circuit breaker (CLOSED/OPEN/HALF_OPEN) protection against gateway outages.',
    highlight: 'Success Rate: 95% captured',
    badge: 'PAYMENT PROCESSING',
    scenarioId: 4
  },
  {
    step: 7,
    title: 'Stock Recovery',
    heading: 'Payment Failures & Expiries Automatically Release Stock',
    description: 'Unpaid or failed reservations trigger stock release, returning available inventory back to the pool cleanly.',
    highlight: 'Recovery: Auto Expiry & Failure Worker',
    badge: 'STOCK RECOVERY',
    scenarioId: 7
  },
  {
    step: 8,
    title: 'Event Outbox',
    heading: 'Transactional Outbox & PaymentSucceeded Event Publication',
    description: 'Payment success and outbox event are persisted atomically in the DB transaction, then published to the Message Broker.',
    highlight: 'Reliability: Transactional Outbox Pattern',
    badge: 'EVENT DRIVEN',
    scenarioId: 6
  },
  {
    step: 9,
    title: 'Order Recovery',
    heading: 'Order Service Down Simulation & Queue Retry',
    description: 'When Order Service is down, events remain in message broker queue. When recovered, retries process events idempotently.',
    highlight: 'Resilience: Dead Letter & Retry Queue',
    badge: 'FAULT TOLERANCE',
    scenarioId: 6
  },
  {
    step: 10,
    title: 'Final Audit',
    heading: 'Complete Guarantee Verification',
    description: 'System state verified: Maximum 100 Sales, 0 Oversold, 0 Duplicate Payments, 100% Reliable Order Lifecycle.',
    highlight: 'Final Audit: OVERSOLD = 0, STOCK INTEGRITY = 100%',
    badge: 'JURY VERIFICATION',
    scenarioId: 1
  }
];

export const JuryDemoModal: React.FC<JuryDemoModalProps> = ({ isOpen, onClose, onRunScenario }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const step = jurySteps[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl shadow-cyan-950/50">
        
        {/* Modal Header */}
        <div className="bg-slate-850 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Hackathon Jury Presentation Walkthrough
                <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-2 py-0.5 rounded">
                  GUIDED DEMO MODE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Step-by-step technical execution proof for System Design Evaluators
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>STEP {step.step} OF 10: <strong className="text-cyan-400">{step.title}</strong></span>
              <span>{Math.round((step.step / 10) * 100)}% Completed</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 transition-all duration-300"
                style={{ width: `${(step.step / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Card */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                {step.badge}
              </span>
              <button
                onClick={() => {
                  onRunScenario(step.scenarioId);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/80 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Trigger Live Scenario #{step.scenarioId}
              </button>
            </div>

            <h3 className="text-lg font-bold text-white">
              {step.heading}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {step.description}
            </p>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{step.highlight}</span>
            </div>
          </div>

          {/* Quick Step Indicators */}
          <div className="grid grid-cols-10 gap-1.5 pt-2">
            {jurySteps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIndex(idx)}
                className={`py-1 text-center text-xs font-bold rounded transition ${
                  idx === currentStepIndex 
                    ? 'bg-cyan-500 text-slate-950 font-black' 
                    : idx < currentStepIndex 
                    ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-700' 
                    : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {s.step}
              </button>
            ))}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-850 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            disabled={currentStepIndex === 0}
            onClick={() => setCurrentStepIndex(prev => prev - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold text-xs disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step
          </button>

          <span className="text-xs font-mono text-slate-400">
            Press Arrow Keys or Buttons to Navigate
          </span>

          <button
            disabled={currentStepIndex === jurySteps.length - 1}
            onClick={() => setCurrentStepIndex(prev => prev + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs disabled:opacity-40 transition shadow-lg shadow-cyan-950"
          >
            Next Step
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
