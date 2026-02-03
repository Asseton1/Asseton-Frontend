import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../../Services/api';
import { HiArrowLeft, HiCheck } from 'react-icons/hi';

const AddState = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('State name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await propertyAPI.createState(formData);
      
      setSuccess(true);
      setFormData({ name: '' });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to add state. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-3 sm:mb-4"
          >
            <HiArrowLeft className="mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New State</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Add a new state to the location database</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-md p-3 sm:p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <HiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  State added successfully! Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <HiCheck className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* State Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                State Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter state name (e.g., Maharashtra, Karnataka)"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add State'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddState;
