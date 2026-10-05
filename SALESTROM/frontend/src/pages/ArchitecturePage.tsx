import React, { useState } from 'react';
import { ArchitectureNodeModal, ArchitectureNodeDetail } from '../components/ArchitectureNodeModal';
import { Network, Server, Database, ShieldCheck, Layers, Cpu, Radio, Zap } from 'lucide-react';

export const architectureNodes: ArchitectureNodeDetail[] = [
  {
    id: 'api-gateway',
    name: 'API Gateway (Admission Control & Rate Limiting)',
    category: 'Edge / Ingress',
    responsibility: 'Throttles burst traffic using token bucket algorithm, validates JWT tokens, and routes traffic.',
    whyExists: 'Protects backend microservices from thread pool exhaustion during 10,000 req/s flash sale spikes.',
    scalingStrategy: 'Stateless horizontal scaling across K8s pods behind AWS ALB.',
    failureBehavior: 'Returns HTTP 429 Too Many Requests safely shedding excess traffic.',
    dataOwned: 'Rate limit bucket tokens, Client IP sliding windows.',
    communicationType: 'Synchronous REST/gRPC'
  },
  {
    id: 'inventory-service',
    name: 'Inventory Service (Consistency Boundary)',
    category: 'Application Service',
    responsibility: 'Owns inventory consistency and atomic reservation logic.',
    whyExists: 'Ensures zero overselling across competing concurrent purchases.',
    scalingStrategy: 'Horizontal application scaling with atomic SQL DB updates at database layer.',
    failureBehavior: 'Rejects reservations with HTTP 409 Conflict if stock unavailable.',
    dataOwned: 'Available quantity, reserved quantity, sold quantity, optimistic version.',
    communicationType: 'Synchronous REST/gRPC'
  },
  {
    id: 'reservation-service',
    name: 'Reservation Service (Idempotency & Hold TTL)',
    category: 'Application Service',
    responsibility: 'Creates 30s TTL holds, enforces idempotency keys, manages expiration lifecycle.',
    whyExists: 'Prevents duplicate reservations for identical buy requests.',
    scalingStrategy: 'Stateless horizontal scaling with DB unique key constraints.',
    failureBehavior: 'Returns existing reservation if idempotency key reused.',
    dataOwned: 'Reservation IDs, customer holds, idempotency keys, expiration timestamps.',
    communicationType: 'Synchronous REST/gRPC'
  },
  {
    id: 'payment-service',
    name: 'Payment Service & Gateway Circuit Breaker',
    category: 'Application Service',
    responsibility: 'Orchestrates external gateway calls under circuit breaker protection (CLOSED/OPEN/HALF_OPEN).',
    whyExists: 'Isolates external payment API outages from cascading into core inventory failures.',
    scalingStrategy: 'Stateless workers consuming reservation events.',
    failureBehavior: 'Opens circuit breaker after 3 consecutive payment gateway timeouts.',
    dataOwned: 'Payment transactions, payment status ledger, idempotency tokens.',
    communicationType: 'Synchronous REST/gRPC'
  },
  {
    id: 'order-service',
    name: 'Order Service (Event Consumer)',
    category: 'Application Service',
    responsibility: 'Consumes PaymentSucceeded events asynchronously, generates order records, triggers shipments.',
    whyExists: 'Decouples order creation from synchronous payment processing latency.',
    scalingStrategy: 'Horizontally scaled event consumer group listening on broker topics.',
    failureBehavior: 'Defers unprocessable events in Outbox DLQ for automatic retries.',
    dataOwned: 'Order records, line items, order status lifecycle.',
    communicationType: 'Asynchronous Event/Queue'
  },
  {
    id: 'message-broker',
    name: 'Message Broker (Kafka / RabbitMQ Abstraction)',
    category: 'Messaging / Event',
    responsibility: 'Provides reliable event streaming for PaymentSucceeded and InventoryReserved events.',
    whyExists: 'Enables asynchronous event-driven architecture and outbox recovery.',
    scalingStrategy: 'Partitioning topics across Kafka broker clusters.',
    failureBehavior: 'Persists events to disk log ensuring zero data loss during service downtime.',
    dataOwned: 'Topic partitions, consumer group offsets, dead-letter queues.',
    communicationType: 'Asynchronous Event/Queue'
  },
  {
    id: 'relational-db',
    name: 'SQL Database (Transactional Inventory & Outbox)',
    category: 'Data Layer',
    responsibility: 'ACID transactional engine providing row-level locking and atomic conditional updates.',
    whyExists: 'Authoritative source of truth for stock quantities, payments, and orders.',
    scalingStrategy: 'Read replicas for read-heavy endpoints; primary write node for inventory update.',
    failureBehavior: 'Rolls back uncommitted transactions on error preserving inventory invariants.',
    dataOwned: 'All persistent domain tables (Products, Inventories, Reservations, Payments, Orders).',
    communicationType: 'Synchronous REST/gRPC'
  }
];

export const ArchitecturePage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNodeDetail | null>(null);

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-cyan-400" />
            Interactive Flash Sale Microservices Architecture Topology
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Click any component node to inspect its responsibility, scaling strategy, failure behavior, and data boundaries.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400" />
            <span className="text-slate-300">Synchronous REST/gRPC</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 stroke-dasharray font-bold text-emerald-400">---</span>
            <span className="text-slate-300">Asynchronous Event Stream</span>
          </div>
        </div>
      </div>

      {/* Nodes Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {architectureNodes.map((node) => (
          <div
            key={node.id}
            onClick={() => setSelectedNode(node)}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/60 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-cyan-950/40 space-y-3 flex flex-col justify-between group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 group-hover:border-cyan-800">
                  {node.category}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  node.communicationType.includes('Synchronous') ? 'bg-cyan-950 text-cyan-300' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {node.communicationType.includes('Synchronous') ? 'SYNC' : 'ASYNC'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                {node.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {node.responsibility}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] font-mono text-cyan-400">
              <span>Inspect Specifications</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* Node Details Inspector Modal */}
      <ArchitectureNodeModal 
        node={selectedNode} 
        onClose={() => setSelectedNode(null)} 
      />

    </div>
  );
};
