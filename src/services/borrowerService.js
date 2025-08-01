import api from './api';

export const borrowerService = {
    // Create borrower profile
  createProfile: async (profileData) => {
    // Don't add userId - it will be extracted from JWT token automatically
    const response = await api.post('/api/borrowers', profileData);
    return response.data;
  },

  // Get borrower by user ID
  getBorrowerByUserId: async (userId) => {
    const response = await api.get(`/api/borrowers/user/${userId}`);
    return response.data;
  },

  // Get borrower by email
  getBorrowerByEmail: async (email) => {
    const response = await api.get(`/api/borrowers/email/${email}`);
    return response.data;
  },

  // Get borrower profile
  getProfile: async (borrowerId) => {
    const response = await api.get(`/api/borrowers/${borrowerId}`);
    return response.data;
  },

  // Submit loan application
  submitLoanApplication: async (borrowerId, loanData) => {
    console.log('Submitting loan application:', { borrowerId, loanData });
    const response = await api.post(`/api/borrowers/${borrowerId}/loans`, loanData);
    console.log('Loan application response:', response.data);
    return response.data;
  },

  // Get loan applications for borrower
  getLoanApplications: async (borrowerId) => {
    const response = await api.get(`/api/borrowers/${borrowerId}/loans`);
    return response.data;
  },

  // Get specific loan application
  getLoanApplication: async (borrowerId, loanId) => {
    const response = await api.get(`/api/borrowers/${borrowerId}/loans/${loanId}`);
    return response.data;
  },

  // Upload document
  uploadDocument: async (borrowerId, formData) => {
    const response = await api.post(`/api/borrowers/${borrowerId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get documents for borrower
  getDocuments: async (borrowerId) => {
    const response = await api.get(`/api/borrowers/${borrowerId}/documents`);
    return response.data;
  },

  // Calculate loan payment
  calculateLoanPayment: async (loanData) => {
    const response = await api.post('/api/borrowers/calculate-loan', loanData);
    return response.data;
  },
};

export default borrowerService;
