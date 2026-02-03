import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import { propertyAPI } from '../../Services/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ensure searchTerm is always a string
  const safeSearchTerm = String(searchTerm || '');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, property: null });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const propertiesPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [currentPage, safeSearchTerm, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [safeSearchTerm, filterStatus]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        page_size: propertiesPerPage,
      };

      if (safeSearchTerm.trim()) {
        params.search = safeSearchTerm.trim();
      }

      if (filterStatus !== 'all') {
        params.property_for = filterStatus.toLowerCase();
      }

      const response = await propertyAPI.getAllProperties(params);

      let propertiesData = [];
      let totalItems = 0;
      let responsePageSize = propertiesPerPage;

      if (response) {
        if (Array.isArray(response)) {
          propertiesData = response;
          totalItems = response.length;
        } else if (Array.isArray(response.data)) {
          propertiesData = response.data;
          totalItems = response.data.length;
          responsePageSize = params.page_size;
        } else if (Array.isArray(response.results)) {
          propertiesData = response.results;
          totalItems =
            typeof response.count === 'number'
              ? response.count
              : response.results.length;
          responsePageSize = response.pageSize || params.page_size;
        } else if (Array.isArray(response.items)) {
          propertiesData = response.items;
          totalItems =
            typeof response.count === 'number'
              ? response.count
              : response.items.length;
          responsePageSize = response.pageSize || params.page_size;
        } else if (response.data?.results && Array.isArray(response.data.results)) {
          propertiesData = response.data.results;
          totalItems =
            typeof response.data.count === 'number'
              ? response.data.count
              : response.data.results.length;
          responsePageSize = response.pageSize || params.page_size;
        } else if (response.error === 'invalid-page') {
          if (currentPage > 1) {
            setCurrentPage(1);
            return;
          }
          propertiesData = [];
          totalItems = 0;
        } else {
          setError('Unexpected data format from server');
          setProperties([]);
          setTotalPages(1);
          setTotalCount(0);
          return;
        }
      }

      setProperties(propertiesData);
      setTotalCount(totalItems);
      setTotalPages(Math.max(1, Math.ceil(totalItems / responsePageSize)));
    } catch (err) {
      setError('Failed to fetch properties. Please try again.');
      setProperties([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (property) => {
    setDeleteModal({ isOpen: true, property });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.property) return;
    
    try {
      setIsLoading(true);
      await propertyAPI.deleteProperty(deleteModal.property.id);
      setProperties(prevProperties => prevProperties.filter(property => property.id !== deleteModal.property.id));
      setDeleteModal({ isOpen: false, property: null });
      
      // Show success toast or notification
      const successToast = document.createElement('div');
      successToast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-transform duration-500 ease-in-out';
      successToast.textContent = 'Property deleted successfully';
      document.body.appendChild(successToast);
      
      setTimeout(() => {
        successToast.style.transform = 'translateX(150%)';
        setTimeout(() => document.body.removeChild(successToast), 500);
      }, 3000);
      
    } catch (error) {
      let errorMessage = 'Failed to delete property. Please try again.';
      
      if (error.response) {
        switch (error.response.status) {
          case 404:
            errorMessage = 'Property not found. It may have been already deleted.';
            break;
          case 403:
            errorMessage = 'You do not have permission to delete this property.';
            break;
          case 401:
            errorMessage = 'Please login again to perform this action.';
            break;
          default:
            errorMessage = error.response.data?.detail || errorMessage;
        }
      }
      
      console.error('Error deleting property:', error);
      
      // Show error toast
      const errorToast = document.createElement('div');
      errorToast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
      errorToast.textContent = errorMessage;
      document.body.appendChild(errorToast);
      
      setTimeout(() => document.body.removeChild(errorToast), 5000);
    } finally {
      setIsLoading(false);
      fetchProperties();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, property: null });
  };

  // Display price as-is
  const formatPrice = (price) => {
    return `₹${price}`;
  };

  // Ensure properties is always an array before rendering
  const currentProperties = Array.isArray(properties) ? properties : [];

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  };

  // Helper functions for safe property access
  const getPropertyValue = (obj, path, fallback) => {
    if (!obj || typeof obj !== 'object') return fallback;
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return fallback;
      }
    }
    return value;
  };

  const getPropertyArray = (obj, path) => {
    if (!obj || typeof obj !== 'object') return [];
    const keys = path.split('.');
    let value = obj;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 sm:mb-6 flex-col sm:flex-row gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Property Listings</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          onClick={() => window.location.href = '/admin/add-property'}
        >
          Add New Property
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, location, or contact name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Properties</option>
          <option value="sell">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
      </div>

      {/* Properties Table */}
      <div className="w-full bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-red-500 mb-2">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Unable to Load Properties</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">{error}</p>
            <button 
              onClick={fetchProperties}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProperties.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                          <p className="text-gray-500 mb-4">There are no properties to display at the moment.</p>
                          <button 
                            onClick={() => window.location.href = '/admin/add-property'}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Add Your First Property
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getPropertyArray(property, 'images').length > 0 && (
                            <img 
                              src={getPropertyArray(property, 'images')[0].image} 
                              alt={getPropertyValue(property, 'title', 'Property')}
                              className="h-16 w-16 rounded-md object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{getPropertyValue(property, 'title', 'Untitled')}</div>
                            <div className="text-sm text-gray-500">{getPropertyValue(property, 'property_type_details.name', 'N/A')}</div>
                            <div className="text-xs text-gray-400">
                              {getPropertyValue(property, 'created_at') ? format(new Date(property.created_at), 'MMM d, yyyy') : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <FaMapMarkerAlt className="text-gray-400 mt-1" />
                          <div>
                            <div className="text-sm text-gray-900">{getPropertyValue(property, 'location.city', 'N/A')}</div>
                            <div className="text-xs text-gray-500">
                              {getPropertyValue(property, 'location.district', 'N/A')}, {getPropertyValue(property, 'location.state', 'N/A')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <FaBed className="text-gray-400" />
                            <span className="text-sm text-gray-600">{getPropertyValue(property, 'bedrooms', '0')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaBath className="text-gray-400" />
                            <span className="text-sm text-gray-600">{getPropertyValue(property, 'bathrooms', '0')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaRulerCombined className="text-gray-400" />
                            <span className="text-sm text-gray-600">{getPropertyValue(property, 'area', '0')} sq.ft</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{getPropertyValue(property, 'contact_name', 'N/A')}</div>
                        <div className="text-xs text-gray-500">{getPropertyValue(property, 'phone_number', 'N/A')}</div>
                        <div className="text-xs text-gray-500">{getPropertyValue(property, 'email', 'N/A')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(getPropertyValue(property, 'price', '0'))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getPropertyValue(property, 'property_for', '') === 'sell' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getPropertyValue(property, 'property_for', '') === 'sell' ? 'For Sale' : 'For Rent'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            onClick={() => navigate(`/admin/edit-property/${property.id}`)}
                          >
                            <FaEdit className="h-5 w-5" />
                          </button>
                          <button
                            className={`text-red-600 hover:text-red-900 transition-colors ${
                              isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => handleDeleteClick(property)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            ) : (
                              <FaTrash className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3 p-3 sm:p-4">
              {currentProperties.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                    <p className="text-gray-500 mb-4">There are no properties to display at the moment.</p>
                    <button 
                      onClick={() => window.location.href = '/admin/add-property'}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Add Your First Property
                    </button>
                  </div>
                </div>
              ) : (
                currentProperties.map((property) => (
                  <div key={property.id} className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200 h-56 sm:h-48 overflow-hidden relative">
                    {/* Edit and Delete Icons - Top Right */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-900 transition-colors p-2 bg-blue-50 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        onClick={() => navigate(`/admin/edit-property/${property.id}`)}
                        title="Edit Property"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        className={`text-red-600 hover:text-red-900 transition-colors p-2 bg-red-50 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => handleDeleteClick(property)}
                        disabled={isLoading}
                        title="Delete Property"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <FaTrash className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Header with Image, Title, and Type */}
                    <div className="flex items-start space-x-3 pr-20">
                      {getPropertyArray(property, 'images').length > 0 && (
                        <img 
                          src={getPropertyArray(property, 'images')[0].image} 
                          alt={getPropertyValue(property, 'title', 'Property')}
                          className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {getPropertyValue(property, 'title', 'Untitled')}
                        </h3>
                        <p className="text-sm text-gray-500">{getPropertyValue(property, 'property_type_details.name', 'N/A')}</p>
                        <p className="text-xs text-gray-400">
                          {getPropertyValue(property, 'created_at') ? format(new Date(property.created_at), 'MMM d, yyyy') : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Property Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {/* Location Details */}
                      <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-medium">Location:</span>
                        <p className="text-gray-900 text-sm">{getPropertyValue(property, 'location.city', 'N/A')}</p>
                        <p className="text-xs text-gray-500">{getPropertyValue(property, 'location.district', 'N/A')}, {getPropertyValue(property, 'location.state', 'N/A')}</p>
                      </div>
                      
                      {/* Property Specifications */}
                      <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-medium">Specifications:</span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="flex items-center gap-1"><FaBed className="text-gray-400" />{getPropertyValue(property, 'bedrooms', '0')}</span>
                          <span className="flex items-center gap-1"><FaBath className="text-gray-400" />{getPropertyValue(property, 'bathrooms', '0')}</span>
                          <span className="flex items-center gap-1"><FaRulerCombined className="text-gray-400" />{getPropertyValue(property, 'area', '0')}</span>
                        </div>
                      </div>
                      
                      {/* Contact Information */}
                      <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-medium">Contact:</span>
                        <p className="text-gray-900 text-sm">{getPropertyValue(property, 'contact_name', 'N/A')}</p>
                        <p className="text-xs text-gray-500">{getPropertyValue(property, 'phone_number', 'N/A')}</p>
                      </div>
                      
                      {/* Price and Status */}
                      <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-medium">Price:</span>
                        <p className="text-gray-900 font-medium text-sm">{formatPrice(getPropertyValue(property, 'price', '0'))}</p>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getPropertyValue(property, 'property_for', '') === 'sell' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getPropertyValue(property, 'property_for', '') === 'sell' ? 'For Sale' : 'For Rent'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Additional Property Features */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-200 mt-auto">
                      {getPropertyValue(property, 'parking', '0') > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V9a1 1 0 00-1-1h-2z"/>
                          </svg>
                          {getPropertyValue(property, 'parking', '0')} Parking
                        </span>
                      )}
                      {getPropertyValue(property, 'furnished', false) && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                          </svg>
                          Furnished
                        </span>
                      )}
                      {getPropertyValue(property, 'balcony', false) && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                          </svg>
                          Balcony
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => paginate(index + 1)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === index + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              {index + 1}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            } border border-gray-300`}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.property && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <FaExclamationTriangle className="text-red-600 text-xl" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 text-center mb-4">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{deleteModal.property.title}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Location:</span> {deleteModal.property.location.city}
                </div>
                <div>
                  <span className="font-medium">Price:</span> {formatPrice(deleteModal.property.price)}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {deleteModal.property.property_type_details.name}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {deleteModal.property.property_for === 'sell' ? 'For Sale' : 'For Rent'}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                onClick={handleDeleteConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <FaTrash className="h-4 w-4" />
                    <span>Delete Property</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyList; 

