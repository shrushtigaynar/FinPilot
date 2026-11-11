
import { useEffect, useState } from 'react';
import axios from 'axios';

import API_BASE_URL from '../config/api';

import RecentTransactions from '../components/RecentTransactions';
import CashFlowChart from '../components/CashFlowChart';
import ProfitLossChart from '../components/ProfitLossChart';
import StatCard from '../components/StatCard';

import {
  Wallet,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

function Dashboard() {
  const [summary, setSummary] = useState({});
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/transactions/summary`
        );

        setSummary(response.data.data || {});
      } catch (err) {
        console.error('Dashboard summary error:', err);
        setError('Unable to load financial summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const selectedSummary = summary[currency] || {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    totalTransactions: 0,
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-8">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening with your finances.
          </p>
        </div>

        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
          Loading financial summary...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-white p-6 text-rose-600">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            <StatCard
              title="Total Revenue"
              amount={formatAmount(selectedSummary.totalIncome)}
              change="Completed income"
              icon={TrendingUp}
              color="bg-emerald-100 text-emerald-600"
            />

            <StatCard
              title="Total Expenses"
              amount={formatAmount(selectedSummary.totalExpenses)}
              change="Completed expenses"
              icon={Wallet}
              color="bg-amber-100 text-amber-600"
              trendColor="text-amber-600"
            />

            <StatCard
              title="Net Profit"
              amount={formatAmount(selectedSummary.balance)}
              change="Income minus expenses"
              icon={TrendingDown}
              color="bg-blue-100 text-blue-600"
            />

          </div>

          <p className="text-xs text-slate-500">
            Based on {selectedSummary.totalTransactions} completed transactions in {currency}.
          </p>
        </>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        <div className="min-h-72 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Cash Flow
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Your incoming and outgoing cash over time.
          </p>

          <div className="mt-6">
            <CashFlowChart />
          </div>
        </div>

        <div className="min-h-72 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            Profit & Loss
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Compare your revenue and expenses.
          </p>

          <div className="mt-6">
            <ProfitLossChart />
          </div>
        </div>

      </div>

      <RecentTransactions />

    </div>
  );
}

export default Dashboard;
