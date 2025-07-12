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
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loansData, documentsData] = await Promise.all([
          officerService.getAllLoans(),
          officerService.getAllDocuments()
        ]);
        setLoans(loansData);
        setDocuments(documentsData);
      } catch (error) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleStatusUpdate = async (loanId, newStatus, rejectionReason = '') => {
    try {
      const statusData = {
        newStatus,
        updatedBy: user.fullName || user.email,
        ...(rejectionReason && { rejectionReason })
      };
      
      await officerService.updateLoanStatus(loanId, statusData);
      
      // Refresh loans data
      const loansData = await officerService.getAllLoans();
      setLoans(loansData);
    } catch (error) {
      setError('Failed to update loan status');
    }
  };

  const filteredLoans = selectedStatus === 'ALL' 
    ? loans 
    : loans.filter(loan => loan.status === selectedStatus);

  if (loading) {
    return <LoadingSpinner message="Loading officer dashboard..." />;
  }

  const pendingLoans = loans.filter(loan => loan.status === 'PENDING').length;
  const underReviewLoans = loans.filter(loan => loan.status === 'UNDER_REVIEW').length;
  const approvedLoans = loans.filter(loan => loan.status === 'APPROVED').length;
  const rejectedLoans = loans.filter(loan => loan.status === 'REJECTED').length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Officer Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.fullName || user?.email}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending</h3>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" 
             onClick={() => setSelectedStatus('PENDING')}>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⏳</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Review Pending</h3>
            <p className="text-gray-600 mt-2">Review applications awaiting approval</p>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Document Review</h3>
            <p className="text-gray-600 mt-2">Verify submitted documents</p>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
            <p className="text-gray-600 mt-2">View analytics and reports</p>
          </div>
        </div>
      </div>

      {/* Loan Applications Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Loan Applications</h2>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-input w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

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
                    Applicant
                  </th>
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
                {filteredLoans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {loan.borrower?.firstName} {loan.borrower?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{loan.borrower?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link 
                        to={`/officer/review/${loan.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Review
                      </Link>
                      
                      {loan.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(loan.id, 'UNDER_REVIEW')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Start Review
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(loan.id, 'APPROVED')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) handleStatusUpdate(loan.id, 'REJECTED', reason);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {loan.status === 'UNDER_REVIEW' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(loan.id, 'APPROVED')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Rejection reason:');
                              if (reason) handleStatusUpdate(loan.id, 'REJECTED', reason);
                            }}
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
      </div>
    </div>
  );
};

export default OfficerDashboard;
