import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { FaEdit, FaTrash, FaSearch, FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import { propertyAPI } from '../../Services/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const PROPERTIES_PER_PAGE = 12;
const SEARCH_DEBOUNCE_MS = 350;

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set([1, totalPages, currentPage]);
  for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
    if (i > 1 && i < totalPages) pages.add(i);
  }
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  let prev = 0;
  for (const page of sorted) {
    if (prev && page - prev > 1) result.push('ellipsis');
    result.push(page);
    prev = page;
  }
  return result;
}

function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, property: null });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();
  const requestIdRef = useRef(0);

  // Debounce search so typing doesn't spam/race the API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filter changes (search reset handled above)
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const fetchProperties = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        page_size: PROPERTIES_PER_PAGE,
      };

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      if (filterStatus !== 'all') {
        params.property_for = filterStatus.toLowerCase();
      }

      const response = await propertyAPI.getAllProperties(params);
      if (requestId !== requestIdRef.current) return;

      let propertiesData = [];
      let totalItems = 0;
      let responsePageSize = PROPERTIES_PER_PAGE;

      if (response) {
        if (Array.isArray(response)) {
          propertiesData = response;
          totalItems = response.length;
        } else if (Array.isArray(response.results)) {
          propertiesData = response.results;
          totalItems =
            typeof response.count === 'number'
              ? response.count
              : response.results.length;
          responsePageSize = response.pageSize || params.page_size;
        } else if (Array.isArray(response.data)) {
          propertiesData = response.data;
          totalItems = response.data.length;
          responsePageSize = params.page_size;
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

      const pages = Math.max(1, Math.ceil(totalItems / responsePageSize) || 1);
      setProperties(propertiesData);
      setTotalCount(totalItems);
      setTotalPages(pages);

      // If filter/search shrunk results and current page is past the end, go to last page
      if (totalItems > 0 && currentPage > pages) {
        setCurrentPage(pages);
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError('Failed to fetch properties. Please try again.');
      setProperties([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentPage, debouncedSearch, filterStatus]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDeleteClick = (property) => {
    setDeleteModal({ isOpen: true, property });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.property) return;

    try {
      setIsLoading(true);
      await propertyAPI.deleteProperty(deleteModal.property.id);
      setDeleteModal({ isOpen: false, property: null });

      const successToast = document.createElement('div');
      successToast.className =
        'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      successToast.textContent = 'Property deleted successfully';
      document.body.appendChild(successToast);

      setTimeout(() => {
        successToast.style.transform = 'translateX(150%)';
        setTimeout(() => {
          if (document.body.contains(successToast)) {
            document.body.removeChild(successToast);
          }
        }, 500);
      }, 3000);

      await fetchProperties();
    } catch (deleteError) {
      let errorMessage = 'Failed to delete property. Please try again.';

      if (deleteError.response) {
        switch (deleteError.response.status) {
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
            errorMessage = deleteError.response.data?.detail || errorMessage;
        }
      }

      const errorToast = document.createElement('div');
      errorToast.className =
        'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorToast.textContent = errorMessage;
      document.body.appendChild(errorToast);
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, property: null });
  };

  const formatPrice = (rawPrice) => {
    if (rawPrice == null || rawPrice === '') return '₹0';

    const numeric = Number(
      String(rawPrice)
        .toString()
        .replace(/[^\d.]/g, ''),
    );

    if (!numeric || Number.isNaN(numeric)) return `₹${rawPrice}`;

    if (numeric >= 10000000) {
      const crores = numeric / 10000000;
      const formatted = crores.toFixed(3).replace(/\.?0+$/, '');
      return `₹${formatted} Cr`;
    }

    if (numeric >= 100000) {
      const lakhs = numeric / 100000;
      const formatted = lakhs.toFixed(3).replace(/\.?0+$/, '');
      return `₹${formatted} Lakh`;
    }

    return `₹${numeric.toLocaleString('en-IN')}`;
  };

  const currentProperties = Array.isArray(properties) ? properties : [];
  const visiblePages = useMemo(
    () => getVisiblePages(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    return value ?? fallback;
  };

  const formatAreaWithUnit = (property) => {
    const area = getPropertyValue(property, 'area', '0');
    const unit = (getPropertyValue(property, 'area_unit', 'sqft') || 'sqft').toLowerCase();
    return unit === 'cent' ? `${area} cent` : `${area} sq.ft`;
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

  const emptyMessage = debouncedSearch
    ? `No properties match "${debouncedSearch}". Try a different title, city, or contact name.`
    : 'There are no properties to display at the moment.';

  return (
    <div className="w-full max-w-full">
      <div className="flex justify-between items-center mb-4 sm:mb-6 flex-col sm:flex-row gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Property Listings</h1>
          {!isLoading && !error && (
            <p className="text-sm text-gray-500 mt-1">
              {totalCount} {totalCount === 1 ? 'property' : 'properties'}
              {debouncedSearch ? ` matching "${debouncedSearch}"` : ''}
            </p>
          )}
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto shrink-0"
          onClick={() => navigate('/admin/add-property')}
        >
          Add New Property
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, location, or contact name..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search properties"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              aria-label="Clear search"
            >
              ✕
            </button>
          ) : null}
        </div>
        <select
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All Properties</option>
          <option value="sell">For Sale</option>
          <option value="rent">For Rent</option>
        </select>
      </div>

      {/* Properties table / cards */}
      <div className="w-full bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center py-6 sm:py-8 px-4">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Unable to Load Properties
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchProperties}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full min-w-[960px] table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-[22%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="w-[16%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="w-[14%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="w-[16%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="w-[12%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-[10%] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentProperties.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                        <p className="mb-4">{emptyMessage}</p>
                        {!debouncedSearch && (
                          <button
                            onClick={() => navigate('/admin/add-property')}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                          >
                            Add Your First Property
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    currentProperties.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-3 min-w-0">
                            {getPropertyArray(property, 'images').length > 0 && (
                              <img
                                src={getPropertyArray(property, 'images')[0].image}
                                alt={getPropertyValue(property, 'title', 'Property')}
                                className="h-14 w-14 rounded-md object-cover shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 truncate">
                                {getPropertyValue(property, 'title', 'Untitled')}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {getPropertyValue(property, 'property_type_details.name', 'N/A')}
                              </div>
                              <div className="text-xs text-gray-400">
                                {getPropertyValue(property, 'created_at')
                                  ? format(new Date(property.created_at), 'MMM d, yyyy')
                                  : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-start gap-2 min-w-0">
                            <FaMapMarkerAlt className="text-gray-400 mt-1 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm text-gray-900 truncate">
                                {getPropertyValue(property, 'location.city', 'N/A')}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {getPropertyValue(property, 'location.district', 'N/A')},{' '}
                                {getPropertyValue(property, 'location.state', 'N/A')}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <FaBed className="text-gray-400" />
                              {getPropertyValue(property, 'bedrooms', '0')}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <FaBath className="text-gray-400" />
                              {getPropertyValue(property, 'bathrooms', '0')}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <FaRulerCombined className="text-gray-400" />
                              {formatAreaWithUnit(property)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="text-sm text-gray-900 truncate">
                            {getPropertyValue(property, 'contact_name', 'N/A')}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {getPropertyValue(property, 'phone_number', 'N/A')}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {getPropertyValue(property, 'email', 'N/A')}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(getPropertyValue(property, 'price', '0'))}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              getPropertyValue(property, 'property_for', '') === 'sell'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {getPropertyValue(property, 'property_for', '') === 'sell'
                              ? 'For Sale'
                              : 'For Rent'}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <button
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              onClick={() => navigate(`/admin/edit-property/${property.id}`)}
                              title="Edit"
                            >
                              <FaEdit className="h-5 w-5" />
                            </button>
                            <button
                              className={`text-red-600 hover:text-red-900 transition-colors ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              onClick={() => handleDeleteClick(property)}
                              disabled={isLoading}
                              title="Delete"
                            >
                              <FaTrash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden space-y-3 p-3 sm:p-4">
              {currentProperties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                  <p className="mb-4">{emptyMessage}</p>
                </div>
              ) : (
                currentProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200 relative"
                  >
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <button
                        className="text-blue-600 p-2 bg-blue-50 rounded-full hover:bg-blue-100"
                        onClick={() => navigate(`/admin/edit-property/${property.id}`)}
                        title="Edit Property"
                      >
                        <FaEdit className="h-4 w-4" />
                      </button>
                      <button
                        className={`text-red-600 p-2 bg-red-50 rounded-full hover:bg-red-100 ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => handleDeleteClick(property)}
                        disabled={isLoading}
                        title="Delete Property"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>

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
                        <p className="text-sm text-gray-500 truncate">
                          {getPropertyValue(property, 'property_type_details.name', 'N/A')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {getPropertyValue(property, 'created_at')
                            ? format(new Date(property.created_at), 'MMM d, yyyy')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Location</span>
                        <p className="text-gray-900">
                          {getPropertyValue(property, 'location.city', 'N/A')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getPropertyValue(property, 'location.district', 'N/A')},{' '}
                          {getPropertyValue(property, 'location.state', 'N/A')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Price</span>
                        <p className="text-gray-900 font-medium">
                          {formatPrice(getPropertyValue(property, 'price', '0'))}
                        </p>
                        <span
                          className={`mt-1 px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                            getPropertyValue(property, 'property_for', '') === 'sell'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {getPropertyValue(property, 'property_for', '') === 'sell'
                            ? 'For Sale'
                            : 'For Rent'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Compact pagination */}
      {!isLoading && !error && totalCount > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            Page {currentPage} of {totalPages}
            {totalCount > 0
              ? ` · showing ${(currentPage - 1) * PROPERTIES_PER_PAGE + 1}–${Math.min(
                  currentPage * PROPERTIES_PER_PAGE,
                  totalCount,
                )} of ${totalCount}`
              : null}
          </p>

          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-1.5">
              <button
                type="button"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                Previous
              </button>

              {visiblePages.map((item, index) =>
                item === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 py-1.5 text-gray-400 select-none"
                    aria-hidden="true"
                  >
                    …
                  </span>
                ) : (
                  <button
                    type="button"
                    key={item}
                    onClick={() => paginate(item)}
                    className={`min-w-[2.25rem] px-2.5 py-1.5 rounded-md text-sm border ${
                      currentPage === item
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete modal */}
      {deleteModal.isOpen && deleteModal.property && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
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
              <h4 className="font-medium text-gray-900 mb-2">
                {deleteModal.property.title}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Location:</span>{' '}
                  {deleteModal.property.location?.city || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Price:</span>{' '}
                  {formatPrice(deleteModal.property.price)}
                </div>
                <div>
                  <span className="font-medium">Type:</span>{' '}
                  {deleteModal.property.property_type_details?.name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  {deleteModal.property.property_for === 'sell' ? 'For Sale' : 'For Rent'}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2"
                onClick={handleDeleteConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white" />
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
