import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function ApplyLoan() {
  const [formData, setFormData] = useState({
    amount: '',
    interestRate: '',
    tenure: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateEMI = () => {
    const principal = parseFloat(formData.amount) || 0;
    const annualRate = parseFloat(formData.interestRate) || 0;
    const tenureMonths = parseInt(formData.tenure) || 0;

    if (principal > 0 && annualRate > 0 && tenureMonths > 0) {
      const monthlyRate = annualRate / 12 / 100;
      const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths) / 
                  (Math.pow(1 + monthlyRate, tenureMonths) - 1);
      return Math.round(emi * 100) / 100;
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/loans/apply', formData);
      toast.success("Create Loan Successfully !")
      navigate('/loans');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to apply for loan');
    } finally {
      setLoading(false);
    }
  };

  const emi = calculateEMI();

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Apply for Loan</h2>
            
            {error && (
              <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
                {error}
              </div>
            )}
           

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loan Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  min="1000"
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.amount}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Interest Rate (% per annum)
                </label>
                <select
                  name="interestRate"
                  required
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.interestRate}
                  onChange={handleChange}
                >
                  <option value="10">10%</option>
                  <option value="12">12%</option>
                  <option value="15">15%</option>
                  <option value="18">18%</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tenure (months)
                </label>
                <select
                  name="tenure"
                  required
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.tenure}
                  onChange={handleChange}
                >
                  <option value="">Select tenure</option>
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                  <option value="60">60 months</option>
                </select>
              </div>
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loan Purpose
                </label>
                <textarea
                  name="purpose"
                  required
                  rows={3}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Describe the purpose of your loan..."
                />
              </div>

              {emi > 0 && (
                <div className="p-4 rounded-md bg-gray-50">
                  <h3 className="text-lg font-medium text-gray-900">Loan Summary</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-gray-600">Monthly EMI</p>
                      <p className="text-lg font-semibold">₹{emi.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Interest</p>
                      <p className="text-lg font-semibold">
                        ₹{(emi * parseInt(formData.tenure) - parseFloat(formData.amount)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Applying...' : 'Apply for Loan'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
    </div>
  );
}

export default ApplyLoan;