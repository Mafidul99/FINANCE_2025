import React, { } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

// icon menu
import {
    FcBusinessman, FcPrivacy,
    FcSettings
} from "react-icons/fc";

import { MenuIcon } from "lucide-react";

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>

            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 010 12 6 6 0 010-12z" />
                    </svg>
                    <span className="absolute top-0 right-0 block w-2 h-2 bg-red-400 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative group">
                    <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                            <span className="text-sm font-medium text-indigo-600">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="hidden md:block">{user?.name}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 z-50 hidden w-48 py-1 mt-2 bg-white rounded-md shadow-lg group-hover:block">
                        <div className="px-4 py-2 text-xs text-gray-500 border-b">
                            Signed in as <br />
                            <span className="font-medium text-gray-900">{user?.email}</span>
                        </div>
                        <Link
                            to="/dashboard"
                            className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <FcBusinessman className='block w-5 h-5 mr-1' />
                            Your Profile
                        </Link>
                        <Link
                            to="/settings"
                            className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            <FcSettings className='block w-5 h-5 mr-1' />
                            Settings
                        </Link>
                        <div className="border-t">
                            <button
                                onClick={handleLogout}
                                className="flex w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                            >
                                <FcPrivacy className='block w-5 h-5 mr-1' />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Header