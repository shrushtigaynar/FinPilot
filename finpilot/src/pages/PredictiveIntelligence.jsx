
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Lightbulb,
  CalendarDays,
  RefreshCw,
} from 'lucide-react';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/transactions`;

function PredictiveIntelligence() {
  const [transactions, setTransactions] = useState([]);
  const [period, setPeriod] = useState('3');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch real transactions from MongoDB through backend
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(API_URL);
      setTransactions(response.data.data || []);
    } catch (err) {
      console.error('Transaction fetching error:', err);
      setError('Unable to load financial data. Check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Currency formatting
  const formatCurrency = (amount, selectedCurrency = currency) => {
    return new Intl.NumberFormat(
      selectedCurrency === 'INR' ? 'en-IN' : 'en-US',
      {
        style: 'currency',
        currency: selectedCurrency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  };

  // Calculate financial data
  const analysis = useMemo(() => {
    const completedTransactions = transactions.filter(
      (transaction) =>
        transaction.status === 'completed' &&
        transaction.currency === currency
    );

    const incomeTransactions = completedTransactions.filter(
      (transaction) => transaction.type === 'income'
    );

    const expenseTransactions = completedTransactions.filter(
      (transaction) => transaction.type === 'expense'
    );

    const totalIncome = incomeTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0
    );

    const totalExpenses = expenseTransactions.reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0
    );

    const balance = totalIncome - totalExpenses;

    // Group transactions by calendar month
    const monthlyData = {};

    completedTransactions.forEach((transaction) => {
      const date = new Date(
        transaction.transactionDate || transaction.createdAt
      );

      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          income: 0,
          expenses: 0,
        };
      }

      if (transaction.type === 'income') {
        monthlyData[key].income += Number(transaction.amount || 0);
      } else if (transaction.type === 'expense') {
        monthlyData[key].expenses += Number(transaction.amount || 0);
      }
    });

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();

    const history = sortedMonths.map((key) => {
      const [year, month] = key.split('-').map(Number);

      const date = new Date(year, month - 1, 1);

      return {
        key,
        month: date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        income: monthlyData[key].income,
        expenses: monthlyData[key].expenses,
      };
    });

    // Forecast needs at least 3 different months of transaction history
    const hasEnoughHistory = history.length >= 3;

    // Use the last 3 calendar months as the baseline
    const lastThreeMonths = [];

    if (hasEnoughHistory) {
      const latestMonth = new Date(
        `${sortedMonths[sortedMonths.length - 1]}-01T00:00:00`
      );

      for (let i = 2; i >= 0; i--) {
        const date = new Date(
          latestMonth.getFullYear(),
          latestMonth.getMonth() - i,
          1
        );

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, '0')}`;

        lastThreeMonths.push(
          monthlyData[key] || { income: 0, expenses: 0 }
        );
      }
    }

    const averageIncome = hasEnoughHistory
      ? lastThreeMonths.reduce((sum, item) => sum + item.income, 0) / 3
      : 0;

    const averageExpenses = hasEnoughHistory
      ? lastThreeMonths.reduce((sum, item) => sum + item.expenses, 0) / 3
      : 0;

    return {
      totalIncome,
      totalExpenses,
      balance,
      history,
      hasEnoughHistory,
      averageIncome,
      averageExpenses,
      completedTransactions,
      incomeTransactions,
      expenseTransactions,
    };
  }, [transactions, currency]);

  // Generate future projections
  const forecast = useMemo(() => {
    if (!analysis.hasEnoughHistory) return [];

    const months = Number(period);
    const result = [];
    const today = new Date();

    for (let i = 1; i <= months; i++) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() + i,
        1
      );

      result.push({
        month: date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        revenue: analysis.averageIncome,
        expenses: analysis.averageExpenses,
      });
    }

    return result;
  }, [analysis, period]);

  // Forecast totals
  const predictedRevenue = forecast.reduce(
    (total, item) => total + item.revenue,
    0
  );

  const predictedExpenses = forecast.reduce(
    (total, item) => total + item.expenses,
    0
  );

  // Financial runway: balance divided by average monthly expenses
  const runway =
    analysis.hasEnoughHistory && analysis.averageExpenses > 0
      ? analysis.balance > 0
        ? analysis.balance / analysis.averageExpenses
        : 0
      : null;

  // Generate alerts using actual transaction data
  const alerts = useMemo(() => {
    const result = [];

    const pendingTransactions = transactions.filter(
      (transaction) =>
        transaction.status === 'pending' &&
        transaction.currency === currency
    );

    const failedTransactions = transactions.filter(
      (transaction) =>
        transaction.status === 'failed' &&
        transaction.currency === currency
    );

    if (pendingTransactions.length > 0) {
      result.push({
        title: 'Pending Transactions',
        message: `${pendingTransactions.length} transaction(s) are awaiting completion.`,
        type: 'warning',
      });
    }

    if (failedTransactions.length > 0) {
      result.push({
        title: 'Failed Transactions',
        message: `${failedTransactions.length} transaction(s) have failed. Review their status.`,
        type: 'danger',
      });
    }

    if (
      analysis.hasEnoughHistory &&
      analysis.averageExpenses > analysis.averageIncome
    ) {
      result.push({
        title: 'Expenses Exceed Income',
        message: 'Your average monthly expenses are higher than your average income.',
        type: 'danger',
      });
    }

    if (
      analysis.hasEnoughHistory &&
      analysis.balance <= 0 &&
      analysis.averageExpenses > 0
    ) {
      result.push({
        title: 'Low Financial Balance',
        message: 'Your recorded income does not currently exceed your expenses.',
        type: 'warning',
      });
    }

    if (result.length === 0) {
      result.push({
        title: 'No Critical Alerts',
        message: 'No issues were identified from the available transaction records.',
        type: 'success',
      });
    }

    return result;
  }, [transactions, currency, analysis]);

  // Generate insights from actual data
  const insights = useMemo(() => {
    if (analysis.completedTransactions.length === 0) {
      return [
        {
          title: 'Waiting for Financial Data',
          message: 'Add income and expense transactions to start receiving financial insights.',
          type: 'info',
        },
      ];
    }

    const result = [];

    if (!analysis.hasEnoughHistory) {
      result.push({
        title: 'Build Transaction History',
        message: 'Record transactions across at least three different months to unlock trend-based forecasts.',
        type: 'info',
      });
    } else {
      if (analysis.averageIncome > analysis.averageExpenses) {
        result.push({
          title: 'Positive Cash Flow',
          message: 'Your recent average monthly income is higher than your expenses. Continue monitoring this pattern.',
          type: 'success',
        });
      } else {
        result.push({
          title: 'Review Your Spending',
          message: 'Your recent average monthly expenses are equal to or higher than your income. Consider reviewing costs.',
          type: 'warning',
        });
      }

      if (runway !== null && runway > 0) {
        result.push({
          title: 'Financial Runway',
          message: `Based on your recorded balance and recent average expenses, your estimated runway is ${runway.toFixed(1)} months.`,
          type: 'info',
        });
      }
    }

    return result;
  }, [analysis, runway]);

  // Chart bar scaling
  const maximumValue = Math.max(
    ...forecast.map((item) => Math.max(item.revenue, item.expenses)),
    1
  );

  const insightStyle = (type) => {
    if (type === 'success') {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    if (type === 'danger') {
      return 'border-rose-200 bg-rose-50 text-rose-700';
    }

    if (type === 'warning') {
      return 'border-amber-200 bg-amber-50 text-amber-700';
    }

    return 'border-blue-200 bg-blue-50 text-blue-700';
  };

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
            <BrainCircuit size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Predictive Intelligence
            </h1>
            <p className="text-sm text-slate-500">
              Understand financial trends using your transaction history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
          </select>

          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
            title="Refresh data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
          Loading financial data...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Predicted Revenue ({period} months)
                </p>
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
                  <TrendingUp size={21} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {analysis.hasEnoughHistory
                  ? formatCurrency(predictedRevenue)
                  : 'Insufficient data'}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {analysis.hasEnoughHistory
                  ? 'Estimated using recent monthly averages'
                  : 'Need at least 3 months of history'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Financial Runway</p>
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                  <Wallet size={21} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {runway === null
                  ? 'Not available'
                  : `${runway.toFixed(1)} Months`}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {runway === null
                  ? 'Requires sufficient history and recorded expenses'
                  : 'Based on recorded balance and average expenses'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Financial Alerts</p>
                <div className="rounded-xl bg-rose-100 p-3 text-rose-600">
                  <AlertTriangle size={21} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                {alerts.filter((alert) => alert.type !== 'success').length}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Based on your transaction records
              </p>
            </div>
          </div>

          {/* Actual Financial Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Actual Financial Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Completed transactions recorded in MongoDB.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Total Income</p>
                <p className="mt-1 text-xl font-bold text-emerald-600">
                  {formatCurrency(analysis.totalIncome)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Total Expenses</p>
                <p className="mt-1 text-xl font-bold text-amber-600">
                  {formatCurrency(analysis.totalExpenses)}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Net Balance</p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {formatCurrency(analysis.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Revenue & Expense Forecast
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Estimated from your recent monthly averages.
                </p>
              </div>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="3">Next 3 Months</option>
                <option value="6">Next 6 Months</option>
              </select>
            </div>

            {!analysis.hasEnoughHistory ? (
              <div className="mt-8 rounded-xl bg-amber-50 p-6 text-center">
                <AlertTriangle className="mx-auto text-amber-600" size={30} />

                <h3 className="mt-3 font-semibold text-slate-800">
                  Not enough historical data
                </h3>

                <p className="mt-2 text-sm text-slate-600">
                  At least three different months of completed transactions
                  are needed to generate a forecast. Keep recording your
                  income and expenses.
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  Months with recorded transactions: {analysis.history.length}
                </p>
              </div>
            ) : (
              <>
                <div className="mt-8 space-y-7">
                  {forecast.map((item) => (
                    <div key={item.month}>
                      <div className="mb-3 flex flex-wrap justify-between gap-2 text-sm">
                        <span className="font-semibold text-slate-700">
                          {item.month}
                        </span>

                        <span className="text-slate-500">
                          Revenue: {formatCurrency(item.revenue)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{
                              width: `${(item.revenue / maximumValue) * 100}%`,
                            }}
                          />
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                            style={{
                              width: `${(item.expenses / maximumValue) * 100}%`,
                            }}
                          />
                        </div>
                      </div>

                      <p className="mt-2 text-right text-xs text-slate-400">
                        Expenses: {formatCurrency(item.expenses)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-5 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    Predicted Revenue
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    Predicted Expenses
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Financial Alerts */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={22} />
              <h2 className="text-lg font-bold text-slate-900">
                Financial Alerts
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border p-5 ${insightStyle(alert.type)}`}
                >
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {alert.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Insights */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="text-amber-500" size={22} />
              <h2 className="text-lg font-bold text-slate-900">
                Financial Insights
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`rounded-2xl border p-5 ${insightStyle(insight.type)}`}
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb size={20} />
                    <h3 className="font-semibold">{insight.title}</h3>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {insight.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Data */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Historical Transaction Data
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monthly completed income and expenses.
            </p>

            {analysis.history.length === 0 ? (
              <p className="mt-5 text-sm text-slate-500">
                No completed transactions found for {currency}.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {analysis.history.map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"
                  >
                    <span className="font-medium text-slate-700">
                      {item.month}
                    </span>

                    <div className="text-right text-sm">
                      <p className="text-emerald-600">
                        Income: {formatCurrency(item.income)}
                      </p>
                      <p className="text-amber-600">
                        Expenses: {formatCurrency(item.expenses)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="flex items-start gap-2 text-xs leading-5 text-slate-400">
            <CalendarDays size={15} className="mt-0.5 shrink-0" />
            Forecasts are estimates based on the average of the last three
            calendar months. They are not generated by a trained AI/ML model
            and should not be treated as guaranteed financial outcomes.
          </p>
        </>
      )}
    </div>
  );
}

export default PredictiveIntelligence;
