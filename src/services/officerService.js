import api from './api';

export const officerService = {
  // Get all loan applications
  getAllLoans: async () => {
    const response = await api.get('/admin/loans');
    return response.data;
  },

  // Get specific loan application
  getLoan: async (loanId) => {
    const response = await api.get(`/admin/loans/${loanId}`);
    return response.data;
  },

  // Get loans by status
  getLoansByStatus: async (status) => {
    const response = await api.get(`/admin/loans/status/${status}`);
    return response.data;
  },

  // Update loan status
  updateLoanStatus: async (loanId, statusData) => {
    const response = await api.put(`/admin/loans/${loanId}/status`, statusData);
    return response.data;
  },

  // Get all documents
  getAllDocuments: async () => {
    const response = await api.get('/admin/documents');
    return response.data;
  },

  // Get documents by status
  getDocumentsByStatus: async (status) => {
    const response = await api.get(`/admin/documents/status/${status}`);
    return response.data;
  },

  // Get documents for specific loan
  getLoanDocuments: async (loanId) => {
    const response = await api.get(`/admin/loans/${loanId}/documents`);
    return response.data;
  },

  // Get specific document
  getDocument: async (documentId) => {
    const response = await api.get(`/admin/documents/${documentId}`);
    return response.data;
  },

  // Update document status
  updateDocumentStatus: async (documentId, statusData) => {
    const response = await api.put(`/admin/documents/${documentId}/status`, statusData);
    return response.data;
  },

  // Get all loan statuses
  getLoanStatuses: async () => {
    const response = await api.get('/admin/status/loan-statuses');
    return response.data;
  },

  // Get all document statuses
  getDocumentStatuses: async () => {
    const response = await api.get('/admin/status/document-statuses');
    return response.data;
  },

  // Loan Score APIs
  // Get loan score for specific application
  getLoanScore: async (applicationId) => {
    const response = await api.get(`/admin/loans/${applicationId}/score`);
    return response.data;
  },

  // Get all scores for a borrower
  getBorrowerScores: async (borrowerId) => {
    const response = await api.get(`/admin/borrowers/${borrowerId}/scores`);
    return response.data;
  },

  // Get scores by grade
  getScoresByGrade: async (grade) => {
    const response = await api.get(`/admin/scores/grade/${grade}`);
    return response.data;
  },

  // Get scores by risk level
  getScoresByRisk: async (risk) => {
    const response = await api.get(`/admin/scores/risk/${risk}`);
    return response.data;
  },

  // Check loan score service status
  getLoanScoreServiceStatus: async () => {
    const response = await api.get('/admin/scores/service-status');
    return response.data;
  },
};

export default officerService;
