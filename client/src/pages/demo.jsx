import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivity();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const [transactionsRes, loansRes, usersRes] = await Promise.all([
        axios.get('/api/admin/transactions?limit=5'),
        axios.get('/api/admin/loans?limit=5'),
        axios.get('/api/admin/users?limit=5')
      ]);

      const activities = [
        ...transactionsRes.data.data.transactions.map(t => ({
          ...t,
          type: 'transaction',
          description: `Payment of ₹${t.amount} by user`,
          icon: '💰'
        })),
        ...loansRes.data.data.loans.map(l => ({
          ...l,
          type: 'loan',
          description: `Loan application for ₹${l.amount}`,
          icon: '📄'
        })),
        ...usersRes.data.data.users.map(u => ({
          ...u,
          type: 'user',
          description: `New user registration: ${u.name}`,
          icon: '👤'
        }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
       .slice(0, 8);

      setRecentActivity(activities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/users', newUser);
      setShowAddUserModal(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      });
      fetchDashboardData();
      fetchRecentActivity();
      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user: ' + (error.response?.data?.message || 'Something went wrong'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in newUser.address) {
      setNewUser(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [name]: value
        }
      }));
    } else {
      setNewUser(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="hidden space-x-4 md:flex">
                <Link
                  to="/admin"
                  className="px-3 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 rounded-md  hover:text-indigo-600"
                >
                  Overview
                </Link>
                <Link
                  to="/admin/users"
                  className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-indigo-600"
                >
                  Users
                </Link>
                <Link
                  to="/admin/loans"
                  className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-indigo-600"
                >
                  Loan Management
                </Link>
                <Link
                  to="/admin/transactions"
                  className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-indigo-600"
                >
                  Transactions
                </Link>
                <Link
                  to="/admin/reports"
                  className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-indigo-600"
                >
                  Reports & Analytics
                </Link>
                <Link
                  to="/admin/settings"
                  className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-indigo-600"
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-semibold">{user?.name}</span>
              </div>
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                    <span className="text-sm font-medium text-indigo-600">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </button>
                <div className="absolute right-0 z-50 hidden w-48 py-1 mt-2 bg-white rounded-md shadow-lg group-hover:block">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    User Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="bg-white border-b md:hidden">
        <div className="flex px-4 py-2 space-x-4 overflow-x-auto">
          <Link
            to="/admin"
            className="px-3 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 rounded-md whitespace-nowrap"
          >
            Overview
          </Link>
          <Link
            to="/admin/users"
            className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md whitespace-nowrap hover:text-indigo-600"
          >
            Users
          </Link>
          <Link
            to="/admin/loans"
            className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md whitespace-nowrap hover:text-indigo-600"
          >
            Loans
          </Link>
          <Link
            to="/admin/transactions"
            className="px-3 py-2 text-sm font-medium text-gray-700 rounded-md whitespace-nowrap hover:text-indigo-600"
          >
            Transactions
          </Link>
        </div>
      </div>

      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-semibold text-gray-900">{dashboardData.stats.totalUsers}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="px-4 py-4 bg-gray-50 sm:px-6">
              <div className="text-sm">
                <Link to="/admin/users" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View all users
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m0-1h.01M12 13h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Loans</dt>
                    <dd className="text-lg font-semibold text-gray-900">{dashboardData.stats.totalLoans}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="px-4 py-4 bg-gray-50 sm:px-6">
              <div className="text-sm">
                <Link to="/admin/loans" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Manage loans
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Loans</dt>
                    <dd className="text-lg font-semibold text-gray-900">{dashboardData.stats.pendingLoans}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="px-4 py-4 bg-gray-50 sm:px-6">
              <div className="text-sm">
                <Link to="/admin/loans?filter=pending" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Review applications
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m0-1h.01M12 13h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 w-0 ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {formatCurrency(dashboardData.stats.totalRevenue)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="px-4 py-4 bg-gray-50 sm:px-6">
              <div className="text-sm">
                <Link to="/admin/transactions" className="font-medium text-indigo-600 hover:text-indigo-500">
                  View transactions
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/admin/users"
                    className="block w-full px-4 py-3 text-left transition duration-150 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Manage Users</p>
                        <p className="text-sm text-gray-500">View and manage all users</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/admin/loans"
                    className="block w-full px-4 py-3 text-left transition duration-150 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v1m0 6v1m0-1v1m0-1h.01M12 13h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Loan Management</p>
                        <p className="text-sm text-gray-500">Review and approve loans</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/admin/transactions"
                    className="block w-full px-4 py-3 text-left transition duration-150 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Transactions</p>
                        <p className="text-sm text-gray-500">View all transactions</p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/admin/reports"
                    className="block w-full px-4 py-3 text-left transition duration-150 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m0 0V9m0 8h6m-6 0H7m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Reports & Analytics</p>
                        <p className="text-sm text-gray-500">Generate reports</p>
                      </div>
                    </div>
                  </Link>                  
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity and Pending Loans */}
          <div className="space-y-6 lg:col-span-2">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center p-3 space-x-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="text-2xl">{activity.icon}</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
                        </div>
                        {activity.status && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-gray-500">No recent activity</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pending Loans */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Pending Loan Applications</h3>
                  <Link
                    to="/admin/loans"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-3">
                  {dashboardData.recentLoans.filter(loan => loan.status === 'pending').slice(0, 5).map((loan) => (
                    <div key={loan._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{loan.user.name}</p>
                          <p className="text-xs text-gray-500">{loan.loanAccountNumber}</p>
                          <p className="text-xs text-gray-500">{loan.purpose}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(loan.amount)}</p>
                        <p className="text-xs text-gray-500">{loan.tenure} months</p>
                        <button
                          onClick={() => navigate('/admin/loans')}
                          className="mt-1 text-xs text-indigo-600 hover:text-indigo-500"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                  {dashboardData.recentLoans.filter(loan => loan.status === 'pending').length === 0 && (
                    <p className="py-4 text-center text-gray-500">No pending loan applications</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">System Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Active Sessions</span>
                  <span className="text-sm font-medium text-gray-900">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Server Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Backup</span>
                  <span className="text-sm font-medium text-gray-900">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">System Uptime</span>
                  <span className="text-sm font-medium text-gray-900">99.8%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">Quick Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="p-3 text-center transition duration-150 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="text-blue-600">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">Add User</p>
                </button>
                <Link
                  to="/admin/reports"
                  className="p-3 text-center transition duration-150 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="text-green-600">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">Analytics</p>
                </Link>
                <Link
                  to="/admin/settings"
                  className="p-3 text-center transition duration-150 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="text-purple-600">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">Settings</p>
                </Link>
                <Link
                  to="/admin/transactions"
                  className="p-3 text-center transition duration-150 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="text-red-600">
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900">Transactions</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative w-full max-w-md p-5 mx-auto bg-white border rounded-md shadow-lg top-20">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Add New User</h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={newUser.name}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={newUser.email}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={newUser.password}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={newUser.phone}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;