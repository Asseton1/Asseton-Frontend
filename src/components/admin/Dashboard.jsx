import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { propertyAPI } from '../../Services/api';
import { format } from 'date-fns';

const Dashboard = () => {
  const [recentProperties, setRecentProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentProperties();
  }, []);

  const fetchRecentProperties = async () => {
    try {
      const response = await propertyAPI.getAllProperties({ admin: true });
      const properties = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
          ? response.results
          : [];

      const sortedProperties = [...properties]
        .filter((property) => property?.created_at)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setRecentProperties(sortedProperties);
    } catch (err) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format price in Indian currency format
  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (numPrice >= 10000000) { // 1 Crore or more
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) { // 1 Lakh or more
      return `₹${(numPrice / 100000).toFixed(2)} L`;
    } else {
      return `₹${numPrice.toLocaleString('en-IN')}`;
    }
  };

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Recent Properties Section - fully responsive */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Properties</h2>
        <div className="overflow-x-auto -mx-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : (
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
                {recentProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {property.images && property.images[0] && (
                          <img 
                            src={property.images[0].image} 
                            alt={property.title}
                            className="h-10 w-10 rounded-md object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{property.title}</div>
                          <div className="text-sm text-gray-500">{property.contact_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{property.location.city}</div>
                      <div className="text-xs text-gray-500">{property.location.district}, {property.location.state}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{property.property_type_details.name}</div>
                      <div className="text-xs text-gray-500">{property.property_for}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(property.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {property.bedrooms} Bed • {property.bathrooms} Bath
                      </div>
                      <div className="text-xs text-gray-500">
                        {property.area} sq.ft
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.property_for === 'sell' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {property.property_for === 'sell' ? 'For Sale' : 'For Rent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(property.created_at), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 


