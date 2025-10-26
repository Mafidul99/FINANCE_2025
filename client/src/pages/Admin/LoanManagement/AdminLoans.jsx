import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

import { FcCheckmark, FcProcess  ,FcInspection , FcCurrencyExchange, FcOk,FcSynchronize ,FcCancel ,FcApprove, FcViewDetails    } from "react-icons/fc";
import { EarIcon, LucideEye } from 'lucide-react';


function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loans, filters]);

  const fetchLoans = async () => {
    try {
      const response = await axios.get('/api/admin/loans');
      setLoans(response.data.data.loans);
    } catch (error) {
      setError('Failed to fetch loans');
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(loan => loan.status === filters.status);
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(loan => 
        loan.loanAccountNumber.toLowerCase().includes(searchLower) ||
        loan.user.name.toLowerCase().includes(searchLower) ||
        loan.user.email.toLowerCase().includes(searchLower) ||
        loan.purpose.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLoans(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateLoanStatus = async (loanId, status) => {
    setActionLoading(loanId);
    try {
      await axios.patch(`/api/admin/loans/${loanId}/status`, { status });
      await fetchLoans(); // Refresh the list
      setShowLoanModal(false);
    } catch (error) {
      setError('Failed to update loan status');
      console.error('Error updating loan status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const disburseLoan = async (loanId) => {
    setActionLoading(loanId);
    try {
      await axios.post(`/api/admin/loans/${loanId}/disburse`);
      await fetchLoans(); // Refresh the list
      setShowLoanModal(false);
    } catch (error) {
      setError('Failed to disburse loan');
      console.error('Error disbursing loan:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setShowLoanModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FcOk className='w-7 h-7'/>;
      case 'active':
        return <FcSynchronize className='w-7 h-7'/>;
      case 'pending':
        return <FcProcess className='w-7 h-7'/>;
      case 'rejected':
        return <FcCancel className='w-7 h-7'/>;
      case 'completed':
        return <FcApprove className='w-7 h-7'/>;
      default:
        return <FcInspection className='w-7 h-7'/>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
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

  const calculateEMI = (loan) => {
    // Simple EMI calculation
    const principal = loan.amount;
    const annualRate = loan.interestRate;
    const tenureMonths = loan.tenure;
    
    const monthlyRate = annualRate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    return Math.round(emi);
  };

  if (loading) {
    return (
      <div className="flex justify-center min-h-screen items-centerz-50 bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-red-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading loans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl py-6 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Loan Management</h1>
          <p className="text-gray-600">Manage and review all loan applications</p>
        </div>

        {error && (
          <div className="px-4 py-3 mb-6 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
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
                <p className="text-sm font-medium text-gray-500">Total Loans</p>
                <p className="text-2xl font-semibold text-gray-900">{loans.length}</p>
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
                  {loans.filter(loan => loan.status === 'pending').length}
                </p>
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
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {loans.filter(loan => loan.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                  <span className="text-purple-600">
                    <FcCurrencyExchange className='w-5 h-5'/>
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(loans.reduce((sum, loan) => sum + loan.amount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Filters</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <input
                  type="text"
                  placeholder="Search by account, name, email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: 'all', search: '' })}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loans Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Loan Applications ({filteredLoans.length})
              </h3>
            </div>

            {filteredLoans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Loan Details
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Amount & Terms
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-bold tracking-wider text-center text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLoans.map((loan) => (
                      <tr key={loan._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getStatusIcon(loan.status)}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {loan.loanAccountNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {loan.purpose}
                              </div>
                              <div className="text-xs text-gray-400">
                                Applied: {formatDate(loan.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{loan.user.name}</div>
                          <div className="text-sm text-gray-500">{loan.user.email}</div>
                          <div className="text-sm text-gray-500">{loan.user.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(loan.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {loan.interestRate}% for {loan.tenure} months
                          </div>
                          <div className="text-sm text-gray-500">
                            EMI: {formatCurrency(calculateEMI(loan))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                            {loan.status}
                          </span>
                          {loan.disbursedDate && (
                            <div className="mt-1 text-xs text-gray-500">
                              Disbursed: {formatDate(loan.disbursedDate)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(loan)}
                              className="text-sm text-indigo-600 hover:text-indigo-900"
                            >                             
                              <LucideEye className="mr-2 text-orange-400 w-7 h-7" />
                            </button>
                            
                            {loan.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateLoanStatus(loan._id, 'approved')}
                                  disabled={actionLoading === loan._id}
                                  className="text-sm text-green-600 hover:text-green-900 disabled:opacity-50"
                                >
                                  {actionLoading === loan._id ? '...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => updateLoanStatus(loan._id, 'rejected')}
                                  disabled={actionLoading === loan._id}
                                  className="text-sm text-red-600 hover:text-red-900 disabled:opacity-50"
                                >
                                  {actionLoading === loan._id ? '...' : 'Reject'}
                                </button>
                              </>
                            )}
                            
                            {loan.status === 'approved' && (
                              <button
                                onClick={() => disburseLoan(loan._id)}
                                disabled={actionLoading === loan._id}
                                className="text-sm text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              >
                                {actionLoading === loan._id ? '...' : 'Disburse'}
                              </button>
                            )}
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No loans found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {filters.status !== 'all' || filters.search
                    ? 'Try changing your filters'
                    : 'No loan applications have been submitted yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loan Details Modal */}
      {showLoanModal && selectedLoan && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative w-full max-w-4xl p-5 mx-auto bg-white border rounded-md shadow-lg top-20">
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
                {/* Loan Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Loan Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Loan Amount</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {formatCurrency(selectedLoan.amount)}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Monthly EMI</label>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {formatCurrency(calculateEMI(selectedLoan))}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Loan Purpose</label>
                    <p className="p-3 mt-1 text-gray-900 rounded-md bg-gray-50">
                      {selectedLoan.purpose}
                    </p>
                  </div>
                </div>

                {/* User Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">User Information</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Full Name</label>
                      <p className="mt-1 text-gray-900">{selectedLoan.user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="mt-1 text-gray-900">{selectedLoan.user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <p className="mt-1 text-gray-900">{selectedLoan.user.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-6">
                <h4 className="mb-4 text-lg font-medium text-gray-900">Loan Timeline</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Application Submitted</span>
                    <span className="text-sm text-gray-900">{formatDate(selectedLoan.createdAt)}</span>
                  </div>
                  {selectedLoan.disbursedDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Loan Disbursed</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedLoan.disbursedDate)}</span>
                    </div>
                  )}
                  {selectedLoan.completionDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Loan Completed</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedLoan.completionDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 space-x-3 border-t">
                <button
                  onClick={() => setShowLoanModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Close
                </button>
                
                {selectedLoan.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateLoanStatus(selectedLoan._id, 'approved')}
                      disabled={actionLoading === selectedLoan._id}
                      className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading === selectedLoan._id ? 'Processing...' : 'Approve Loan'}
                    </button>
                    <button
                      onClick={() => updateLoanStatus(selectedLoan._id, 'rejected')}
                      disabled={actionLoading === selectedLoan._id}
                      className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading === selectedLoan._id ? 'Processing...' : 'Reject Loan'}
                    </button>
                  </>
                )}
                
                {selectedLoan.status === 'approved' && (
                  <button
                    onClick={() => disburseLoan(selectedLoan._id)}
                    disabled={actionLoading === selectedLoan._id}
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading === selectedLoan._id ? 'Processing...' : 'Disburse Funds'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLoans;