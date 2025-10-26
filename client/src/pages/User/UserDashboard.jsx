import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function UserDashboard() {
  const [stats, setStats] = useState({
    totalLoans: 0,
    activeLoans: 0,
    pendingLoans: 0,
    totalTransactions: 0
  });
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [loansRes, transactionsRes] = await Promise.all([
        axios.get('/api/loans/my-loans'),
        axios.get('/api/transactions/my-transactions')
      ]);

      const loans = loansRes.data.data.loans;
      const transactions = transactionsRes.data.data.transactions;

      setStats({
        totalLoans: loans.length,
        activeLoans: loans.filter(loan => loan.status === 'active').length,
        pendingLoans: loans.filter(loan => loan.status === 'pending').length,
        totalTransactions: transactions.length
      });

      setRecentLoans(loans.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Loans</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalLoans}</dd>
            </div>
          </div>
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Active Loans</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">{stats.activeLoans}</dd>
            </div>
          </div>
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Loans</dt>
              <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pendingLoans}</dd>
            </div>
          </div>
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Transactions</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalTransactions}</dd>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link
              to="/apply-loan"
              className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-md"
            >
              <h3 className="text-lg font-medium text-gray-900">Apply for Loan</h3>
              <p className="mt-2 text-gray-600">Apply for a new loan with competitive rates</p>
            </Link>
            <Link
              to="/loans"
              className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-md"
            >
              <h3 className="text-lg font-medium text-gray-900">My Loans</h3>
              <p className="mt-2 text-gray-600">View and manage your loan applications</p>
            </Link>
            <Link
              to="/transactions"
              className="p-6 transition-shadow bg-white rounded-lg shadow hover:shadow-md"
            >
              <h3 className="text-lg font-medium text-gray-900">Transactions</h3>
              <p className="mt-2 text-gray-600">View your transaction history</p>
            </Link>
          </div>
        </div>

        {/* Recent Loans */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Loans</h3>
          </div>
          <div className="border-t border-gray-200">
            {recentLoans.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentLoans.map((loan) => (
                  <li key={loan._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {loan.loanAccountNumber}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Amount: ₹{loan.amount} • Status: {loan.status}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 ml-2">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                              loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}`}
                        >
                          {loan.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-12 text-center">
                <p className="text-gray-500">No loans found</p>
                <Link
                  to="/apply-loan"
                  className="mt-2 text-indigo-600 hover:text-indigo-500"
                >
                  Apply for your first loan
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;