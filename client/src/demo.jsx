import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Components


// User Components
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/User/UserDashboard';
import Loans from './pages/User/Loans';
import ApplyLoan from './pages/User/ApplyLoan';
import Transactions from './pages/User/Transactions';


// Admin Components
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminReports from './pages/Admin/AdminReports';
import AdminTransactions from './pages/Admin/AdminTransactions';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminLoans from './pages/Admin/AdminLoans';



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/loans" element={
              <ProtectedRoute>
                <Loans />
              </ProtectedRoute>
            } />
            
            <Route path="/apply-loan" element={
              <ProtectedRoute>
                <ApplyLoan />
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/users" element={
              <ProtectedRoute adminOnly={true}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/loans" element={
              <ProtectedRoute adminOnly={true}>
                <AdminLoans />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/transactions" element={
              <ProtectedRoute adminOnly={true}>
                <AdminTransactions />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/reports" element={
              <ProtectedRoute adminOnly={true}>
                <AdminReports />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/settings" element={
              <ProtectedRoute adminOnly={true}>
                <AdminSettings />
              </ProtectedRoute>
            } />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <div className="space-x-4">
                    <Navigate to="/dashboard">
                      <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-200">
                        Go to Dashboard
                      </button>
                    </Navigate>
                    <button
                      onClick={() => window.history.back()}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition duration-200"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;