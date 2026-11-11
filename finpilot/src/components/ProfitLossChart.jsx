
import { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function ProfitLossChart() {
  const [transactions, setTransactions] = useState([]);
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/transactions`
        );

        setTransactions(response.data.data || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load profit and loss data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));

    return {
      month: date.getMonth(),
      year: date.getFullYear(),
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
    };
  });

  const completedTransactions = transactions.filter(
    (transaction) =>
      transaction.status === 'completed' &&
      transaction.currency === currency
  );

  const monthlyIncome = months.map((month) =>
    completedTransactions
      .filter((t) => {
        const date = new Date(t.transactionDate);
        return (
          t.type === 'income' &&
          date.getMonth() === month.month &&
          date.getFullYear() === month.year
        );
      })
      .reduce((total, t) => total + t.amount, 0)
  );

  const monthlyExpenses = months.map((month) =>
    completedTransactions
      .filter((t) => {
        const date = new Date(t.transactionDate);
        return (
          t.type === 'expense' &&
          date.getMonth() === month.month &&
          date.getFullYear() === month.year
        );
      })
      .reduce((total, t) => total + t.amount, 0)
  );

  const data = {
    labels: months.map((month) => month.label),
    datasets: [
      {
        label: 'Revenue',
        data: monthlyIncome,
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: monthlyExpenses,
        borderColor: '#f59e0b',
        backgroundColor: '#f59e0b',
        tension: 0.4,
      },
    ],
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: {
          callback: (value) =>
            currency === 'INR'
              ? `₹${value / 1000}k`
              : `$${value / 1000}k`,
        },
      },
    },
  };

  if (loading) return <p className="text-sm text-slate-500">Loading profit and loss...</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>

      <div className="h-72">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default ProfitLossChart;
