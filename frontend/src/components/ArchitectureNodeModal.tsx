import React from 'react';
import { X, Server, ShieldCheck, Database, Layers, RefreshCw, Cpu } from 'lucide-react';

export interface ArchitectureNodeDetail {
  id: string;
  name: string;
  category: 'Edge / Ingress' | 'Application Service' | 'Data Layer' | 'Messaging / Event' | 'External Provider';
  responsibility: string;
  whyExists: string;
  scalingStrategy: string;
  failureBehavior: string;
  dataOwned: string;
  communicationType: 'Synchronous REST/gRPC' | 'Asynchronous Event/Queue' | 'Shared Memory / IPC';
}

interface NodeModalProps {
  node: ArchitectureNodeDetail | null;
  onClose: () => void;
}

export const ArchitectureNodeModal: React.FC<NodeModalProps> = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-cyan-950/50">
        
        {/* Modal Header */}
        <div className="bg-slate-850 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-950 text-cyan-400 rounded-xl border border-cyan-800">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{node.name}</h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                {node.category}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Grid */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[11px] font-mono uppercase text-slate-500 font-bold">Responsibility</div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{node.responsibility}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Why It Exists
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{node.whyExists}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                Scaling Strategy
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{node.scalingStrategy}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                Failure Behavior
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{node.failureBehavior}</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[11px] font-mono uppercase text-slate-500 font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                Data Owned
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{node.dataOwned}</p>
            </div>

          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Communication Pattern:</span>
            <span className={`px-2.5 py-1 rounded font-bold ${
              node.communicationType.includes('Synchronous') 
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' 
                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {node.communicationType}
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-850 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
