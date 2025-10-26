import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Transactions from './cashFreePg/Transactions';
import Login from './pages/Login';
import Register from './pages/Register';

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
//admin import
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/UserManagement/AdminUsers';
import AdminLoans from './pages/Admin/LoanManagement/AdminLoans';
import AdminReports from './pages/Admin/AdminReports/AdminReports';
import AdminSettings from './pages/Admin/Setting/AdminSettings';
import GeneralSettings from './pages/Admin/Setting/GeneralSettings';
import AdminTransactions from './pages/Admin/Payments/AdminTransactions';
import AdminPayments from './pages/Admin/Payments/AdminPayments';

//user import
import Payments from './pages/User/Payments';
import UserDashboard from './pages/User/UserDashboard';
import ApplyLoan from './pages/User/loan/ApplyLoan';
import Loans from './pages/User/loan/Loans';


// function ProtectedRoute({ children, adminOnly = false }) {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   if (!user) {
//     return <Navigate to="/login" />;
//   }

//   if (adminOnly && user.role !== 'admin') {
//     return <Navigate to="/dashboard" />;
//   }

//   return children;
// }


// Layout Wrapper Component
const LayoutWrapper = ({ children }) => (
  <AppLayout>
    {children}
  </AppLayout>
);

// Protected Route with Layout Wrapper
const ProtectedLayout = ({ children, adminOnly = false }) => (
  <ProtectedRoute adminOnly={adminOnly}>
    <LayoutWrapper>
      {children}
    </LayoutWrapper>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes - No Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes - With Layout */}
            <Route path="/dashboard" element={
              <ProtectedLayout>
                <UserDashboard />
              </ProtectedLayout>
            } />

            <Route path="/loans" element={
              <ProtectedLayout>
                <Loans />
              </ProtectedLayout>
            } />

            <Route path="/apply-loan" element={
              <ProtectedLayout>
                <ApplyLoan />
              </ProtectedLayout>
            } />

            <Route path="/transactions" element={
              <ProtectedLayout>
                <Transactions />
              </ProtectedLayout>
            } />
            <Route path="/payments" element={
              <ProtectedLayout>
                <Payments />
              </ProtectedLayout>
            } />

            {/* Admin Routes - With Layout & Admin Only */}
            <Route path="/admin/dashboard" element={
              <ProtectedLayout adminOnly={true}>
                <AdminDashboard />
              </ProtectedLayout>
            } />

            <Route path="/admin/users" element={
              <ProtectedLayout adminOnly={true}>
                <AdminUsers />
              </ProtectedLayout>
            } />

            <Route path="/admin/loans" element={
              <ProtectedLayout adminOnly={true}>
                <AdminLoans />
              </ProtectedLayout>
            } />

            <Route path="/admin/transactions" element={
              <ProtectedLayout adminOnly={true}>
                <AdminTransactions />
              </ProtectedLayout>
            } />

             <Route path="/admin/payments" element={
              <ProtectedLayout adminOnly={true}>
                <AdminPayments />
              </ProtectedLayout>
            } />

            <Route path="/admin/reports" element={
              <ProtectedLayout adminOnly={true}>
                <AdminReports />
              </ProtectedLayout>
            } />

            <Route path="/admin/settings" element={
              <ProtectedLayout adminOnly={true}>
                <AdminSettings />
              </ProtectedLayout>
            } />

            <Route path="/admin/general-settings" element={
              <ProtectedLayout adminOnly={true}>
                <GeneralSettings />
              </ProtectedLayout>
            } />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Route - With Layout */}
            <Route path="*" element={
              <ProtectedLayout>
                <div className="flex items-center justify-center min-h-96">
                  <div className="text-center">
                    <h1 className="mb-4 text-6xl font-bold text-gray-900">404</h1>
                    <p className="mb-8 text-xl text-gray-600">Page not found</p>
                    <div className="space-x-4">
                      <Navigate to="/dashboard">
                        <button className="px-6 py-3 text-white transition duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700">
                          Go to Dashboard
                        </button>
                      </Navigate>
                    </div>
                  </div>
                </div>
              </ProtectedLayout>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;