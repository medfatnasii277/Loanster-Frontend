import React, { useState, useEffect } from 'react';
import borrowerService from '../../services/borrowerService';
import LoadingSpinner from '../Common/LoadingSpinner';

const DocumentDetailsModal = ({ isOpen, onClose, documentId, borrowerId }) => {
  const [documentDetails, setDocumentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocumentDetails();
    }
  }, [isOpen, documentId]);

  const fetchDocumentDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const details = await borrowerService.getDocumentDetails(documentId, borrowerId);
      setDocumentDetails(details);
    } catch (error) {
      setError('Failed to load document details');
      console.error('Error fetching document details:', error);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Document Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          {loading && <LoadingSpinner message="Loading document details..." />}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {documentDetails && (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Document Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(documentDetails.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Document ID:</span>
                      <span className="text-sm font-medium">{documentDetails.documentId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Uploaded Date:</span>
                      <span className="text-sm font-medium">
                        {documentDetails.uploadedAtSource ? new Date(documentDetails.uploadedAtSource).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {documentDetails.statusUpdatedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Updated:</span>
                        <span className="text-sm font-medium">
                          {new Date(documentDetails.statusUpdatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">File Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">File Name:</span>
                      <span className="text-sm font-medium">{documentDetails.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Document Type:</span>
                      <span className="text-sm font-medium">{documentDetails.documentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">File Size:</span>
                      <span className="text-sm font-medium">{formatFileSize(documentDetails.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Content Type:</span>
                      <span className="text-sm font-medium">{documentDetails.contentType}</span>
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
                      <span className="text-sm font-medium">{documentDetails.borrowerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Borrower ID:</span>
                      <span className="text-sm font-medium">{documentDetails.borrowerId}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {documentDetails.loanApplicationId && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Loan Application ID:</span>
                          <span className="text-sm font-medium">{documentDetails.loanApplicationId}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status History */}
              {documentDetails.status === 'REJECTED' && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Rejection Information</h4>
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800">
                      This document was rejected. Please check the requirements and upload a new version.
                    </p>
                    {documentDetails.statusUpdatedBy && (
                      <p className="text-sm text-red-700 mt-2">
                        Reviewed by: {documentDetails.statusUpdatedBy}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {documentDetails.status === 'APPROVED' && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Approval Information</h4>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-sm text-green-800">
                      This document has been approved and is ready for processing.
                    </p>
                    {documentDetails.statusUpdatedBy && (
                      <p className="text-sm text-green-700 mt-2">
                        Approved by: {documentDetails.statusUpdatedBy}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* File Path (for debugging/admin purposes) */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">File Location</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                  <p className="text-sm text-gray-600 break-all">
                    {documentDetails.filePath}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailsModal;
