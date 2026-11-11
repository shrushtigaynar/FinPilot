
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Search, Bell, ChevronDown } from 'lucide-react';
import TransactionIntelligence from './pages/TransactionIntelligence';
import PredictiveIntelligence from './pages/PredictiveIntelligence';
import InvoiceManagment from './pages/InvoiceManagment';
import AIAssistant from './pages/AIAssistant';
import Dashboard from './pages/Dashboard';
import { useState } from 'react';
import Sidebar from './components/Sidebar';

function App() {

  // Stores the currently selected page
  const [activePage, setActivePage] = useState('dashboard');

  // Page content based on the selected navigation item
  const renderPage = () => {

    switch (activePage) {

      case 'dashboard':
        return <Dashboard />;

      case 'assistant':
        return <AIAssistant />;

      case 'predictive':
        return <PredictiveIntelligence />;

      case 'transactions':
        return <TransactionIntelligence />;

      case 'invoices':
  return (
    <PayPalScriptProvider
      options={{
        'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <InvoiceManagment />
    </PayPalScriptProvider>
  );

      default:
        return <h1>Page not found</h1>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      {/* Main Content */}
      <main className="flex-1 p-8">

        {/* Page Header */}
          
<header className="mb-8 flex flex-wrap items-center justify-between gap-4">

  {/* Left section */}
  <div>
    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
      FinPilot
    </h2>
    <p className="mt-1 text-sm text-slate-500">
      Your intelligent financial workspace
    </p>
  </div>

  {/* Right section */}
  <div className="flex items-center gap-4">

    {/* Search */}
    <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 md:flex">
      <Search size={18} className="text-slate-400" />
      <input
        type="text"
        placeholder="Search anything..."
        className="w-40 bg-transparent text-sm outline-none"
      />
    </div>

    {/* Notification icon */}
    <div className="relative rounded-xl border border-slate-200 bg-white p-2.5">
      <Bell size={19} className="text-slate-600" />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
    </div>

    {/* Profile */}
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
        S
      </div>

      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-slate-800">
          Admin
        </p>
        <p className="text-xs text-slate-500">
          FinPilot User
        </p>
      </div>

      <ChevronDown size={16} className="text-slate-400" />
    </div>

  </div>
</header>


        {/* Dynamic Page Content */}
        <section>
          {renderPage()}
        </section>

      </main>

    </div>
  );
}

export default App;
