import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import borrowerService from '../../services/borrowerService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import LoanApplicationDetailsModal from '../../components/Modals/LoanApplicationDetailsModal';
import DocumentDetailsModal from '../../components/Modals/DocumentDetailsModal';

const BorrowerDashboard = () => {
  const { user, profileCreating, borrowerProfile, hasProfile, borrowerId } = useAuth();
  const [loanApplications, setLoanApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('loans');
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If borrower profile exists, get loan applications and documents
        if (hasProfile && borrowerId) {
          console.log('📊 Fetching loan applications for borrower ID:', borrowerId);
          const loansData = await borrowerService.getLoanApplications(borrowerId);
          setLoanApplications(loansData);
          
          console.log('📄 Fetching documents for borrower ID:', borrowerId);
          const documentsData = await borrowerService.getDocuments(borrowerId);
          setDocuments(documentsData);
        }
      } catch (error) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hasProfile, borrowerId]); // Re-run when profile status changes

  const handleViewLoanDetails = (loanId) => {
    setSelectedLoanId(loanId);
    setShowLoanModal(true);
  };

  const handleViewDocumentDetails = (documentId) => {
    setSelectedDocumentId(documentId);
    setShowDocumentModal(true);
  };

  const handleCloseLoanModal = () => {
    setShowLoanModal(false);
    setSelectedLoanId(null);
  };

  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false);
    setSelectedDocumentId(null);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (profileCreating) {
    return <LoadingSpinner message="Setting up your profile..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Borrower Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.fullName || user?.email}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Profile Status */}
      {!hasProfile ? (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Complete Your Profile</h2>
          <p className="text-blue-700 mb-4">
            Please complete your borrower profile to start applying for loans.
          </p>
          <Link 
            to="/borrower/apply" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Complete Profile
          </Link>
        </div>
      ) : (
        /* Quick Stats */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Applications</h3>
            <p className="text-3xl font-bold text-blue-600">{loanApplications.length}</p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved Loans</h3>
            <p className="text-3xl font-bold text-green-600">
              {loanApplications.filter(loan => loan.status === 'APPROVED').length}
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reviews</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {loanApplications.filter(loan => ['PENDING', 'UNDER_REVIEW'].includes(loan.status)).length}
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Documents</h3>
            <p className="text-3xl font-bold text-purple-600">{documents.length}</p>
          </div>
        </div>
      )}

      {/* Quick Actions - Only show when profile exists */}
      {hasProfile && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/borrower/apply" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Apply for Loan</h3>
              <p className="text-gray-600 mt-2">Submit a new loan application</p>
            </div>
          </Link>

          <Link to="/borrower/documents" className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <p className="text-gray-600 mt-2">Upload and manage documents</p>
            </div>
          </Link>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Loan Calculator</h3>
              <p className="text-gray-600 mt-2">Calculate loan payments</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Loan Applications - Only show when profile exists */}
      {hasProfile && (
      <div className="card">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'loans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Loan Applications ({loanApplications.length})
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents ({documents.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'loans' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Loan Applications</h2>
              <Link to="/borrower/apply" className="btn btn-primary">
                New Application
              </Link>
            </div>

            {loanApplications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No loan applications yet</h3>
                <p className="text-gray-600 mb-4">Start by applying for your first loan</p>
                <Link to="/borrower/apply" className="btn btn-primary">
                  Apply Now
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applied Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loanApplications.map((loan) => (
                      <tr key={loan.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {loan.loanType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${loan.loanAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(loan.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleViewLoanDetails(loan.id)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
              <Link to="/borrower/documents" className="btn btn-primary">
                Upload Document
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📄</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
                <p className="text-gray-600 mb-4">Upload your first document to get started</p>
                <Link to="/borrower/documents" className="btn btn-primary">
                  Upload Now
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.documentName}</div>
                            <div className="text-sm text-gray-500">{doc.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.documentType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(doc.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-4"
                            onClick={() => handleViewDocumentDetails(doc.id)}
                          >
                            View Details
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Modals */}
      <LoanApplicationDetailsModal
        isOpen={showLoanModal}
        onClose={handleCloseLoanModal}
        loanId={selectedLoanId}
        borrowerId={borrowerId}
      />
      
      <DocumentDetailsModal
        isOpen={showDocumentModal}
        onClose={handleCloseDocumentModal}
        documentId={selectedDocumentId}
        borrowerId={borrowerId}
      />
    </div>
  );
};

export default BorrowerDashboard;
