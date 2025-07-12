import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import officerService from '../../services/officerService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const LoanReviewPage = () => {
  const { loanId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loan, setLoan] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [statusUpdate, setStatusUpdate] = useState({
    newStatus: '',
    rejectionReason: '',
    notes: '',
  });

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        const [loanData, documentsData] = await Promise.all([
          officerService.getLoan(loanId),
          officerService.getLoanDocuments(loanId)
        ]);
        setLoan(loanData);
        setDocuments(documentsData);
        setStatusUpdate({
          newStatus: loanData.status,
          rejectionReason: '',
          notes: '',
        });
      } catch (error) {
        setError('Failed to load loan details');
        console.error('Loan details error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);

  const handleStatusChange = (e) => {
    setStatusUpdate({
      ...statusUpdate,
      [e.target.name]: e.target.value,
    });
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      const updateData = {
        newStatus: statusUpdate.newStatus,
        updatedBy: user.fullName || user.email,
        ...(statusUpdate.rejectionReason && { rejectionReason: statusUpdate.rejectionReason }),
      };

      await officerService.updateLoanStatus(loanId, updateData);
      setSuccess('Loan status updated successfully!');
      
      // Refresh loan data
      const updatedLoan = await officerService.getLoan(loanId);
      setLoan(updatedLoan);
      
    } catch (error) {
      setError('Failed to update loan status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading loan details..." />;
  }

  if (!loan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loan Not Found</h1>
          <button onClick={() => navigate('/officer/dashboard')} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Loan Review</h1>
            <p className="text-gray-600 mt-2">Application ID: {loan.id}</p>
          </div>
          <div className="flex items-center space-x-4">
            {getStatusBadge(loan.status)}
            <button
              onClick={() => navigate('/officer/dashboard')}
              className="btn btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

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
        {/* Left Column - Loan Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Applicant Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900">{loan.borrower?.firstName} {loan.borrower?.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{loan.borrower?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{loan.borrower?.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{loan.borrower?.dateOfBirth}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Annual Income</label>
                <p className="text-gray-900">${loan.borrower?.annualIncome?.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Employment Status</label>
                <p className="text-gray-900">{loan.borrower?.employmentStatus}</p>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Loan Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Loan Type</label>
                <p className="text-gray-900">{loan.loanType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Loan Amount</label>
                <p className="text-gray-900 text-xl font-semibold">${loan.loanAmount?.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Term</label>
                <p className="text-gray-900">{loan.loanTermMonths} months</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Interest Rate</label>
                <p className="text-gray-900">{loan.interestRate}%</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Purpose</label>
                <p className="text-gray-900">{loan.purpose}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Application Date</label>
                <p className="text-gray-900">
                  {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Current Status</label>
                <div className="mt-1">{getStatusBadge(loan.status)}</div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Supporting Documents</h2>
            {documents.length === 0 ? (
              <p className="text-gray-500">No documents uploaded yet</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.documentName}</h4>
                      <p className="text-sm text-gray-500">{doc.documentType} - {doc.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(doc.status)}
                      <button className="text-blue-600 hover:text-blue-900 text-sm">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Status Update */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Update Status</h2>
            
            <form onSubmit={handleStatusSubmit}>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select
                  name="newStatus"
                  required
                  className="form-input"
                  value={statusUpdate.newStatus}
                  onChange={handleStatusChange}
                >
                  <option value="PENDING">Pending</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {statusUpdate.newStatus === 'REJECTED' && (
                <div className="form-group">
                  <label className="form-label">Rejection Reason</label>
                  <textarea
                    name="rejectionReason"
                    required
                    rows="3"
                    className="form-input"
                    placeholder="Please provide a reason for rejection..."
                    value={statusUpdate.rejectionReason}
                    onChange={handleStatusChange}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows="4"
                  className="form-input"
                  placeholder="Add any additional notes..."
                  value={statusUpdate.notes}
                  onChange={handleStatusChange}
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full btn btn-primary disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => setStatusUpdate({ ...statusUpdate, newStatus: 'UNDER_REVIEW' })}
                className="w-full btn btn-secondary text-left"
              >
                🔍 Start Review
              </button>
              <button
                onClick={() => setStatusUpdate({ ...statusUpdate, newStatus: 'APPROVED' })}
                className="w-full btn btn-success text-left"
              >
                ✅ Approve Loan
              </button>
              <button
                onClick={() => setStatusUpdate({ ...statusUpdate, newStatus: 'REJECTED' })}
                className="w-full btn btn-danger text-left"
              >
                ❌ Reject Loan
              </button>
            </div>
          </div>

          {/* Loan Calculation */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Calculation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Principal:</span>
                <span className="font-medium">${loan.loanAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Interest Rate:</span>
                <span className="font-medium">{loan.interestRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Term:</span>
                <span className="font-medium">{loan.loanTermMonths} months</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-base">
                <span className="text-gray-900 font-medium">Monthly Payment:</span>
                <span className="font-bold text-green-600">
                  ${((loan.loanAmount * (loan.interestRate / 100 / 12)) / (1 - Math.pow(1 + (loan.interestRate / 100 / 12), -loan.loanTermMonths))).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanReviewPage;
