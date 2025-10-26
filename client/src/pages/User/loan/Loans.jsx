import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function Loans() {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    filterLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loans, filters]);

  const fetchLoans = async () => {
    try {
      const response = await axios.get('/api/loans/my-loans');
      setLoans(response.data.data.loans);
    } catch (error) {
      toast.error('Failed to fetch loans');
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    if (filters.status !== 'all') {
      filtered = filtered.filter(loan => loan.status === filters.status);
    }

    setFilteredLoans(filtered);
  };

  const handleFilterChange = (value) => {
    setFilters(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setShowLoanModal(true);
  };

  const handlePayEmi = async (loan) => {
    setPaymentLoading(loan._id);
    try {
      const response = await axios.post('/api/payments/create-order', {
        loanId: loan._id,
        amount: loan.emi,
        paymentMethod: 'upi'
      });

      // eslint-disable-next-line no-unused-vars
      const { paymentSessionId, orderId, paymentLink } = response.data.data;

      // In real implementation, redirect to Cashfree payment page
      // For demo, we'll show a success message and update the loan
      alert(`Payment initiated for Loan ${loan.loanAccountNumber}. Order ID: ${orderId}`);

      // Simulate payment success
      setTimeout(async () => {
        try {
          await axios.get(`/api/payments/order-status/${orderId}`);
          await fetchLoans(); // Refresh loans list
          toast.success('EMI payment completed successfully!');
        } catch (error) {
          console.error('Error verifying payment:', error);
        }
      }, 2000);

    } catch (error) {
      setError('Failed to initiate payment');
      console.error('Payment error:', error);
    } finally {
      setPaymentLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'active':
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // eslint-disable-next-line no-unused-vars
  const calculateRemainingAmount = (loan) => {
    if (loan.status !== 'active') return 0;

    // Simple calculation - in real app, you'd track paid EMIs
    const totalPayable = loan.emi * loan.tenure;
    return totalPayable;
  };

  const calculateNextDueDate = (loan) => {
    if (loan.status !== 'active') return null;

    const lastPayment = loan.disbursedDate || loan.createdAt;
    const nextDue = new Date(lastPayment);
    nextDue.setMonth(nextDue.getMonth() + 1);
    return nextDue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg">Loading loans...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Loan</h1>
            <p className="text-gray-600">Manage and monitor</p>
          </div>
          <Link
            to="/apply-loan"
            className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Apply New Loan
          </Link>
        </div>
      </div>

      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {error && (
          <div className="px-4 py-3 mb-6 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-blue-600">📄</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Loans</p>
                <p className="text-2xl font-semibold text-gray-900">{loans.length}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <span className="text-green-600">✅</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Loans</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loans.filter(loan => loan.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                  <span className="text-yellow-600">⏳</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loans.filter(loan => loan.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                  <span className="text-purple-600">💰</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Borrowed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{loans
                    .filter(loan => ['active', 'completed'].includes(loan.status))
                    .reduce((sum, loan) => sum + loan.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Filter Loans</h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'approved', 'active', 'rejected', 'completed'].map(status => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${filters.status === status
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'all' ? loans.length : loans.filter(loan => loan.status === status).length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loans List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Loan Applications ({filteredLoans.length})
            </h3>
          </div>

          {filteredLoans.length > 0 ? (
            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {filteredLoans.map((loan) => (
                  <li key={loan._id} className="px-4 py-6 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{getStatusIcon(loan.status)}</span>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {loan.loanAccountNumber}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Applied on {formatDate(loan.createdAt)}
                                {loan.disbursedDate && ` • Disbursed on ${formatDate(loan.disbursedDate)}`}
                              </p>
                              <p className="mt-1 text-sm text-gray-600">
                                {loan.purpose}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                              ₹{loan.amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              EMI: ₹{loan.emi} • {loan.tenure} months
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                              {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                              Interest: {loan.interestRate}% p.a.
                            </span>
                            {loan.status === 'active' && (
                              <span className="text-sm text-gray-500">
                                Next Due: {formatDate(calculateNextDueDate(loan))}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(loan)}
                              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              View Details
                            </button>

                            {loan.status === 'active' && (
                              <button
                                onClick={() => handlePayEmi(loan)}
                                disabled={paymentLoading === loan._id}
                                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                {paymentLoading === loan._id ? 'Processing...' : 'Pay EMI'}
                              </button>
                            )}

                            {loan.status === 'pending' && (
                              <span className="text-sm text-yellow-600">
                                Under Review
                              </span>
                            )}
                          </div>
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m0-1h.01M12 13h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No loans found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filters.status === 'all'
                  ? "Get started by applying for your first loan."
                  : `No ${filters.status} loans found.`
                }
              </p>
              <div className="mt-6">
                <Link
                  to="/apply-loan"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply for Loan
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Loan Details Modal */}
        {showLoanModal && selectedLoan && (
          <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
            <div className="relative w-full max-w-2xl p-5 mx-auto bg-white border rounded-md shadow-lg top-20">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Loan Details - {selectedLoan.loanAccountNumber}
                  </h3>
                  <button
                    onClick={() => setShowLoanModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Loan Amount</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        ₹{selectedLoan.amount.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Interest Rate</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {selectedLoan.interestRate}% per annum
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Tenure</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {selectedLoan.tenure} months
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Monthly EMI</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        ₹{selectedLoan.emi.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Total Payable</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        ₹{(selectedLoan.emi * selectedLoan.tenure).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedLoan.status)}`}>
                        {selectedLoan.status.charAt(0).toUpperCase() + selectedLoan.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium text-gray-500">Loan Purpose</label>
                  <p className="p-3 text-gray-900 rounded-md bg-gray-50">
                    {selectedLoan.purpose}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
                  <div>
                    <span className="font-medium">Applied Date:</span> {formatDate(selectedLoan.createdAt)}
                  </div>
                  {selectedLoan.disbursedDate && (
                    <div>
                      <span className="font-medium">Disbursed Date:</span> {formatDate(selectedLoan.disbursedDate)}
                    </div>
                  )}
                  {selectedLoan.completionDate && (
                    <div>
                      <span className="font-medium">Completion Date:</span> {formatDate(selectedLoan.completionDate)}
                    </div>
                  )}
                </div>

                {selectedLoan.status === 'active' && (
                  <div className="p-4 mt-6 rounded-md bg-blue-50">
                    <h4 className="mb-2 font-medium text-blue-900">Next EMI Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Due Date:</span> {formatDate(calculateNextDueDate(selectedLoan))}
                      </div>
                      <div>
                        <span className="text-blue-600">Amount Due:</span> ₹{selectedLoan.emi}
                      </div>
                    </div>
                    <button
                      onClick={() => handlePayEmi(selectedLoan)}
                      disabled={paymentLoading === selectedLoan._id}
                      className="px-4 py-2 mt-3 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {paymentLoading === selectedLoan._id ? 'Processing...' : 'Pay EMI Now'}
                    </button>
                  </div>
                )}

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    onClick={() => setShowLoanModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Close
                  </button>
                  {selectedLoan.status === 'active' && (
                    <button
                      onClick={() => handlePayEmi(selectedLoan)}
                      disabled={paymentLoading === selectedLoan._id}
                      className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {paymentLoading === selectedLoan._id ? 'Processing...' : 'Pay EMI'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Loans;