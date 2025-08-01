import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import officerService from '../../services/officerService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const LoanReviewPage = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loan, setLoan] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusAction, setStatusAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchLoanDetails();
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const [loanData, documentsData] = await Promise.all([
        officerService.getLoan(loanId),
        officerService.getLoanDocuments(loanId)
      ]);
      setLoan(loanData);
      setDocuments(documentsData || []);
      setError('');
    } catch (error) {
      setError('Failed to load loan details');
      console.error('Loan details error:', error);
    } finally {
      setLoading(false);
    }
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

  const openStatusModal = (action) => {
    setStatusAction(action);
    setRejectionReason('');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!statusAction) return;

    try {
      const statusData = {
        newStatus: statusAction,
        updatedBy: user?.fullName || user?.email,
        ...(rejectionReason && { rejectionReason })
      };

      await officerService.updateLoanStatus(loanId, statusData);
      setSuccess(`Loan application ${statusAction.toLowerCase()} successfully`);
      
      // Refresh loan data
      await fetchLoanDetails();
      setShowStatusModal(false);
    } catch (error) {
      setError('Failed to update loan status');
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
      const documentsData = await officerService.getLoanDocuments(loanId);
      setDocuments(documentsData || []);
    } catch (error) {
      setError('Failed to update document status');
      console.error('Document status update error:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading loan details..." />;
  }

  if (!loan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loan Not Found</h2>
          <button
            onClick={() => navigate('/officer/dashboard')}
            className="btn btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Loan Application Review
          </h1>
          <p className="text-gray-600 mt-2">
            Application #{loan.applicationId || loan.id}
          </p>
        </div>
        <button
          onClick={() => navigate('/officer/dashboard')}
          className="btn btn-secondary"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Loan Details */}
        <div className="lg:col-span-2">
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Loan Application Details</h2>
              {getStatusBadge(loan.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Loan Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loan Amount</label>
                    <p className="text-lg font-semibold text-gray-900">
                      ${loan.loanAmount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loan Term</label>
                    <p className="text-gray-900">{loan.loanTermMonths} months</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Interest Rate</label>
                    <p className="text-gray-900">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Monthly Payment</label>
                    <p className="text-gray-900">${loan.monthlyPayment?.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Purpose</label>
                    <p className="text-gray-900">{loan.loanPurpose || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Borrower Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">
                      {loan.borrower?.firstName} {loan.borrower?.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{loan.borrower?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{loan.borrower?.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Annual Income</label>
                    <p className="text-gray-900">
                      ${loan.borrower?.annualIncome?.toLocaleString() || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employment Status</label>
                    <p className="text-gray-900">{loan.borrower?.employmentStatus || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Applied Date</label>
                  <p className="text-gray-900">
                    {loan.appliedAtSource ? new Date(loan.appliedAtSource).toLocaleDateString() : 
                     loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <p className="text-gray-900">{loan.status}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Supporting Documents</h2>
            
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                <p className="text-gray-600">No supporting documents have been uploaded for this loan application.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.documentId || doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {doc.documentName || doc.fileName}
                          </h4>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Type: {doc.documentType}</span>
                          <span>Size: {(doc.fileSize / 1024).toFixed(1)} KB</span>
                          <span>
                            Uploaded: {doc.uploadedAtSource ? new Date(doc.uploadedAtSource).toLocaleDateString() : 
                                     doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        {(doc.status === 'PENDING' || doc.status === 'UNDER_REVIEW') && (
                          <>
                            <button
                              onClick={() => handleDocumentStatusUpdate(doc.documentId || doc.id, 'VERIFIED')}
                              className="text-green-600 hover:text-green-900 text-sm"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt('Rejection reason:');
                                if (reason) handleDocumentStatusUpdate(doc.documentId || doc.id, 'REJECTED', reason);
                              }}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            
            {loan.status === 'PENDING' && (
              <div className="space-y-3">
                <button
                  onClick={() => openStatusModal('UNDER_REVIEW')}
                  className="w-full btn btn-primary"
                >
                  Start Review
                </button>
                <button
                  onClick={() => openStatusModal('APPROVED')}
                  className="w-full btn btn-success"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => openStatusModal('REJECTED')}
                  className="w-full btn btn-danger"
                >
                  Reject Application
                </button>
              </div>
            )}

            {loan.status === 'UNDER_REVIEW' && (
              <div className="space-y-3">
                <button
                  onClick={() => openStatusModal('APPROVED')}
                  className="w-full btn btn-success"
                >
                  Approve Application
                </button>
                <button
                  onClick={() => openStatusModal('REJECTED')}
                  className="w-full btn btn-danger"
                >
                  Reject Application
                </button>
              </div>
            )}

            {(loan.status === 'APPROVED' || loan.status === 'REJECTED') && (
              <div className="text-center py-4">
                <p className="text-gray-600">
                  This application has been {loan.status.toLowerCase()}.
                </p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Application Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Documents:</span>
                  <span className="text-gray-900">{documents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Verified:</span>
                  <span className="text-gray-900">
                    {documents.filter(d => d.status === 'VERIFIED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pending:</span>
                  <span className="text-gray-900">
                    {documents.filter(d => d.status === 'PENDING').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {statusAction === 'REJECTED' ? 'Reject Application' : 
                 statusAction === 'APPROVED' ? 'Approve Application' : 'Update Status'}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Loan Application: <span className="font-medium">#{loan.applicationId || loan.id}</span>
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

export default LoanReviewPage;
