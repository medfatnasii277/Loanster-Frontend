import React, { useState, useEffect } from 'react';
import borrowerService from '../../services/borrowerService';
import LoadingSpinner from '../Common/LoadingSpinner';

const LoanApplicationDetailsModal = ({ isOpen, onClose, loanId, borrowerId }) => {
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && loanId) {
      fetchLoanDetails();
    }
  }, [isOpen, loanId]);

  const fetchLoanDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const details = await borrowerService.getLoanApplicationDetails(loanId, borrowerId);
      setLoanDetails(details);
    } catch (error) {
      setError('Failed to load loan application details');
      console.error('Error fetching loan details:', error);
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
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Loan Application Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          {loading && <LoadingSpinner message="Loading loan details..." />}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {loanDetails && (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Application Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(loanDetails.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Application ID:</span>
                      <span className="text-sm font-medium">{loanDetails.applicationId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Applied Date:</span>
                      <span className="text-sm font-medium">
                        {loanDetails.appliedAtSource ? new Date(loanDetails.appliedAtSource).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {loanDetails.statusUpdatedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Updated:</span>
                        <span className="text-sm font-medium">
                          {new Date(loanDetails.statusUpdatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Loan Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Loan Amount:</span>
                      <span className="text-sm font-medium">${loanDetails.loanAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Term:</span>
                      <span className="text-sm font-medium">{loanDetails.loanTermMonths} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Interest Rate:</span>
                      <span className="text-sm font-medium">{loanDetails.interestRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Payment:</span>
                      <span className="text-sm font-medium">${loanDetails.monthlyPayment?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Purpose:</span>
                      <span className="text-sm font-medium">{loanDetails.loanPurpose}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Borrower Information */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Borrower Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">{loanDetails.borrowerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium">{loanDetails.borrowerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Phone:</span>
                      <span className="text-sm font-medium">{loanDetails.borrowerPhoneNumber}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annual Income:</span>
                      <span className="text-sm font-medium">${loanDetails.borrowerAnnualIncome?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Employment Status:</span>
                      <span className="text-sm font-medium">{loanDetails.borrowerEmploymentStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status History */}
              {loanDetails.status === 'REJECTED' && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Rejection Information</h4>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800">
                      This loan application was rejected. Please contact the loan officer for more details.
                    </p>
                    {loanDetails.statusUpdatedBy && (
                      <p className="text-sm text-red-700 mt-2">
                        Reviewed by: {loanDetails.statusUpdatedBy}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {loanDetails.status === 'APPROVED' && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Approval Information</h4>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-sm text-green-800">
                      Congratulations! Your loan application has been approved.
                    </p>
                    {loanDetails.statusUpdatedBy && (
                      <p className="text-sm text-green-700 mt-2">
                        Approved by: {loanDetails.statusUpdatedBy}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationDetailsModal;
