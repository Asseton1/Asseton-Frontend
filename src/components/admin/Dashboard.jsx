import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { propertyAPI } from '../../Services/api';
import { format } from 'date-fns';

const Dashboard = () => {
  const [recentProperties, setRecentProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Safe property access helper functions
  const getPropertyValue = (property, key, defaultValue = '') => {
    if (!property) return defaultValue;
    
    // Handle nested properties like 'location.city'
    if (key.includes('.')) {
      const keys = key.split('.');
      let value = property;
      for (const k of keys) {
        if (value && typeof value === 'object' && value[k] !== undefined) {
          value = value[k];
        } else {
          return defaultValue;
        }
      }
      return value;
    }
    
    return property[key] !== undefined ? property[key] : defaultValue;
  };

  const getPropertyArray = (property, key, defaultValue = []) => {
    return property && Array.isArray(property[key]) ? property[key] : defaultValue;
  };

  useEffect(() => {
    fetchRecentProperties();
  }, []);

  const fetchRecentProperties = async () => {
    try {
      setIsLoading(true);
      const response = await propertyAPI.getAllProperties();
      
      // Handle different response formats
      let propertiesData = [];
      
      if (response) {
        // If response is already an array (direct return from API)
        if (Array.isArray(response)) {
          propertiesData = response;
        }
        // If response has a data property that's an array
        else if (response.data && Array.isArray(response.data)) {
          propertiesData = response.data;
        }
        // If response is an object with results (common API pattern)
        else if (response.results && Array.isArray(response.results)) {
          propertiesData = response.results;
        }
        // If response is an object with items
        else if (response.items && Array.isArray(response.items)) {
          propertiesData = response.items;
        }
        else {
          setError('Unexpected data format from server');
          setRecentProperties([]);
          return;
        }
      }
      
      if (propertiesData.length === 0) {
        setRecentProperties([]);
        return;
      }
      
      // Filter out invalid properties and sort by created_at date
      const validProperties = propertiesData
        .filter(property => property && typeof property === 'object')
        .filter(property => getPropertyValue(property, 'created_at'))
        .sort((a, b) => {
          const dateA = new Date(getPropertyValue(a, 'created_at'));
          const dateB = new Date(getPropertyValue(b, 'created_at'));
          return dateB - dateA;
        })
        .slice(0, 5);
      
      setRecentProperties(validProperties);
      setError(null);
      
    } catch (err) {
      setError('Failed to fetch properties. Please try again.');
      setRecentProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to display price as-is
  const formatPrice = (price) => {
    return `₹${price}`;
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Dashboard</h1>

      {/* Recent Properties Section - fully responsive */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Recent Properties</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
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
              onClick={fetchRecentProperties}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto -mx-4">
              <table className="min-w-full divide-y divide-gray-200 whitespace-nowrap">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentProperties.length === 0 ? (
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
                    recentProperties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getPropertyArray(property, 'images').length > 0 && (
                            <img 
                              src={getPropertyArray(property, 'images')[0].image} 
                              alt={getPropertyValue(property, 'title', 'Property')}
                              className="h-10 w-10 rounded-md object-cover mr-3"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{getPropertyValue(property, 'title', 'Untitled')}</div>
                            <div className="text-sm text-gray-500">{getPropertyValue(property, 'contact_name', 'N/A')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{getPropertyValue(property, 'location.city', 'N/A')}</div>
                        <div className="text-xs text-gray-500">{getPropertyValue(property, 'location.district', 'N/A')}, {getPropertyValue(property, 'location.state', 'N/A')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{getPropertyValue(property, 'property_type_details.name', 'N/A')}</div>
                        <div className="text-xs text-gray-500">{getPropertyValue(property, 'property_for', 'N/A')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(getPropertyValue(property, 'price', '0'))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {getPropertyValue(property, 'bedrooms', '0')} Bed • {getPropertyValue(property, 'bathrooms', '0')} Bath
                        </div>
                        <div className="text-xs text-gray-500">
                          {getPropertyValue(property, 'area', '0')} sq.ft
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          getPropertyValue(property, 'property_for', '') === 'sell' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getPropertyValue(property, 'property_for', '') === 'sell' ? 'For Sale' : 'For Rent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {getPropertyValue(property, 'created_at') ? format(new Date(property.created_at), 'MMM d, yyyy') : 'N/A'}
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {recentProperties.length === 0 ? (
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
                recentProperties.map((property) => (
                  <div key={property.id} className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200 h-56 sm:h-48 overflow-hidden">
                    {/* Header with Image, Title, and Contact */}
                    <div className="flex items-start space-x-3">
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
                        <p className="text-sm text-gray-500">{getPropertyValue(property, 'contact_name', 'N/A')}</p>
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
                      
                      {/* Property Type */}
                      <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-medium">Type:</span>
                        <p className="text-gray-900 text-sm">{getPropertyValue(property, 'property_type_details.name', 'N/A')}</p>
                      </div>
                      
                      {/* Price Information */}
                      <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-medium">Price:</span>
                        <p className="text-gray-900 font-medium text-sm">{formatPrice(getPropertyValue(property, 'price', '0'))}</p>
                      </div>
                      
                      {/* Property Specifications */}
                      <div className="space-y-1">
                        <span className="text-gray-500 text-xs font-medium">Details:</span>
                        <p className="text-gray-900 text-sm">{getPropertyValue(property, 'bedrooms', '0')} Bed • {getPropertyValue(property, 'bathrooms', '0')} Bath</p>
                        <p className="text-xs text-gray-500">{getPropertyValue(property, 'area', '0')} sq.ft</p>
                      </div>
                    </div>
                    
                    {/* Additional Info and Date */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-auto">
                      {/* Additional Property Features */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
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
                      
                      {/* Date */}
                      <span className="text-xs text-gray-500">
                        {getPropertyValue(property, 'created_at') ? format(new Date(property.created_at), 'MMM d, yyyy') : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 


