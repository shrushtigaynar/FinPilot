
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Search,
  Plus,
  Eye,
  X,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { PayPalButtons } from '@paypal/react-paypal-js';

const API_URL = 'http://localhost:5000/api/invoices';

function InvoiceManagement() {
  const [invoiceList, setInvoiceList] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newInvoice, setNewInvoice] = useState({
    client: '',
    amount: '',
    dueDate: '',
  });

  // Fetch invoices from MongoDB
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(API_URL);
      setInvoiceList(response.data.data);
    } catch (err) {
      console.error('Invoice fetching error:', err);
      setError('Unable to load invoices. Check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat(
      currency === 'INR' ? 'en-IN' : 'en-US',
      {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  };

  // Format dates
  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Determine invoice status
  const getStatus = (invoice) => {
    if (invoice.status === 'paid') return 'Paid';

    if (
      invoice.status === 'overdue' ||
      new Date(invoice.dueDate) < new Date(new Date().toDateString())
    ) {
      return 'Overdue';
    }

    return 'Pending';
  };

  // Search invoices
  const filteredInvoices = invoiceList.filter((invoice) =>
    invoice.client.toLowerCase().includes(search.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const paidInvoices = invoiceList.filter(
    (invoice) => invoice.status === 'paid'
  );

  const pendingInvoices = invoiceList.filter(
    (invoice) => invoice.status !== 'paid'
  );

  // USD totals only
  const paidAmount = paidInvoices
    .filter((invoice) => invoice.currency === 'USD')
    .reduce((total, invoice) => total + invoice.amount, 0);

  const pendingAmount = pendingInvoices
    .filter((invoice) => invoice.currency === 'USD')
    .reduce((total, invoice) => total + invoice.amount, 0);

  // Delete any invoice, including paid invoices
  const handleDeleteInvoice = async (invoice) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${invoice.invoiceNumber}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError('');

      await axios.delete(`${API_URL}/${invoice._id}`);

      setInvoiceList((prev) =>
        prev.filter((item) => item._id !== invoice._id)
      );

      if (selectedInvoice?._id === invoice._id) {
        setSelectedInvoice(null);
      }
    } catch (err) {
      console.error('Invoice deletion error:', err);
      setError(
        err.response?.data?.message || 'Unable to delete invoice.'
      );
    }
  };

  // Create invoice in MongoDB
  const handleCreateInvoice = async (e) => {
    e.preventDefault();

    try {
      setError('');

      const response = await axios.post(API_URL, {
        client: newInvoice.client,
        amount: Number(newInvoice.amount),
        dueDate: newInvoice.dueDate,
      });

      setInvoiceList((prev) => [
        response.data.data,
        ...prev,
      ]);

      setNewInvoice({
        client: '',
        amount: '',
        dueDate: '',
      });

      setShowForm(false);
    } catch (err) {
      console.error('Invoice creation error:', err);
      setError(
        err.response?.data?.message || 'Unable to create invoice.'
      );
    }
  };

  // Create PayPal order
  const handleCreatePayPalOrder = async () => {
    setPaymentMessage('');

    if (!selectedInvoice?._id) {
      throw new Error('Please select a valid invoice.');
    }

    const response = await fetch(
      'http://localhost:5000/api/paypal/create-order',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice._id,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success || !result.data?.orderId) {
      throw new Error(result.message || 'Unable to create PayPal order');
    }

    return result.data.orderId;
  };

  // Capture payment and update invoice
  const handlePayPalApproval = async (data) => {
    setIsProcessing(true);
    setPaymentMessage('Verifying payment with PayPal...');

    try {
      const response = await fetch(
        'http://localhost:5000/api/paypal/capture-order',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.orderID,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Payment capture failed');
      }

      setPaymentMessage(
        'Payment successful! Invoice marked as PAID.'
      );

      await fetchInvoices();

      if (result.data?.invoice) {
        setSelectedInvoice(result.data.invoice);
      }
    } catch (err) {
      console.error('Payment capture error:', err);
      setPaymentMessage(
        err.message || 'Unable to complete payment.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Invoice status styling
  const statusStyle = (status) => {
    if (status === 'Paid') {
      return 'bg-emerald-100 text-emerald-700';
    }

    if (status === 'Overdue') {
      return 'bg-rose-100 text-rose-700';
    }

    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="space-y-7">

      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Invoice Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create invoices and track your payments.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchInvoices}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
          </button>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <Plus size={18} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Invoices</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {invoiceList.length}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid Amount (USD)</p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-600">
            {formatCurrency(paidAmount, 'USD')}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Amount (USD)</p>
          <h2 className="mt-2 text-2xl font-bold text-amber-600">
            {formatCurrency(pendingAmount, 'USD')}
          </h2>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="font-semibold text-slate-800">
              Recent Invoices
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your invoices stored in MongoDB.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2">
            <Search size={17} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-40 text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-4">Invoice ID</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Due Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.map((invoice) => {
                const status = getStatus(invoice);

                return (
                  <tr key={invoice._id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {invoice.invoiceNumber}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {invoice.client}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(invoice.invoiceDate)}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(invoice.dueDate)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(status)}`}>
                        {status}
                      </span>
                    </td>

                    {/* View and Delete Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setPaymentMessage('');
                          }}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600"
                          title="View invoice"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Delete button for ALL invoices */}
                        <button
                          onClick={() => handleDeleteInvoice(invoice)}
                          className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                          title="Delete invoice"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                    No invoices found. Create your first invoice.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Create New Invoice
              </h2>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Client Name
                </label>
                <input
                  required
                  value={newInvoice.client}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, client: e.target.value })
                  }
                  placeholder="Enter client name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Invoice Amount ($ USD)
                </label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newInvoice.amount}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, amount: e.target.value })
                  }
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Due Date
                </label>
                <input
                  required
                  type="date"
                  min={new Date().toLocaleDateString('en-CA')}
                  value={newInvoice.dueDate}
                  onChange={(e) =>
                    setNewInvoice({ ...newInvoice, dueDate: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-500 py-3 font-semibold text-white transition hover:bg-emerald-600"
              >
                Save Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Invoice Details
              </h2>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <p>
                <span className="text-slate-500">Invoice ID:</span>{' '}
                <strong>{selectedInvoice.invoiceNumber}</strong>
              </p>

              <p>
                <span className="text-slate-500">Client:</span>{' '}
                <strong>{selectedInvoice.client}</strong>
              </p>

              <p>
                <span className="text-slate-500">Invoice Date:</span>{' '}
                <strong>{formatDate(selectedInvoice.invoiceDate)}</strong>
              </p>

              <p>
                <span className="text-slate-500">Due Date:</span>{' '}
                <strong>{formatDate(selectedInvoice.dueDate)}</strong>
              </p>

              <p>
                <span className="text-slate-500">Amount:</span>{' '}
                <strong>
                  {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                </strong>
              </p>

              <p>
                <span className="text-slate-500">Status:</span>{' '}
                <strong>{getStatus(selectedInvoice)}</strong>
              </p>
            </div>

            {/* PayPal Sandbox Payment */}
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-semibold text-slate-800">
                PayPal Sandbox Payment
              </h3>

              <p className="my-2 text-sm text-slate-600">
                Invoice amount: {formatCurrency(
                  selectedInvoice.amount,
                  selectedInvoice.currency
                )}
              </p>

              {selectedInvoice.status === 'paid' ? (
                <p className="font-semibold text-emerald-700">
                  Payment completed. This invoice is paid.
                </p>
              ) : selectedInvoice.currency !== 'USD' ? (
                <p className="text-sm text-amber-700">
                  PayPal Sandbox checkout currently supports USD invoices.
                  Create a new USD invoice to test payment.
                </p>
              ) : (
                <PayPalButtons
                  style={{ layout: 'vertical', shape: 'rect' }}
                  disabled={isProcessing}
                  createOrder={async () => {
                    try {
                      return await handleCreatePayPalOrder();
                    } catch (err) {
                      setPaymentMessage(err.message);
                      throw err;
                    }
                  }}
                  onApprove={handlePayPalApproval}
                  onCancel={() => setPaymentMessage('Payment was cancelled.')}
                  onError={(err) => {
                    console.error('PayPal checkout error:', err);
                    setPaymentMessage('PayPal checkout failed. Please try again.');
                  }}
                />
              )}

              {isProcessing && (
                <p className="mt-3 text-sm text-blue-700">
                  Processing payment...
                </p>
              )}

              {paymentMessage && (
                <p className="mt-3 text-sm font-medium text-slate-700">
                  {paymentMessage}
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="mt-6 w-full rounded-lg bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoiceManagement;
