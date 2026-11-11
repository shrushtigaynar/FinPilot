
import { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

function RecentTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/transactions`
        );

        setTransactions((response.data.data || []).slice(0, 5));
      } catch (err) {
        console.error('Transaction fetching error:', err);
        setError('Unable to load transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatAmount = (amount, currency, type) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

    return `${type === 'income' ? '+' : '-'}${formatted}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900">
          Recent Transactions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your latest financial activities
        </p>
      </div>

      {loading ? (
        <p className="p-6 text-sm text-slate-500">
          Loading transactions...
        </p>
      ) : error ? (
        <p className="p-6 text-sm text-rose-600">{error}</p>
      ) : transactions.length === 0 ? (
        <p className="p-6 text-sm text-slate-500">
          No transactions found.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-lg p-2 ${
                          transaction.type === 'income'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <ArrowDownLeft size={18} />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </div>

                      <span className="font-semibold text-slate-800">
                        {transaction.merchant}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {transaction.category}
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {formatDate(transaction.transactionDate)}
                  </td>

                  <td
                    className={`px-6 py-4 text-right font-bold ${
                      transaction.type === 'income'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {formatAmount(
                      transaction.amount,
                      transaction.currency,
                      transaction.type
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RecentTransactions;
