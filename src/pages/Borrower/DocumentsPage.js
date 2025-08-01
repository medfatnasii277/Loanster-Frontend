import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import borrowerService from '../../services/borrowerService';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const DocumentsPage = () => {
  const { user, borrowerProfile, hasProfile, borrowerId } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [uploadData, setUploadData] = useState({
    documentName: '',
    documentType: 'ID_PROOF',
    description: '',
    file: null,
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (hasProfile && borrowerId) {
          console.log('📄 Fetching documents for borrower ID:', borrowerId);
          const documentsData = await borrowerService.getDocuments(borrowerId);
          setDocuments(documentsData);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          setError('Failed to load documents');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [hasProfile, borrowerId]); // Re-run when profile status changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData({
      ...uploadData,
      [name]: value,
    });
    
    // Clear messages when user starts typing
    if (error || success) {
      setError('');
      setSuccess('');
    }
  };

  const handleFileChange = (e) => {
    setUploadData({
      ...uploadData,
      file: e.target.files[0],
    });
    
    // Clear messages when user selects a file
    if (error || success) {
      setError('');
      setSuccess('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      setError('Please select a file to upload');
      setSuccess(''); // Clear success message when showing error
      return;
    }

    setUploading(true);
    setError(''); // Clear previous messages
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('documentName', uploadData.documentName);
      formData.append('documentType', uploadData.documentType);
      formData.append('description', uploadData.description);

      console.log('📤 Uploading document for borrower ID:', borrowerId);
      
      if (!borrowerId) {
        setError('Borrower profile not found. Please complete your profile first.');
        return;
      }

      await borrowerService.uploadDocument(borrowerId, formData);
      setSuccess('Document uploaded successfully!');
      setError(''); // Clear any previous errors
      
      // Reset form
      setUploadData({
        documentName: '',
        documentType: 'ID_PROOF',
        description: '',
        file: null,
      });
      
      // Refresh documents list
      const documentsData = await borrowerService.getDocuments(borrowerId);
      setDocuments(documentsData);
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload document');
      setSuccess(''); // Clear any previous success message
    } finally {
      setUploading(false);
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

  if (loading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  // Show profile completion message if no profile exists
  if (!hasProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-2">Upload and manage your loan application documents</p>
        </div>
        
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile First</h3>
          <p className="text-gray-600 mb-6">
            You need to complete your borrower profile before you can upload documents.
          </p>
          <a 
            href="/borrower/apply" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Complete Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-600 mt-2">Upload and manage your loan application documents</p>
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

      {/* Upload Form */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Document</h2>
        
        <form onSubmit={handleUpload}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="form-label">Document Name</label>
              <input
                type="text"
                name="documentName"
                required
                className="form-input"
                placeholder="e.g., Driver's License"
                value={uploadData.documentName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Document Type</label>
              <select
                name="documentType"
                required
                className="form-input"
                value={uploadData.documentType}
                onChange={handleInputChange}
              >
                <option value="ID_PROOF">ID Proof</option>
                <option value="INCOME_PROOF">Income Proof</option>
                <option value="ADDRESS_PROOF">Address Proof</option>
                <option value="BANK_STATEMENT">Bank Statement</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              rows="3"
              className="form-input"
              placeholder="Brief description of the document..."
              value={uploadData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Select File</label>
            <input
              type="file"
              required
              className="form-input"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="btn btn-primary disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Documents</h2>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded yet</h3>
            <p className="text-gray-600">Upload your first document to get started</p>
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
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        View
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
    </div>
  );
};

export default DocumentsPage;
