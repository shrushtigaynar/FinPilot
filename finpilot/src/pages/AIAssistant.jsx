
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bot, Send, Sparkles, User } from 'lucide-react';

function AIAssistant() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const suggestions = [
    'Analyze my monthly expenses',
    'How can I improve my cash flow?',
    'Summarize my financial performance',
    'Identify unusual transactions',
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/transactions'
        );
        setTransactions(response.data.data || []);
      } catch (error) {
        console.error('Assistant data error:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatAmount = (amount, currency) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

  const getFinancialResponse = (question) => {
    const q = question.toLowerCase();

    const completed = transactions.filter(
      (t) => t.status === 'completed'
    );

    const currency = /\busd\b|dollar|\$/i.test(question) ? 'USD' : 'INR';

    const selected = completed.filter(
      (t) => (t.currency || 'INR') === currency
    );

    const income = selected
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = selected
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    if (dataLoading) {
      return 'Please wait while I load your financial records.';
    }

    if (transactions.length === 0) {
      return 'I could not find any transactions in your database yet. Add some transactions first, and I can analyze them.';
    }

    if (
      q.includes('pending') ||
      q.includes('incomplete')
    ) {
      const pending = transactions.filter(
        (t) => t.status === 'pending'
      );

      if (!pending.length) {
        return 'You currently have no pending transactions.';
      }

      return `You have ${pending.length} pending transaction(s):\n\n${pending
        .map(
          (t) =>
            `• ${t.merchant}: ${formatAmount(t.amount, t.currency)}`
        )
        .join('\n')}`;
    }

    if (
      q.includes('largest') ||
      q.includes('biggest') ||
      q.includes('highest')
    ) {
      const largest = selected
        .filter((t) => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)[0];

      return largest
        ? `Your largest completed expense in ${currency} is ${largest.merchant}, amounting to ${formatAmount(largest.amount, currency)}.`
        : `No completed expenses were found in ${currency}.`;
    }

    if (
      q.includes('unusual') ||
      q.includes('suspicious') ||
      q.includes('fraud') ||
      q.includes('risk')
    ) {
      const largestExpenses = selected
        .filter((t) => t.type === 'expense')
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

      if (!largestExpenses.length) {
        return `There are no completed expenses to review in ${currency}.`;
      }

      return `Here are your three largest completed expenses in ${currency} that you may want to review:\n\n${largestExpenses
        .map(
          (t) =>
            `• ${t.merchant}: ${formatAmount(t.amount, currency)}`
        )
        .join('\n')}\n\nThese are amount-based review suggestions, not verified fraud alerts.`;
    }

    if (
      q.includes('monthly') ||
      q.includes('month') ||
      q.includes('cash flow')
    ) {
      const now = new Date();
      const monthTransactions = selected.filter((t) => {
        const date = new Date(t.transactionDate);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      });

      const monthIncome = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return `Your financial activity for this month (${currency}):\n\n• Income: ${formatAmount(monthIncome, currency)}\n• Expenses: ${formatAmount(monthExpenses, currency)}\n• Net cash flow: ${formatAmount(monthIncome - monthExpenses, currency)}\n\nYou have ${monthTransactions.length} completed transaction(s) this month.`;
    }

    if (
      q.includes('expense') ||
      q.includes('spend') ||
      q.includes('spent')
    ) {
      return `Your total completed expenses in ${currency} are ${formatAmount(expenses, currency)}.`;
    }

    if (
      q.includes('income') ||
      q.includes('revenue') ||
      q.includes('earning')
    ) {
      return `Your total completed income in ${currency} is ${formatAmount(income, currency)}.`;
    }

    if (
      q.includes('profit') ||
      q.includes('balance') ||
      q.includes('performance') ||
      q.includes('summar')
    ) {
      return `Here is your financial summary in ${currency}:\n\n• Total income: ${formatAmount(income, currency)}\n• Total expenses: ${formatAmount(expenses, currency)}\n• Net balance: ${formatAmount(balance, currency)}\n• Completed transactions: ${selected.length}\n\n${balance >= 0 ? 'Your recorded income is currently higher than your expenses.' : 'Your recorded expenses are currently higher than your income.'}`;
    }

    return 'I can help you analyze your financial records. Try asking about your income, expenses, largest expense, pending transactions, monthly cash flow or financial performance.';
  };

  const handleSend = (text = message) => {
    if (!text.trim() || loading) return;

    const userQuestion = text.trim();

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userQuestion },
    ]);

    setMessage('');
    setLoading(true);

    // Generate the response from locally fetched transaction data.
    const answer = getFinancialResponse(userQuestion);

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: answer },
    ]);

    setLoading(false);
  };

  return (
    <div className="flex min-h-[75vh] flex-col rounded-2xl border border-slate-200 bg-white">

      <div className="flex items-center gap-3 border-b border-slate-200 p-6">
        <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600">
          <Bot size={25} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            FinPilot Financial Assistant
          </h1>
          <p className="text-sm text-slate-500">
            Your personal financial insights companion
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">

        {messages.length === 0 ? (
          <div className="m-auto text-center">
            <Sparkles size={36} className="mx-auto mb-4 text-emerald-500" />

            <h2 className="text-2xl font-bold text-slate-800">
              How can I help you today?
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Ask questions about your actual financial transactions.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  onClick={() => handleSend(item)}
                  disabled={loading || dataLoading}
                  className="rounded-xl border border-slate-200 p-4 text-left text-sm text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((item, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                item.role === 'user' ? 'justify-end' : ''
              }`}
            >
              {item.role === 'assistant' && (
                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`max-w-[75%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${
                  item.role === 'user'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {item.text}
              </div>

              {item.role === 'user' && (
                <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                  <User size={18} />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <p className="text-sm text-slate-500">
            Analyzing your financial records...
          </p>
        )}

        {dataLoading && (
          <p className="text-center text-xs text-slate-400">
            Connecting to financial records...
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-3 border-t border-slate-200 p-5"
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask FinPilot anything..."
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        />

        <button
          type="submit"
          disabled={loading || dataLoading || !message.trim()}
          className="rounded-xl bg-emerald-500 px-4 text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={19} />
        </button>
      </form>

      <p className="border-t border-slate-100 px-5 py-2 text-center text-xs text-slate-400">
        Rule-based financial insights using your stored transactions. Not an AI model or fraud detection system.
      </p>
    </div>
  );
}

export default AIAssistant;
