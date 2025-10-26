/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FcCancel, FcCapacitor, FcCheckmark, FcCurrencyExchange, FcHighPriority, FcInspection, FcMoneyTransfer, FcProcess, FcSurvey } from 'react-icons/fc';
import { Edit, Trash2 } from 'lucide-react';

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    type: 'all',
    dateRange: 'all',
    search: ''
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [newPayment, setNewPayment] = useState({
    user: '',
    loan: '',
    amount: '',
    type: 'emi_payment',
    paymentMethod: 'upi',
    status: 'pending',
    description: ''
  });
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);

  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchPayments();
    fetchUsers();
    fetchLoans();
  }, []);

  useEffect(() => {
    filterPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, filters]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/admin/payments');
      setPayments(response.data.data.payments);
    } catch (error) {
      setError('Failed to fetch payments');
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchLoans = async () => {
    try {
      const response = await axios.get('/api/admin/loans');
      setLoans(response.data.data.loans);
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }

    // Filter by payment method
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === filters.paymentMethod);
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(payment => payment.type === filters.type);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      filtered = filtered.filter(payment => 
        new Date(payment.createdAt) >= startDate
      );
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.transactionId.toLowerCase().includes(searchLower) ||
        payment.user?.name?.toLowerCase().includes(searchLower) ||
        payment.user?.email?.toLowerCase().includes(searchLower) ||
        payment.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredPayments(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPayment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetNewPayment = () => {
    setNewPayment({
      user: '',
      loan: '',
      amount: '',
      type: 'emi_payment',
      paymentMethod: 'upi',
      status: 'pending',
      description: ''
    });
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    setActionLoading('create');
    setError('');

    try {
      await axios.post('/api/admin/payments', newPayment);
      // setSuccess('Payment created successfully!');
      toast.success("Payment created successfully!");
      setShowPaymentModal(false);
      resetNewPayment();
      await fetchPayments();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setNewPayment({
      user: payment.user._id,
      loan: payment.loan?._id || '',
      amount: payment.amount,
      type: payment.type,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      description: payment.description || ''
    });
    setModalMode('edit');
    setShowPaymentModal(true);
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    setActionLoading('update');
    setError('');

    try {
      await axios.put(`/api/admin/payments/${selectedPayment._id}`, newPayment);
      // setSuccess('Payment updated successfully!');
      toast.success("Payment updated successfully!");
      setShowPaymentModal(false);
      resetNewPayment();
      await fetchPayments();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (payment) => {
    setSelectedPayment(payment);
    setShowDeleteModal(true);
  };

  const handleDeletePayment = async () => {
    setActionLoading('delete');
    setError('');

    try {
      await axios.delete(`/api/admin/payments/${selectedPayment._id}`);
      // setSuccess('Payment deleted successfully!');
      toast.success('Payment deleted successfully!');
      setShowDeleteModal(false);
      await fetchPayments();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete payment');
    } finally {
      setActionLoading(null);
      setSelectedPayment(null);
    }
  };

  const handleStatusUpdate = async (paymentId, status) => {
    setActionLoading(paymentId);
    try {
      await axios.patch(`/api/admin/payments/${paymentId}/status`, { status });
      toast.success('Payment status updated successfully!');
      // setSuccess('Payment status updated successfully!');
      await fetchPayments();
    } catch (error) {
      // setError('Failed to update payment status');
      toast.error('Failed to update payment status');
    } finally {
      setActionLoading(null);
    }
  };

  const openCreateModal = () => {
    resetNewPayment();
    setModalMode('create');
    setShowPaymentModal(true);
    setError('');
  };

  const closeModals = () => {
    setShowPaymentModal(false);
    setShowDeleteModal(false);
    setSelectedPayment(null);
    setError('');
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
      case 'emi_payment': return 'text-blue-600 bg-blue-50';
      case 'loan_disbursement': return 'text-green-600 bg-green-50';
      case 'penalty': return 'text-red-600 bg-red-50';
      case 'refund': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'emi_payment': return <FcMoneyTransfer className='w-5 h-5'/>;
      case 'loan_disbursement': return <FcCurrencyExchange className='w-5 h-5'/>;
      case 'penalty': return <FcHighPriority className='w-5 h-5'/>;
      case 'refund': return <FcCapacitor className='w-5 h-5'/>;
      default: return <FcSurvey className='w-5 h-5'/>;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'emi_payment': return 'EMI Payment';
      case 'loan_disbursement': return 'Loan Disbursement';
      case 'penalty': return 'Penalty';
      case 'refund': return 'Refund';
      default: return type;
    }
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'upi': return 'UPI';
      case 'card': return 'Card';
      case 'netbanking': return 'Net Banking';
      case 'wallet': return 'Wallet';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (loading) {
    return (
      <div className="z-50 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-red-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl py-6 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
              <p className="text-gray-600">Manage and monitor all payment transactions</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center px-4 py-2 space-x-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <span>+</span>
              <span>Add New Payment</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="px-4 py-3 mb-6 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="px-4 py-3 mb-6 text-green-700 bg-green-100 border border-green-400 rounded">
            {success}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <span className="text-blue-600">
                    <FcInspection className='w-5 h-5'/>
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{payments.length}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                  <span className="text-green-600">
                    <FcCheckmark className='w-5 h-5'/>
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                  <span className="text-yellow-600">
                    <FcProcess className='w-5 h-5'/>
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {payments.filter(p => p.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                  <span className="text-red-600">
                    <FcCancel className='w-5 h-5'/>
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Failed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {payments.filter(p => p.status === 'failed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Filters</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Methods</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Types</option>
                  <option value="emi_payment">EMI Payment</option>
                  <option value="loan_disbursement">Loan Disbursement</option>
                  <option value="penalty">Penalty</option>
                  <option value="refund">Refund</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <input
                  type="text"
                  placeholder="Search by ID, user, description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Payment Transactions ({filteredPayments.length})
              </h3>
            </div>

            {filteredPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPayments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.transactionId}
                          </div>
                          <div className="max-w-xs text-sm text-gray-500 truncate">
                            {payment.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{payment.user?.name}</div>
                          <div className="text-sm text-gray-500">{payment.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTypeIcon(payment.type)}</span>
                            <span className={`text-sm font-medium ${getTypeColor(payment.type)} px-2 py-1 rounded`}>
                              {getTypeLabel(payment.type)}
                            </span>
                          </div>
                        </td>
                        <td className="items-center px-6 py-4 whitespace-nowrap justify-items-center">
                          <span className={`inline-flex items-center justify-items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                          <div className="flex items-center my-2 space-x-2 text-xs">
                            {payment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusUpdate(payment._id, 'completed')}
                                  disabled={actionLoading === payment._id}
                                  className="text-white bg-green-600 px-2.5 py-0.5 rounded-full disabled:opacity-50"
                                >
                                  {actionLoading === payment._id ? 'Loading' : 'Complete'}
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(payment._id, 'failed')}
                                  disabled={actionLoading === payment._id}
                                  className="text-white bg-red-600 px-2.5 py-0.5 rounded-full disabled:opacity-50"
                                >
                                  {actionLoading === payment._id ? '...' : 'Fail'}
                                </button>
                              </>
                            )}
                            {/* {payment.status === 'pending' ? 
                            <button
                                  onClick={() => handleStatusUpdate(payment._id, 'completed')}
                                  disabled={actionLoading === payment._id}
                                  className="text-white bg-green-600 px-2.5 py-0.5 rounded-full disabled:opacity-50"
                                >
                                  {actionLoading === payment._id ? 'Loading' : 'Complete'}
                                </button>
                            : 
                            <button
                                  onClick={() => handleStatusUpdate(payment._id, 'Cancel')}
                                  disabled={actionLoading === payment._id}
                                  className="text-white bg-red-600 px-2.5 py-0.5 rounded-full disabled:opacity-50"
                                >
                                  {actionLoading === payment._id ? 'Loading' : 'Cancel'}
                                </button>
                            } */}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="items-center px-6 py-4 text-sm font-medium whitespace-nowrap justify-items-center">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditPayment(payment)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-5 h-5 mr-2 text-green-600" />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteClick(payment)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-5 h-5 mr-2 text-red-500" />
                            </button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filters.status !== 'all' || filters.search
                    ? 'Try changing your filters'
                    : 'Get started by creating a new payment.'
                  }
                </p>
                <div className="mt-6">
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                  >
                    Add New Payment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative w-full max-w-2xl p-5 mx-auto bg-white border rounded-md shadow-lg top-20">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Create New Payment' : 'Edit Payment'}
                </h3>
                <button
                  onClick={closeModals}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={modalMode === 'create' ? handleCreatePayment : handleUpdatePayment} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User *</label>
                    <select
                      name="user"
                      required
                      value={newPayment.user}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select User</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Loan (Optional)</label>
                    <select
                      name="loan"
                      value={newPayment.loan}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Loan</option>
                      {loans.map(loan => (
                        <option key={loan._id} value={loan._id}>
                          {loan.loanAccountNumber} - {formatCurrency(loan.amount)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Amount *</label>
                    <input
                      type="number"
                      name="amount"
                      required
                      min="0"
                      step="0.01"
                      value={newPayment.amount}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type *</label>
                    <select
                      name="type"
                      required
                      value={newPayment.type}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="emi_payment">EMI Payment</option>
                      <option value="loan_disbursement">Loan Disbursement</option>
                      <option value="penalty">Penalty</option>
                      <option value="refund">Refund</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
                    <select
                      name="paymentMethod"
                      required
                      value={newPayment.paymentMethod}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="upi">UPI</option>
                      <option value="card">Card</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="wallet">Wallet</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status *</label>
                    <select
                      name="status"
                      required
                      value={newPayment.status}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={newPayment.description}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter payment description..."
                  />
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="px-4 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : (modalMode === 'create' ? 'Create Payment' : 'Update Payment')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPayment && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative w-full max-w-md p-5 mx-auto bg-white border rounded-md shadow-lg top-20">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Payment</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete payment <strong>{selectedPayment.transactionId}</strong>? This action cannot be undone.
                  </p>
                  <div className="p-3 mt-4 rounded-md bg-yellow-50">
                    <p className="text-sm text-yellow-700">
                      Amount: {formatCurrency(selectedPayment.amount)}
                    </p>
                    <p className="text-sm text-yellow-700">
                      User: {selectedPayment.user?.name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center mt-4 space-x-3">
                <button
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePayment}
                  disabled={actionLoading}
                  className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPayments;