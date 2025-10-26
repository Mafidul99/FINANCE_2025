// import React, { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';


// icon menu
import {
    FcBusinessman, FcLibrary, FcConferenceCall, FcHome, FcSalesPerformance, FcMoneyTransfer
    , FcPositiveDynamic, FcSettings, FcNews, FcDepartment, FcPrivacy
} from "react-icons/fc";

const Sidebar = () => {
    // const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Check if current route is admin route
    const isAdminRoute = location.pathname.startsWith('/admin');

    // User navigation items
    const userNavItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <FcHome className=' w-7 h-7' />, exact: true },
        { path: '/loans', label: 'My Loans', icon: <FcLibrary className=' w-7 h-7' />, exact: false },
        { path: '/apply-loan', label: 'Apply for Loan', icon: <FcNews className=' w-7 h-7' />, exact: true },
        { path: '/payments', label: 'Payments', icon: <FcMoneyTransfer className=' w-7 h-7' />, exact: false },
        { path: '/transactions', label: 'Transactions', icon: <FcSalesPerformance className=' w-7 h-7' />, exact: false },
    ];

    // Admin navigation items
    const adminNavItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <FcHome className=' w-7 h-7' />, exact: true },
        { path: '/admin/users', label: 'Manage Users', icon: <FcConferenceCall className=' w-7 h-7' />, exact: false },
        { path: '/admin/loans', label: 'Loan Management', icon: <FcLibrary className=' w-7 h-7' />, exact: false },
        { path: '/admin/payments', label: 'Payments', icon: <FcSalesPerformance className=' w-7 h-7' />, exact: false },
        { path: '/admin/transactions', label: 'Transactions', icon: <FcMoneyTransfer className=' w-7 h-7' />, exact: false },
        { path: '/admin/reports', label: 'Reports & Analytics', icon: <FcPositiveDynamic className=' w-7 h-7' />, exact: false },
        { path: '/admin/settings', label: 'Settings', icon: <FcSettings className=' w-7 h-7' />, exact: false },
    ];

    const navItems = isAdminRoute ? adminNavItems : userNavItems;

    const isActiveRoute = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* User Info */}
            <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full">
                        <span className="text-sm font-medium text-indigo-600">
                            {user?.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${user?.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                            }`}>
                            {user?.role}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center ml-auto ">
                    <div className="flex items-center font-medium text-red-600" >
                        <FcPrivacy className="flex items-center w-6 h-6 mr-1 text-lg" />
                        <span className="items-center block text-sm">LogOut</span>
                    </div>
                </button>
            </div>
            {/* Bottom Actions */}
            <div className="px-4 py-4 space-y-4 border-b border-gray-300">
                {!isAdminRoute && user?.role === 'admin' && (
                    <Link
                        to="/admin/dashboard"
                        className="flex items-center px-3 py-2 space-x-3 text-sm font-medium text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100 hover:text-gray-900"
                    >
                        <span className="text-lg">
                            <FcDepartment className=' w-7 h-7' />
                        </span>
                        <span>Admin Panel</span>
                    </Link>
                )}
                {isAdminRoute && (
                    <Link
                        to="/dashboard"
                        className="flex items-center px-3 py-2 space-x-3 text-sm font-medium text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-100 hover:text-gray-900"
                    >
                        <span className="text-lg">
                            <FcBusinessman className='w-7 h-7' />
                        </span>
                        <span>User Dashboard</span>
                    </Link>
                )}
            </div>
            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 mt-2 space-y-4 overflow-y-auto">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        // onClick={() => setSidebarOpen(false)}
                        className={`
                                flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                                ${isActiveRoute(item.path, item.exact)
                                ? 'bg-green-100 text-gray-900 border-r-4 border-red-600'
                                : 'text-gray-600 hover:bg-green-100 hover:text-gray-900'
                            }`}>
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

        </>
    )
}

export default Sidebar