import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaFilter, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import { propertyAPI } from '../../Services/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, property: null });
  const propertiesPerPage = 12;
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const response = await propertyAPI.getAllProperties({
        admin: true,
        params: {
          page_size: 100,
          page: 1,
        },
      });
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
          ? response.results
          : [];

      setProperties(list);
      setError(null);
    } catch (err) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', err);
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

  // Format price in Indian currency format
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

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.contact_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || property.property_for === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Property Listings</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          onClick={() => window.location.href = '/admin/add-property'}
        >
          Add New Property
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, location, or contact name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
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
                {currentProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {property.images && property.images[0] && (
                          <img 
                            src={property.images[0].image} 
                            alt={property.title}
                            className="h-16 w-16 rounded-md object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{property.title}</div>
                          <div className="text-sm text-gray-500">{property.property_type_details.name}</div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(property.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-gray-400 mt-1" />
                        <div>
                          <div className="text-sm text-gray-900">{property.location.city}</div>
                          <div className="text-xs text-gray-500">
                            {property.location.district}, {property.location.state}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <FaBed className="text-gray-400" />
                          <span className="text-sm text-gray-600">{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaBath className="text-gray-400" />
                          <span className="text-sm text-gray-600">{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FaRulerCombined className="text-gray-400" />
                          <span className="text-sm text-gray-600">{property.area} sq.ft</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{property.contact_name}</div>
                      <div className="text-xs text-gray-500">{property.phone_number}</div>
                      <div className="text-xs text-gray-500">{property.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(property.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.property_for === 'sell' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {property.property_for === 'sell' ? 'For Sale' : 'For Rent'}
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
                ))}
              </tbody>
            </table>
          </div>
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

