import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    paymentMethod: 'all'
  });
  const [selectedLoan, setSelectedLoan] = useState('');
  const [loans, setLoans] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchUserLoans();
  }, []);

  useEffect(() => {
    filterTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, filters, selectedLoan]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/api/transactions/my-transactions');
      setTransactions(response.data.data.transactions);
    } catch (error) {
      setError('Failed to fetch transactions');
      
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLoans = async () => {
    try {
      const response = await axios.get('/api/loans/my-loans');
      setLoans(response.data.data.loans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }

    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(transaction => transaction.paymentMethod === filters.paymentMethod);
    }

    if (selectedLoan) {
      filtered = filtered.filter(transaction => 
        transaction.loan && transaction.loan._id === selectedLoan
      );
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handlePayEmi = async (loan) => {
    setPaymentLoading(loan._id);
    try {
      const response = await axios.post('/api/payments/create-order', {
        loanId: loan._id,
        amount: loan.emi,
        paymentMethod: 'upi'
      });

      // In a real implementation, you would redirect to Cashfree payment page
      // For demo purposes, we'll simulate payment success
      const { paymentSessionId, transaction } = response.data.data;
      
      alert(`Redirecting to payment gateway... Session ID: ${paymentSessionId}`);
      
      // Simulate payment success after 2 seconds
      setTimeout(() => {
        handlePaymentSuccess(transaction.transactionId);
      }, 2000);

    } catch (error) {
      toast.error('Failed to initiate payment');
      console.error('Payment error:', error);
    } finally {
      setPaymentLoading(null);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handlePaymentSuccess = async (transactionId) => {
    try {
      // Update transaction status to completed
      await fetchTransactions(); // Refresh transactions list
      toast.success('Payment completed successfully!');
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'loan_disbursement': return 'text-blue-600';
      case 'emi_payment': return 'text-green-600';
      case 'penalty': return 'text-red-600';
      case 'refund': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'loan_disbursement': return 'Loan Disbursement';
      case 'emi_payment': return 'EMI Payment';
      case 'penalty': return 'Penalty';
      case 'refund': return 'Refund';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {error && (
          <div className="px-4 py-3 mb-6 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Filters</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Transaction Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value="loan_disbursement">Loan Disbursement</option>
                  <option value="emi_payment">EMI Payment</option>
                  <option value="penalty">Penalty</option>
                  <option value="refund">Refund</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Payment Method
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Methods</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Loan Account
                </label>
                <select
                  value={selectedLoan}
                  onChange={(e) => setSelectedLoan(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Loans</option>
                  {loans.map(loan => (
                    <option key={loan._id} value={loan._id}>
                      {loan.loanAccountNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Active Loans for EMI Payment */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Pay EMI</h3>
            <div className="space-y-4">
              {loans.filter(loan => loan.status === 'active').map(loan => (
                <div key={loan._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{loan.loanAccountNumber}</h4>
                    <p className="text-sm text-gray-600">
                      EMI: ₹{loan.emi} • Due: {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePayEmi(loan)}
                    disabled={paymentLoading === loan._id}
                    className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {paymentLoading === loan._id ? 'Processing...' : 'Pay EMI'}
                  </button>
                </div>
              ))}
              {loans.filter(loan => loan.status === 'active').length === 0 && (
                <p className="py-4 text-center text-gray-500">No active loans found</p>
              )}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Transactions ({filteredTransactions.length})
            </h3>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <li key={transaction._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${getTypeColor(transaction.type)}`}>
                              {getTypeLabel(transaction.type)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {transaction.transactionId}
                            </p>
                            {transaction.loan && (
                              <p className="text-sm text-gray-500">
                                Loan: {transaction.loan.loanAccountNumber}
                              </p>
                            )}
                            {transaction.description && (
                              <p className="mt-1 text-sm text-gray-500">
                                {transaction.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ₹{transaction.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            Method: {transaction.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m0 0V9m0 8h6m-6 0H7m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
              <p className="mt-1 text-sm text-gray-500">
                No transactions found matching your filters.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => {
                    setFilters({ type: 'all', status: 'all', paymentMethod: 'all' });
                    setSelectedLoan('');
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Summary */}
        {transactions.length > 0 && (
          <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed Transactions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {transactions.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m0-1h.01M12 13h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{transactions
                      .filter(t => t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Transactions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {transactions.filter(t => t.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;