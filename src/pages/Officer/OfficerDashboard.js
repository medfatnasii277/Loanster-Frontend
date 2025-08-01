import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import officerService from '../../services/officerService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('loans');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [statusAction, setStatusAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansData, documentsData] = await Promise.all([
        officerService.getAllLoans(),
        officerService.getAllDocuments()
      ]);
      setLoans(loansData || []);
      setDocuments(documentsData || []);
      setError('');
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      VERIFIED: 'bg-green-100 text-green-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const openStatusModal = (item, action, type) => {
    setSelectedItem({ ...item, type });
    setStatusAction(action);
    setRejectionReason('');
    setShowStatusModal(true);
    clearMessages();
  };

  const handleStatusUpdate = async () => {
    if (!selectedItem || !statusAction) return;

    try {
      const statusData = {
        newStatus: statusAction,
        updatedBy: user?.fullName || user?.email,
        ...(rejectionReason && { rejectionReason })
      };

      if (selectedItem.type === 'loan') {
        await officerService.updateLoanStatus(selectedItem.applicationId || selectedItem.id, statusData);
        setSuccess(`Loan application ${statusAction.toLowerCase()} successfully`);
      } else if (selectedItem.type === 'document') {
        await officerService.updateDocumentStatus(selectedItem.documentId || selectedItem.id, statusData);
        setSuccess(`Document ${statusAction.toLowerCase()} successfully`);
      }

      // Refresh data
      await fetchData();
      setShowStatusModal(false);
      setSelectedItem(null);
    } catch (error) {
      setError(`Failed to update ${selectedItem.type} status`);
      console.error('Status update error:', error);
    }
  };

  const handleDocumentStatusUpdate = async (documentId, newStatus, rejectionReason = '') => {
    try {
      const statusData = {
        newStatus,
        updatedBy: user?.fullName || user?.email,
        ...(rejectionReason && { rejectionReason })
      };
      
      await officerService.updateDocumentStatus(documentId, statusData);
      setSuccess(`Document ${newStatus.toLowerCase()} successfully`);
      
      // Refresh documents data
      const documentsData = await officerService.getAllDocuments();
      setDocuments(documentsData || []);
      clearMessages();
    } catch (error) {
      setError('Failed to update document status');
      console.error('Document status update error:', error);
    }
  };

  const filteredLoans = selectedStatus === 'ALL' 
    ? loans 
    : loans.filter(loan => loan.status === selectedStatus);

  const filteredDocuments = selectedStatus === 'ALL' 
    ? documents 
    : documents.filter(doc => doc.status === selectedStatus);

  if (loading) {
    return <LoadingSpinner message="Loading officer dashboard..." />;
  }

  const pendingLoans = loans.filter(loan => loan.status === 'PENDING').length;
  const underReviewLoans = loans.filter(loan => loan.status === 'UNDER_REVIEW').length;
  const approvedLoans = loans.filter(loan => loan.status === 'APPROVED').length;
  const rejectedLoans = loans.filter(loan => loan.status === 'REJECTED').length;

  const pendingDocuments = documents.filter(doc => doc.status === 'PENDING').length;
  const reviewingDocuments = documents.filter(doc => doc.status === 'UNDER_REVIEW').length;
  const verifiedDocuments = documents.filter(doc => doc.status === 'VERIFIED').length;
  const rejectedDocuments = documents.filter(doc => doc.status === 'REJECTED').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Officer Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.fullName || user?.email}</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
          <button onClick={clearMessages} className="ml-2 text-red-900 hover:text-red-700">×</button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {success}
          <button onClick={clearMessages} className="ml-2 text-green-900 hover:text-green-700">×</button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Loans</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingLoans}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Under Review</h3>
          <p className="text-3xl font-bold text-blue-600">{underReviewLoans}</p>
          <p className="text-sm text-gray-500 mt-1">Being processed</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
          <p className="text-3xl font-bold text-green-600">{approvedLoans}</p>
          <p className="text-sm text-gray-500 mt-1">Successful applications</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rejected</h3>
          <p className="text-3xl font-bold text-red-600">{rejectedLoans}</p>
          <p className="text-sm text-gray-500 mt-1">Declined applications</p>
        </div>
      </div>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Docs</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingDocuments}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting verification</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviewing Docs</h3>
          <p className="text-3xl font-bold text-blue-600">{reviewingDocuments}</p>
          <p className="text-sm text-gray-500 mt-1">Under review</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Verified Docs</h3>
          <p className="text-3xl font-bold text-green-600">{verifiedDocuments}</p>
          <p className="text-sm text-gray-500 mt-1">Approved documents</p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rejected Docs</h3>
          <p className="text-3xl font-bold text-red-600">{rejectedDocuments}</p>
          <p className="text-sm text-gray-500 mt-1">Declined documents</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'loans'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Loan Applications ({loans.length})
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
      </div>

      {/* Tab Content */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTab === 'loans' ? 'Loan Applications' : 'Documents Management'}
          </h2>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-input w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            {activeTab === 'loans' ? (
              <>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </>
            ) : (
              <>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </>
            )}
          </select>
        </div>

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <>
            {filteredLoans.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No loan applications found</h3>
                <p className="text-gray-600">No applications match the selected status</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Applicant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Term
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
                    {filteredLoans.map((loan) => (
                      <tr key={loan.applicationId || loan.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{loan.applicationId || loan.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {loan.borrower?.firstName} {loan.borrower?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{loan.borrower?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${loan.loanAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loan.loanTermMonths} months
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(loan.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {loan.appliedAtSource ? new Date(loan.appliedAtSource).toLocaleDateString() : 
                           loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openStatusModal(loan, 'UNDER_REVIEW', 'loan')}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={loan.status === 'UNDER_REVIEW' || loan.status === 'APPROVED' || loan.status === 'REJECTED'}
                          >
                            Review
                          </button>
                          
                          {(loan.status === 'PENDING' || loan.status === 'UNDER_REVIEW') && (
                            <>
                              <button
                                onClick={() => openStatusModal(loan, 'APPROVED', 'loan')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openStatusModal(loan, 'REJECTED', 'loan')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <>
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📄</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600">No documents match the selected status</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Borrower
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Loan Application
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
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.documentId || doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{doc.documentId || doc.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{doc.documentName || doc.fileName}</div>
                            <div className="text-sm text-gray-500">{doc.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.documentType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {doc.borrower?.firstName} {doc.borrower?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{doc.borrower?.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.loanApplication?.applicationId ? `#${doc.loanApplication.applicationId}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(doc.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.uploadedAtSource ? new Date(doc.uploadedAtSource).toLocaleDateString() : 
                           doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => openStatusModal(doc, 'UNDER_REVIEW', 'document')}
                            className="text-blue-600 hover:text-blue-900"
                            disabled={doc.status === 'UNDER_REVIEW' || doc.status === 'VERIFIED' || doc.status === 'REJECTED'}
                          >
                            Review
                          </button>
                          
                          {(doc.status === 'PENDING' || doc.status === 'UNDER_REVIEW') && (
                            <>
                              <button
                                onClick={() => openStatusModal(doc, 'VERIFIED', 'document')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => openStatusModal(doc, 'REJECTED', 'document')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {statusAction === 'REJECTED' ? 'Reject' : statusAction === 'APPROVED' || statusAction === 'VERIFIED' ? 'Approve' : 'Update Status'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {selectedItem.type === 'loan' ? 'Loan Application' : 'Document'}: 
                  <span className="font-medium"> #{selectedItem.applicationId || selectedItem.documentId || selectedItem.id}</span>
                </p>
                <p className="text-sm text-gray-600">
                  New Status: <span className="font-medium">{statusAction}</span>
                </p>
              </div>

              {statusAction === 'REJECTED' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="form-input w-full h-20"
                    placeholder="Please provide a reason for rejection..."
                    required
                  />
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={statusAction === 'REJECTED' && !rejectionReason.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
