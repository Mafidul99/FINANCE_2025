/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

import { FcCheckmark, FcProcess, FcInspection, FcCurrencyExchange, FcCancel, FcMoneyTransfer, FcSurvey, FcCapacitor, FcHighPriority } from "react-icons/fc";
import { Edit, LucideEye, Trash2 } from 'lucide-react';


function AdminTransactions() {
    const [isTransactions, setIsTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
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

    const [stats, setStats] = useState({
        totalAmount: 0,
        completedAmount: 0,
        pendingAmount: 0,
        failedAmount: 0
    });

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [newTransaction, setNewTransaction] = useState({
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
        fetchTransactions();
        fetchUsers();
        fetchLoans();
    }, []);

    useEffect(() => {
        filterPayments();
        calculateStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTransactions, filters]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get('/api/admin/transactions');
            setIsTransactions(response.data.data.payments);
        } catch (error) {
            // setError('Failed to fetch transaction');
            toast.error("Failed to fetch transaction");
            console.error('Error fetching transaction:', error);
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
        let filtered = isTransactions;

        // Filter by status
        if (filters.status !== 'all') {
            filtered = filtered.filter(transaction => transaction.status === filters.status);
        }

        // Filter by payment method
        if (filters.paymentMethod !== 'all') {
            filtered = filtered.filter(transaction => transaction.paymentMethod === filters.paymentMethod);
        }

        // Filter by type
        if (filters.type !== 'all') {
            filtered = filtered.filter(transaction => transaction.type === filters.type);
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

            filtered = filtered.filter(transaction =>
                new Date(transaction.createdAt) >= startDate
            );
        }

        // Filter by search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(transaction =>
                transaction.transactionId.toLowerCase().includes(searchLower) ||
                transaction.user?.name?.toLowerCase().includes(searchLower) ||
                transaction.user?.email?.toLowerCase().includes(searchLower) ||
                transaction.description?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredTransactions(filtered);
    };

    const calculateStats = () => {
        const totalAmount = isTransactions.reduce((sum, t) => sum + t.amount, 0);
        const completedAmount = isTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
        const pendingAmount = isTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);
        const failedAmount = isTransactions.filter(t => t.status === 'failed').reduce((sum, t) => sum + t.amount, 0);

        setStats({
            totalAmount,
            completedAmount,
            pendingAmount,
            failedAmount,
        });
    };




    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTransaction(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetNewPayment = () => {
        setNewTransaction({
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
            await axios.post('/api/admin/transactions', newTransaction);
            // setSuccess('Transactions created successfully!');
            toast.success("Transactions created successfully!");
            setShowTransactionModal(false);
            resetNewPayment();
            await fetchTransactions();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create payment');
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditPayment = (transaction) => {
        setSelectedTransaction(transaction);
        setNewTransaction({
            user: transaction.user._id,
            loan: transaction.loan?._id || '',
            amount: transaction.amount,
            type: transaction.type,
            paymentMethod: transaction.paymentMethod,
            status: transaction.status,
            description: transaction.description || ''
        });
        setModalMode('edit');
        setShowTransactionModal(true);
    };




    const handleUpdatePayment = async (e) => {
        e.preventDefault();
        setActionLoading('update');
        setError('');

        try {
            await axios.put(`/api/admin/transactions/${selectedTransaction._id}`, newTransaction);
            // setSuccess('Transaction updated successfully!');
            toast.success("Transaction updated successfully!");
            setShowTransactionModal(false);
            resetNewPayment();
            await fetchTransactions();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update payment');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteClick = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDeleteModal(true);
    };

    const handleDeletePayment = async () => {
        setActionLoading('delete');
        setError('');

        try {
            await axios.delete(`/api/admin/transactions/${selectedTransaction._id}`);
            toast.success("Transactions deleted successfully!");
            // setSuccess('Transactions deleted successfully!');
            setShowDeleteModal(false);
            await fetchTransactions();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete payment');
        } finally {
            setActionLoading(null);
            setSelectedTransaction(null);
        }
    };

    const handleViewDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDetailsModal(true);
    };

    const handleStatusUpdate = async (transactionId, status) => {
        setActionLoading(transactionId);
        try {
            await axios.patch(`/api/admin/transactions/${transactionId}/status`, { status });
            // setSuccess('Transaction status updated successfully!');
            toast.success("Transaction status updated successfully!");
            await fetchTransactions();
            setShowDetailsModal(false);
        } catch (error) {
            setError('Failed to update payment status');
        } finally {
            setActionLoading(null);
        }
    };

    const openCreateModal = () => {
        resetNewPayment();
        setModalMode('create');
        setShowTransactionModal(true);
        setError('');
    };

    const closeModals = () => {
        setShowTransactionModal(false);
        setShowDeleteModal(false);
        setSelectedTransaction(null);
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
            case 'emi_payment': return <FcMoneyTransfer className='w-5 h-5' />;
            case 'loan_disbursement': return <FcCurrencyExchange className='w-5 h-5' />;
            case 'penalty': return <FcHighPriority className='w-5 h-5' />;
            case 'refund': return <FcCapacitor className='w-5 h-5' />;
            default: return <FcSurvey className='w-5 h-5' />;
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


    const clearFilters = () => {
        setFilters({
            type: 'all',
            status: 'all',
            paymentMethod: 'all',
            dateRange: 'all',
            search: ''
        });
    };
    const exportToCSV = () => {
        const headers = ['Transaction ID', 'User', 'Type', 'Amount', 'Status', 'Payment Method', 'Date', 'Description'];
        const csvData = filteredTransactions.map(transaction => [
            transaction.transactionId,
            transaction.user?.name || 'N/A',
            getTypeLabel(transaction.type),
            transaction.amount,
            transaction.status,
            getPaymentMethodLabel(transaction.paymentMethod),
            formatDate(transaction.createdAt),
            transaction.description || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto border-b-2 border-indigo-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600">Loading Transaction...</p>
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
                            <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
                            <p className="text-gray-600">Manage and monitor all payment transactions</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center px-4 py-2 space-x-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            <span>+</span>
                            <span>Add New Transaction</span>
                        </button>
                    </div>
                </div>

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
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                    <div className="p-6 bg-white rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                    <span className="text-blue-600">
                                        <FcCurrencyExchange className='w-5 h-5' />
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(stats.totalAmount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                    <span className="text-green-600">
                                        <FcCheckmark className='w-5 h-5' />
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Completed Amount</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(stats.completedAmount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                                    <span className="text-yellow-600">
                                        <FcProcess className='w-5 h-5' />
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(stats.pendingAmount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                    <span className="text-red-600">
                                        <FcCancel className='w-5 h-5' />
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Failed Amount</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {formatCurrency(stats.failedAmount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                                    <span className="text-blue-600">
                                        <FcInspection className='w-5 h-5' />
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {isTransactions.length}
                                    {/* {transactions.length} */}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                                    <span className="text-green-600">
                                        <FcCheckmark className='w-5 h-5' />
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Completed</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {isTransactions.filter(p => p.status === 'completed').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                                    <span className="text-yellow-600">
                                        <FcProcess className='w-5 h-5' />
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {isTransactions.filter(p => p.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                                    <span className="text-red-600">
                                        <FcCancel className='w-5 h-5' />
                                    </span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Failed</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {isTransactions.filter(p => p.status === 'failed').length}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Filters */}
                <div className="mb-6 bg-white rounded-lg shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex flex-col mb-4 md:flex-row md:items-center md:justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                            <div className="flex mt-2 space-x-2 md:mt-0">
                                <button
                                    onClick={exportToCSV}
                                    className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                                >
                                    Export CSV
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

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

                {/* Loans Table */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                All Transactions ({filteredTransactions.length})
                            </h3>
                        </div>

                        {filteredTransactions.length > 0 ? (
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
                                        {filteredTransactions.map((transaction) => (
                                            <tr key={transaction._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {transaction.transactionId}
                                                    </div>
                                                    <div className="max-w-xs text-sm text-gray-500 truncate">
                                                        {transaction.description}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{transaction.user?.name}</div>
                                                    <div className="text-sm text-gray-500">{transaction.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {formatCurrency(transaction.amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-lg">{getTypeIcon(transaction.type)}</span>
                                                        <span className={`text-sm font-medium ${getTypeColor(transaction.type)} px-2 py-1 rounded`}>
                                                            {getTypeLabel(transaction.type)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="items-center px-6 py-4 whitespace-nowrap justify-items-center">
                                                    <span className={`inline-flex items-center justify-items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${getStatusColor(transaction.status)}`}>
                                                        {transaction.status}
                                                    </span>
                                                    <div className="flex items-center my-2 space-x-2 text-xs">
                                                        {transaction.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(transaction._id, 'completed')}
                                                                    disabled={actionLoading === transaction._id}
                                                                    className="text-white bg-green-600 px-2.5 py-0.5 rounded-full disabled:opacity-50"
                                                                >
                                                                    {actionLoading === transaction._id ? 'Loading' : 'Complete'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(transaction._id, 'failed')}
                                                                    disabled={actionLoading === transaction._id}
                                                                    className="text-white bg-red-600 px-2.5 py-0.5 rounded-full disabled:opacity-50"
                                                                >
                                                                    {actionLoading === transaction._id ? '...' : 'Fail'}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {getPaymentMethodLabel(transaction.paymentMethod)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {formatDate(transaction.createdAt)}
                                                </td>
                                                <td className="items-center px-6 py-4 text-sm font-medium whitespace-nowrap justify-items-center">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleEditPayment(transaction)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <Edit className="w-5 h-5 mr-2 text-green-600" />
                                                        </button>

                                                        <button
                                                            onClick={() => handleDeleteClick(transaction)}
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



            {/* Transaction Details Modal */}
            {showDetailsModal && selectedTransaction && (
                <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
                    <div className="relative w-full max-w-2xl p-5 mx-auto bg-white border rounded-md shadow-lg top-20">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Transaction Details
                                </h3>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Transaction ID</label>
                                        <p className="mt-1 font-mono text-gray-900">{selectedTransaction.transactionId}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Amount</label>
                                        <p className="mt-1 text-xl font-semibold text-gray-900">
                                            {formatCurrency(selectedTransaction.amount)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Type</label>
                                        <p className="mt-1 text-gray-900">{getTypeLabel(selectedTransaction.type)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Status</label>
                                        <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                                            {selectedTransaction.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                                        <p className="mt-1 text-gray-900">{getPaymentMethodLabel(selectedTransaction.paymentMethod)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Date</label>
                                        <p className="mt-1 text-gray-900">{formatDate(selectedTransaction.createdAt)}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500">User Information</label>
                                    <div className="p-3 mt-1 rounded-md bg-gray-50">
                                        <p className="text-gray-900">{selectedTransaction.user?.name}</p>
                                        <p className="text-sm text-gray-600">{selectedTransaction.user?.email}</p>
                                        <p className="text-sm text-gray-600">{selectedTransaction.user?.phone}</p>
                                    </div>
                                </div>

                                {selectedTransaction.description && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Description</label>
                                        <p className="p-3 mt-1 text-gray-900 rounded-md bg-gray-50">
                                            {selectedTransaction.description}
                                        </p>
                                    </div>
                                )}

                                {selectedTransaction.loan && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Related Loan</label>
                                        <p className="p-3 mt-1 text-gray-900 rounded-md bg-gray-50">
                                            {selectedTransaction.loan.loanAccountNumber}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Admin Actions */}
                            <div className="pt-4 mt-6 border-t">
                                <h4 className="mb-3 text-lg font-medium text-gray-900">Admin Actions</h4>
                                <div className="flex space-x-3">
                                    {selectedTransaction.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedTransaction._id, 'completed')}
                                                className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                                            >
                                                Mark as Completed
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedTransaction._id, 'failed')}
                                                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
                                            >
                                                Mark as Failed
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Payment Modal */}
            {showTransactionModal && (
                <div className="fixed inset-0 z-50 w-full h-full overflow-y-auto bg-gray-600 bg-opacity-50">
                    <div className="relative w-full max-w-2xl p-5 mx-auto bg-white border rounded-md shadow-lg top-20">
                        <div className="mt-3">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {modalMode === 'create' ? 'Create New Transaction' : 'Edit Transaction'}
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
                                            value={newTransaction.user}
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
                                            value={newTransaction.loan}
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
                                            value={newTransaction.amount}
                                            onChange={handleInputChange}
                                            className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type *</label>
                                        <select
                                            name="type"
                                            required
                                            value={newTransaction.type}
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
                                            value={newTransaction.paymentMethod}
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
                                            value={newTransaction.status}
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
                                        value={newTransaction.description}
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
                                        {actionLoading ? 'Processing...' : (modalMode === 'create' ? 'Create Transaction' : 'Update Transaction')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedTransaction && (
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
                                        Are you sure you want to delete Transaction <strong>{selectedTransaction.transactionId}</strong>? This action cannot be undone.
                                    </p>
                                    <div className="p-3 mt-4 rounded-md bg-yellow-50">
                                        <p className="text-sm text-yellow-700">
                                            Amount: {formatCurrency(selectedTransaction.amount)}
                                        </p>
                                        <p className="text-sm text-yellow-700">
                                            User: {selectedTransaction.user?.name}
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
                                    {actionLoading ? 'Deleting...' : 'Delete Transaction'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminTransactions;