
import {
  LayoutDashboard,
  Bot,
  BrainCircuit,
  ArrowLeftRight,
  FileText,
  Settings,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

function Sidebar({ activePage, onNavigate }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'predictive', label: 'Predictive Intelligence', icon: BrainCircuit },
    { id: 'transactions', label: 'Transaction Intelligence', icon: ArrowLeftRight },
    { id: 'invoices', label: 'Invoice Management', icon: FileText },
  ];

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 px-4 py-6 text-white">

      {/* Logo */}
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-lg font-extrabold shadow-lg shadow-emerald-500/20">
          FP
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">FinPilot</h1>
          <p className="text-xs text-slate-400">Financial Intelligence</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Main Menu
        </p>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500 font-semibold text-white shadow-lg shadow-emerald-500/10'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={19} />
                  {item.label}
                </span>

                {isActive && <ChevronRight size={17} />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="space-y-2 border-t border-slate-800 pt-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Support
        </p>

        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
          <Settings size={19} />
          Settings
        </button>

        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
          <HelpCircle size={19} />
          Help & Support
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <p className="text-xs font-semibold text-slate-300">
          FinPilot AI
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Smarter financial decisions.
        </p>
      </div>

    </aside>
  );
}

export default Sidebar;
