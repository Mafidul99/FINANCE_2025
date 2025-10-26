import React, { useState } from 'react';
import Footer from './UI/Footer';
import Sidebar from './UI/Sidebar';
import { Link, useLocation,  } from 'react-router-dom';
import Header from './UI/Header';

import logo from '../../assets/favicon.png';
// icon menu
import { MenuIcon } from 'lucide-react';
import { IoCloseOutline } from "react-icons/io5";

function AppLayout({ children, showSidebar = true }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // const { user, logout } = useAuth();
    const location = useLocation();
    // const navigate = useNavigate();

    // Check if current route is admin route
    const isAdminRoute = location.pathname.startsWith('/admin');

    // User navigation items
    const userNavItems = [
        { path: '/dashboard', label: 'Dashboard', exact: true },
        { path: '/loans', label: 'My Loans',  exact: false },
        { path: '/apply-loan', label: 'Apply for Loan', exact: true },
        { path: '/payments', label: 'Payments', exact: false },
        { path: '/transactions', label: 'Transactions', exact: false },
    ];

    // Admin navigation items
    const adminNavItems = [
        { path: '/admin/dashboard', label: 'Admin Dashboard',  exact: true },
        { path: '/admin/users', label: 'Admin Manage Users',  exact: false },
        { path: '/admin/loans', label: 'Admin Loan Management',  exact: false },
        { path: '/admin/payments', label: 'Admin Payments', exact: false },
        { path: '/admin/transactions', label: 'Admin Transactions',  exact: false },
        { path: '/admin/reports', label: 'Admin Reports & Analytics', exact: false },
        { path: '/admin/settings', label: 'Admin Settings', exact: false },
    ];

    const navItems = isAdminRoute ? adminNavItems : userNavItems;

    const isActiveRoute = (path) => {
        if (path === '/admin' && location.pathname === '/admin') return true;
        if (path !== '/admin' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar for Desktop */}
            {showSidebar && (
                <>
                    {/* Mobile Sidebar Backdrop */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 z-50 flex lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50"></div>
                        </div>
                    )}

                    {/* Sidebar */}
                    <div className={`
                                fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50
                                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                                lg:translate-x-0 lg:static lg:inset-0
                            `}>
                        {/* Logo/Brand */}
                        <div className="flex items-center justify-between h-16 px-4 text-gray-800 bg-green-100">
                            <div className="flex items-center space-x-2">
                                <span className="w-10 h-10 text-2xl">
                                    <img src={logo} alt="Logo" />
                                </span>
                                <h1 className="text-xl font-bold">Nofino Finance</h1>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="text-gray-800 lg:hidden hover:text-red-500"
                            >
                                <IoCloseOutline className="w-6 h-6"/>
                            </button>
                        </div>

                        <Sidebar />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col ${showSidebar ? 'lg:ml-0' : ''}`}>
                {/* Top Navigation Bar */}
                {showSidebar && (
                    <header className="bg-white border-b border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center">
                                <button
                                    onClick={toggleSidebar}
                                    className="text-gray-500 lg:hidden hover:text-gray-600"
                                >
                                    <MenuIcon className="w-6 h-6"/>
                                </button>
                                <div className="ml-4">
                                    <h1 className="text-lg font-semibold text-gray-900">
                                        {navItems.find(item => isActiveRoute(item.path))?.label || 'Nofino Finance'}
                                    </h1>
                                </div>
                            </div>

                            <Header />
                        </div>
                    </header>
                )}

                {/* Page Content */}
                <main className={`flex-1 ${showSidebar ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
                    {children}
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </div>

    );
}

export default AppLayout;