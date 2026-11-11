
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  AlertTriangle,
  Activity,
  RefreshCw,
  X,
} from 'lucide-react';
import API_BASE_URL from '../config/api';

function TransactionIntelligence() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch actual transactions from MongoDB through the backend
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${API_BASE_URL}/api/transactions`
      );

      const actualTransactions = response.data.data.map((item) => ({
        id: item._id,
        name: item.merchant,
        category: item.category,
        date: item.transactionDate,
        amount: item.amount,
        currency: item.currency || 'INR',
        type: item.type === 'income' ? 'Credit' : 'Debit',
        risk: 'Not Assessed',
        status: item.status,
        description: item.description,
        paymentMethod: item.paymentMethod,
        paymentProvider: item.paymentProvider,
        providerOrderId: item.providerOrderId,
      }));

      setTransactions(actualTransactions);
    } catch (err) {
      console.error('Transaction fetching error:', err);
      setError(
        'Unable to load transactions. Please check whether your backend and MongoDB are running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Currency formatting
  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat(
      currency === 'INR' ? 'en-IN' : 'en-US',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate totals separately for each currency
  const getTotal = (type, currency) => {
    return transactions
      .filter(
        (item) =>
          item.type === type &&
          item.currency === currency &&
          item.status === 'completed'
      )
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const totalINRIncome = getTotal('Credit', 'INR');
  const totalINRExpense = getTotal('Debit', 'INR');
  const totalUSDIncome = getTotal('Credit', 'USD');
  const totalUSDExpense = getTotal('Debit', 'USD');

  // Search and risk filtering
  const filteredTransactions = transactions.filter((transaction) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      transaction.name?.toLowerCase().includes(searchText) ||
      transaction.id?.toLowerCase().includes(searchText) ||
      transaction.category?.toLowerCase().includes(searchText);

    const matchesRisk =
      riskFilter === 'All' || transaction.risk === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const statusStyle = (status) => {
    if (status === 'failed' || status === 'refunded') {
      return 'bg-rose-100 text-rose-700';
    }

    if (status === 'pending') {
      return 'bg-amber-100 text-amber-700';
    }

    return 'bg-emerald-100 text-emerald-700';
  };

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Transaction Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor your actual incoming and outgoing transactions.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading transactions...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          <p>{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Money In</p>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <ArrowDownLeft size={21} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {formatCurrency(totalINRIncome, 'INR')}
              </h2>

              {totalUSDIncome > 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(totalUSDIncome, 'USD')}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Money Out</p>
                <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                  <ArrowUpRight size={21} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {formatCurrency(totalINRExpense, 'INR')}
              </h2>

              {totalUSDExpense > 0 && (
                <p className="mt-1 text-sm text-slate-500">
                  {formatCurrency(totalUSDExpense, 'USD')}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Total Transactions</p>
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Activity size={21} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {transactions.length}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Records retrieved from MongoDB
              </p>
            </div>

          </div>

          {/* Risk Information */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <AlertTriangle className="mt-1 shrink-0 text-amber-600" size={21} />
            <div>
              <h3 className="font-semibold text-amber-800">
                Risk assessment not connected
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                Transactions are displayed using real stored records.
                Automated fraud detection has not yet been implemented.
              </p>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Transaction Records
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search and review your stored transactions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
                  <Search size={17} className="text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-32 text-sm outline-none"
                  />
                </div>

                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
                >
                  <option value="All">All Risks</option>
                  <option value="Not Assessed">Not Assessed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">

                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Transaction</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Risk</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {transaction.type === 'Credit' ? (
                            <ArrowDownLeft size={18} className="text-emerald-600" />
                          ) : (
                            <ArrowUpRight size={18} className="text-rose-600" />
                          )}

                          <div>
                            <p className="font-semibold text-slate-800">
                              {transaction.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {transaction.id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {transaction.category}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {formatDate(transaction.date)}
                      </td>

                      <td className={`px-5 py-4 font-semibold ${
                        transaction.type === 'Credit'
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}>
                        {transaction.type === 'Credit' ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {transaction.risk}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedTransaction(transaction)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600"
                          title="View transaction"
                        >
                          <Activity size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>

          {/* Transaction Details Modal */}
          {selectedTransaction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    Transaction Details
                  </h2>

                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={21} />
                  </button>
                </div>

                <div className="space-y-4 break-words text-sm">
                  <p>
                    <span className="text-slate-500">Transaction ID:</span>{' '}
                    <strong>{selectedTransaction.id}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Merchant:</span>{' '}
                    <strong>{selectedTransaction.name}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Category:</span>{' '}
                    <strong>{selectedTransaction.category}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Date:</span>{' '}
                    <strong>{formatDate(selectedTransaction.date)}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Amount:</span>{' '}
                    <strong>
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                    </strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Type:</span>{' '}
                    <strong>{selectedTransaction.type}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Payment Method:</span>{' '}
                    <strong>{selectedTransaction.paymentMethod || 'N/A'}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Payment Provider:</span>{' '}
                    <strong>{selectedTransaction.paymentProvider || 'N/A'}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Risk Level:</span>{' '}
                    <strong>Not Assessed</strong>
                  </p>
                  <p>
                    <span className="text-slate-500">Status:</span>{' '}
                    <strong>{selectedTransaction.status}</strong>
                  </p>
                  {selectedTransaction.description && (
                    <p>
                      <span className="text-slate-500">Description:</span>{' '}
                      <strong>{selectedTransaction.description}</strong>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="mt-6 w-full rounded-lg bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800"
                >
                  Close
                </button>

              </div>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-slate-400">
        Transaction records are retrieved from MongoDB. Risk assessment is not
        currently powered by a live fraud detection model.
      </p>

    </div>
  );
}

export default TransactionIntelligence;
