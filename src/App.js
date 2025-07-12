import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import BorrowerDashboard from './pages/Borrower/BorrowerDashboard';
import OfficerDashboard from './pages/Officer/OfficerDashboard';
import LoanApplicationPage from './pages/Borrower/LoanApplicationPage';
import DocumentsPage from './pages/Borrower/DocumentsPage';
import LoanReviewPage from './pages/Officer/LoanReviewPage';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// Main App Layout
function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// App Router Component
function AppRouter() {
  const { user } = useAuth();
  
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <AppLayout>
            {user ? (
              user.role === 'BORROWER' ? (
                <Navigate to="/borrower/dashboard" replace />
              ) : (
                <Navigate to="/officer/dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )}
          </AppLayout>
        } />
        
        {/* Borrower Routes */}
        <Route path="/borrower/dashboard" element={
          <ProtectedRoute requiredRole="BORROWER">
            <AppLayout>
              <BorrowerDashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/borrower/apply" element={
          <ProtectedRoute requiredRole="BORROWER">
            <AppLayout>
              <LoanApplicationPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/borrower/documents" element={
          <ProtectedRoute requiredRole="BORROWER">
            <AppLayout>
              <DocumentsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        {/* Officer Routes */}
        <Route path="/officer/dashboard" element={
          <ProtectedRoute requiredRole="OFFICER">
            <AppLayout>
              <OfficerDashboard />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/officer/review/:loanId" element={
          <ProtectedRoute requiredRole="OFFICER">
            <AppLayout>
              <LoanReviewPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRouter />
      </div>
    </AuthProvider>
  );
}

export default App;
