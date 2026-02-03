import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyAPI } from '../../Services/api';
import { HiArrowLeft, HiCheck } from 'react-icons/hi';

const AddCity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    district: ''
  });

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const statesData = await propertyAPI.getStates();
      setStates(statesData);
    } catch (err) {
      setError('Failed to load states');
    }
  };

  const fetchDistricts = async (stateId) => {
    try {
      const districtsData = await propertyAPI.getDistricts(stateId);
      setDistricts(districtsData);
    } catch (err) {
      setError('Failed to load districts');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If state changes, reset district and fetch new districts
    if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        district: ''
      }));
      if (value) {
        fetchDistricts(value);
      } else {
        setDistricts([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('City name is required');
      return;
    }

    if (!formData.state) {
      setError('Please select a state');
      return;
    }

    if (!formData.district) {
      setError('Please select a district');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await propertyAPI.createCity({
        ...formData,
        state: formData.state,
        district: formData.district
      });
      
      setSuccess(true);
      setFormData({ name: '', state: '', district: '' });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to add city. Please try again.');
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New City</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Add a new city to the location database</p>
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
                  City added successfully! Redirecting to dashboard...
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
            {/* State Selection */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                required
              >
                <option value="">Select a state</option>
                {states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District Selection */}
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                District *
              </label>
              <select
                id="district"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                required
                disabled={!formData.state}
              >
                <option value="">Select a district</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                City Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter city name"
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
                {loading ? 'Adding...' : 'Add City'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCity;
