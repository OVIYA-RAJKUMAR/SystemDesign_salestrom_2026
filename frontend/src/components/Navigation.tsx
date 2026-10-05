import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Box, Cpu, CreditCard, 
  AlertTriangle, Network, Activity, Terminal, BookOpen 
} from 'lucide-react';

export const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/flash-sale', label: 'Flash Sale', icon: ShoppingBag },
  { path: '/inventory', label: 'Inventory', icon: Box },
  { path: '/concurrency-lab', label: 'Concurrency Lab', icon: Cpu },
  { path: '/payments', label: 'Payment & Orders', icon: CreditCard },
  { path: '/failure-simulator', label: 'Failure Simulator', icon: AlertTriangle },
  { path: '/architecture', label: 'Architecture', icon: Network },
  { path: '/observability', label: 'Observability', icon: Activity },
  { path: '/api-explorer', label: 'API Explorer', icon: Terminal },
  { path: '/design-decisions', label: 'Design Decisions', icon: BookOpen },
];

export const Navigation: React.FC = () => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-2 overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-1 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200
                ${isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-950' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
