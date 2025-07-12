import api from './api';

export const borrowerService = {
  // Create borrower profile
  createProfile: async (profileData, userId) => {
    // Add userId to the profile data
    const dataWithUserId = {
      ...profileData,
      userId: userId
    };
    const response = await api.post('/api/borrowers', dataWithUserId);
    return response.data;
  },

  // Get borrower by user ID
  getBorrowerByUserId: async (userId) => {
    const response = await api.get(`/api/borrowers/user/${userId}`);
    return response.data;
  },

  // Get borrower profile
  getProfile: async (borrowerId) => {
    const response = await api.get(`/api/borrowers/${borrowerId}`);
    return response.data;
  },

  // Submit loan application
  submitLoanApplication: async (borrowerId, loanData) => {
    const response = await api.post(`/api/borrowers/${borrowerId}/loan-applications`, loanData);
    return response.data;
  },

  // Get loan applications for borrower
  getLoanApplications: async (borrowerId) => {
    const response = await api.get(`/api/borrowers/${borrowerId}/loan-applications`);
    return response.data;
  },

  // Get specific loan application
  getLoanApplication: async (borrowerId, loanId) => {
    const response = await api.get(`/api/borrowers/${borrowerId}/loan-applications/${loanId}`);
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
