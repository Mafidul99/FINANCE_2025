import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { FcBusiness, FcBusinessman, FcCapacitor, FcComboChart, FcConferenceCall, FcCurrencyExchange, FcHighPriority, FcMoneyTransfer } from 'react-icons/fc';

function AdminReports() {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [activeTab, setActiveTab] = useState('financial');
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [financialRes, userRes, loanRes, transactionRes] = await Promise.all([
        axios.get('/api/admin/reports/financial'),
        axios.get('/api/admin/reports/user-stats'),
        axios.get('/api/admin/reports/loan-stats'),
        axios.get('/api/admin/reports/transaction-stats')
      ]);

      setReports({
        financial: financialRes.data.data,
        userStats: userRes.data.data,
        loanStats: loanRes.data.data,
        transactionStats: transactionRes.data.data
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type) => {
    setGenerating(true);
    try {
      const response = await axios.post('/api/admin/reports/generate', {
        type,
        ...dateRange
      });

      // Download the report
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // eslint-disable-next-line no-unused-vars
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculatePercentage = (part, total) => {
    if (total === 0) return 0;
    return ((part / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="z-50 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-red-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive financial and user analytics</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => generateReport('comprehensive')}
                disabled={generating}
                className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Export Full Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Report Period</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={() => fetchReports()}
                  className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  Apply Filter
                </button>
                <button
                  onClick={() => setDateRange({ startDate: '', endDate: '' })}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - Horizontal Layout */}
        <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
          {/* Financial Overview */}
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Financial Overview</h3>
              <span className="text-green-600">
                <FcCurrencyExchange className='w-5 h-5'/>
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(reports.financial?.totalRevenue || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">EMI Collection</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(reports.financial?.emiCollection || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Payments</span>
                <span className="text-lg font-semibold text-yellow-600">
                  {formatCurrency(reports.financial?.pendingPayments || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Loan Size</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(reports.financial?.averageLoanSize || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Statistics</h3>
              <span className="text-blue-600">
                <FcConferenceCall className='w-5 h-5'/>
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Users</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatNumber(reports.userStats?.totalUsers || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatNumber(reports.userStats?.activeUsers || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Users (30d)</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatNumber(reports.userStats?.newUsersThisMonth || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Admin Users</span>
                <span className="text-lg font-semibold text-purple-600">
                  {formatNumber(reports.userStats?.adminUsers || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Loan Portfolio */}
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Loan Portfolio</h3>
              <span className="text-purple-600">
                <FcComboChart  className='w-5 h-5'/>
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Loans</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatNumber(reports.loanStats?.totalLoans || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Loans</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatNumber(reports.loanStats?.activeLoans || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Approval</span>
                <span className="text-lg font-semibold text-yellow-600">
                  {formatNumber(reports.loanStats?.pendingLoans || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Default Rate</span>
                <span className="text-lg font-semibold text-red-600">
                  {reports.loanStats?.defaultRate || 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
              <span className="text-green-600">
                <FcMoneyTransfer  className='w-5 h-5'/>
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Transactions</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatNumber(reports.transactionStats?.totalTransactions || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-lg font-semibold text-green-600">
                  {reports.transactionStats?.successRate || 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Transaction</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatCurrency(reports.transactionStats?.averageTransaction || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Failed Transactions</span>
                <span className="text-lg font-semibold text-red-600">
                  {formatNumber(reports.transactionStats?.failedTransactions || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Reports Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('financial')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'financial'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Financial Summary
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                User Statistics
              </button>
              <button
                onClick={() => setActiveTab('loans')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'loans'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Loan Analytics
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'transactions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Transaction Details
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Financial Summary Tab */}
            {activeTab === 'financial' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
                  <div className="space-y-4">
                    {reports.financial?.revenueByType?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${item.type === 'emi_payment' ? 'bg-green-500' :
                              item.type === 'loan_disbursement' ? 'bg-blue-500' :
                                item.type === 'penalty' ? 'bg-red-500' : 'bg-purple-500'
                            }`}></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {item.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculatePercentage(item.amount, reports.financial?.totalRevenue || 1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
                  <div className="space-y-4">
                    {reports.financial?.monthlyTrends?.slice(-6).map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-700">
                          {month.month}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(month.revenue)}
                          </div>
                          <div className={`text-xs ${month.growth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {month.growth >= 0 ? '+' : ''}{month.growth}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* User Statistics Tab */}
            {activeTab === 'users' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
                  <div className="space-y-4">
                    {reports.userStats?.userGrowth?.map((period, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-700">
                          {period.period}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            +{formatNumber(period.newUsers)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Total: {formatNumber(period.totalUsers)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">User Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">Active Sessions</span>
                      <span className="text-sm font-semibold text-green-600">
                        {reports.userStats?.activeSessions || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">Avg. Session Duration</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {reports.userStats?.avgSessionDuration || '0m'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">User Retention</span>
                      <span className="text-sm font-semibold text-purple-600">
                        {reports.userStats?.retentionRate || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loan Analytics Tab */}
            {activeTab === 'loans' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Loan Status Distribution</h3>
                  <div className="space-y-4">
                    {reports.loanStats?.statusDistribution?.map((status, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${status.status === 'active' ? 'bg-green-500' :
                              status.status === 'pending' ? 'bg-yellow-500' :
                                status.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                            }`}></div>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {status.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatNumber(status.count)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculatePercentage(status.count, reports.loanStats?.totalLoans || 1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Loan Performance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">Total Loan Amount</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(reports.loanStats?.totalLoanAmount || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">Avg. Interest Rate</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {reports.loanStats?.avgInterestRate || 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-sm font-medium text-gray-700">EMI Collection Rate</span>
                      <span className="text-sm font-semibold text-green-600">
                        {reports.loanStats?.emiCollectionRate || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction Details Tab */}
            {activeTab === 'transactions' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction Types</h3>
                  <div className="space-y-4">
                    {reports.transactionStats?.typeDistribution?.map((type, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {type.type === 'emi_payment' ? <FcMoneyTransfer  className='w-5 h-5'/> :
                              type.type === 'loan_disbursement' ? <FcCurrencyExchange  className='w-5 h-5'/> :
                                type.type === 'penalty' ? <FcHighPriority  className='w-5 h-5'/> : <FcCapacitor className='w-5 h-5'/>}
                          </span>
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {type.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatNumber(type.count)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculatePercentage(type.count, reports.transactionStats?.totalTransactions || 1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                  <div className="space-y-4">
                    {reports.transactionStats?.paymentMethodDistribution?.map((method, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {method.method}
                        </span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatNumber(method.count)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {calculatePercentage(method.count, reports.transactionStats?.totalTransactions || 1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Report Generation Buttons */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Generate Reports</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <button
                onClick={() => generateReport('financial')}
                disabled={generating}
                className="flex flex-col items-center px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <span className="mb-2 text-2xl">
                  <FcCurrencyExchange className='w-10 h-10'/>
                </span>
                <span className="text-sm">Financial Report</span>
              </button>
              <button
                onClick={() => generateReport('users')}
                disabled={generating}
                className="flex flex-col items-center px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <span className="mb-2 text-2xl">
                  <FcBusinessman className='w-10 h-10'/>
                </span>
                <span className="text-sm">User Report</span>
              </button>
              <button
                onClick={() => generateReport('loans')}
                disabled={generating}
                className="flex flex-col items-center px-4 py-3 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <span className="mb-2 text-2xl">
                  <FcComboChart className='w-10 h-10'/>
                </span>
                <span className="text-sm">Loan Report</span>
              </button>
              <button
                onClick={() => generateReport('transactions')}
                disabled={generating}
                className="flex flex-col items-center px-4 py-3 text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                <span className="mb-2 text-2xl">
                  <FcMoneyTransfer className='w-10 h-10'/>
                </span>
                <span className="text-sm">Transaction Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;