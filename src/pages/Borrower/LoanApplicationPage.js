import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import borrowerService from '../../services/borrowerService';

const LoanApplicationPage = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [borrowerId, setBorrowerId] = useState(null); // Store borrower ID
  
  // Profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phoneNumber: '',
    dateOfBirth: '',
    ssn: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    annualIncome: '',
    employmentStatus: 'EMPLOYED',
    employerName: '',
    employmentYears: '',
  });

  // Loan application data
  const [loanData, setLoanData] = useState({
    loanType: 'PERSONAL',
    loanAmount: '',
    loanTermMonths: '36',
    interestRate: '6.5',
    purpose: '',
  });

  // Check if profile already exists
  useEffect(() => {
    const checkProfile = async () => {
      if (user?.userId) {
        try {
          const borrower = await borrowerService.getBorrowerByUserId(user.userId);
          if (borrower) {
            setProfileData(borrower);
            setBorrowerId(borrower.id); // Store borrower ID
            setStep(2); // Skip to loan application if profile exists
          }
        } catch (error) {
          // Profile doesn't exist, start with step 1 (404 is expected)
          if (error.response?.status !== 404) {
            console.error('Error checking existing profile:', error);
          }
        }
      }
    };
    checkProfile();
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoanChange = (e) => {
    setLoanData({
      ...loanData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await borrowerService.createProfile(profileData, user.userId);
      setBorrowerId(response.id); // Store the borrower ID from response
      setStep(2);
      setSuccess('Profile created successfully! Now you can apply for a loan.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLoanSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loanApplication = {
        ...loanData,
        loanAmount: parseFloat(loanData.loanAmount),
        loanTermMonths: parseInt(loanData.loanTermMonths),
        interestRate: parseFloat(loanData.interestRate),
      };

      await borrowerService.submitLoanApplication(borrowerId, loanApplication); // Use borrowerId
      setSuccess('Loan application submitted successfully!');
      setStep(3);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit loan application');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Profile Creation
  if (step === 1) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-600 mt-2">
              First, we need some information about you to process your loan application.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            {/* Personal Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className="form-input"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className="form-input"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="form-input"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    required
                    className="form-input"
                    value={profileData.phoneNumber}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    required
                    className="form-input"
                    value={profileData.dateOfBirth}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SSN (Last 4 digits)</label>
                  <input
                    type="text"
                    name="ssn"
                    required
                    className="form-input"
                    placeholder="123-45-6789"
                    value={profileData.ssn}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="form-input"
                    value={profileData.address}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      className="form-input"
                      value={profileData.city}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      className="form-input"
                      value={profileData.state}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      className="form-input"
                      value={profileData.zipCode}
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Annual Income</label>
                  <input
                    type="number"
                    name="annualIncome"
                    required
                    className="form-input"
                    value={profileData.annualIncome}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Employment Status</label>
                  <select
                    name="employmentStatus"
                    required
                    className="form-input"
                    value={profileData.employmentStatus}
                    onChange={handleProfileChange}
                  >
                    <option value="EMPLOYED">Employed</option>
                    <option value="SELF_EMPLOYED">Self Employed</option>
                    <option value="UNEMPLOYED">Unemployed</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Employer Name</label>
                  <input
                    type="text"
                    name="employerName"
                    required
                    className="form-input"
                    value={profileData.employerName}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Years of Employment</label>
                  <input
                    type="number"
                    name="employmentYears"
                    required
                    className="form-input"
                    value={profileData.employmentYears}
                    onChange={handleProfileChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Continue to Loan Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Loan Application
  if (step === 2) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Apply for a Loan</h1>
            <p className="text-gray-600 mt-2">
              Please provide details about the loan you're seeking.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleLoanSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Loan Type</label>
                <select
                  name="loanType"
                  required
                  className="form-input"
                  value={loanData.loanType}
                  onChange={handleLoanChange}
                >
                  <option value="PERSONAL">Personal Loan</option>
                  <option value="AUTO">Auto Loan</option>
                  <option value="MORTGAGE">Mortgage</option>
                  <option value="BUSINESS">Business Loan</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Loan Amount</label>
                <input
                  type="number"
                  name="loanAmount"
                  required
                  min="1000"
                  max="1000000"
                  className="form-input"
                  value={loanData.loanAmount}
                  onChange={handleLoanChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Loan Term (Months)</label>
                <select
                  name="loanTermMonths"
                  required
                  className="form-input"
                  value={loanData.loanTermMonths}
                  onChange={handleLoanChange}
                >
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                  <option value="48">48 months</option>
                  <option value="60">60 months</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Interest Rate (%)</label>
                <input
                  type="number"
                  name="interestRate"
                  required
                  step="0.1"
                  min="0"
                  max="30"
                  className="form-input"
                  value={loanData.interestRate}
                  onChange={handleLoanChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Purpose of Loan</label>
              <textarea
                name="purpose"
                required
                rows="4"
                className="form-input"
                placeholder="Please describe what you plan to use this loan for..."
                value={loanData.purpose}
                onChange={handleLoanChange}
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-secondary"
              >
                Back to Profile
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="card text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl">✓</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Your loan application has been submitted and is now under review. 
          You will receive updates on the status via email.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => {
              setStep(2);
              setLoanData({
                loanType: 'PERSONAL',
                loanAmount: '',
                loanTermMonths: '36',
                interestRate: '6.5',
                purpose: '',
              });
              setSuccess('');
              setError('');
            }}
            className="btn btn-secondary"
          >
            Submit Another Application
          </button>
          <a href="/borrower/dashboard" className="btn btn-primary">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationPage;
