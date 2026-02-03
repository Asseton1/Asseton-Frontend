import React, { useState, useEffect } from 'react';
import { propertyAPI } from '../../Services/api';
import ConfirmationModal from '../shared/ConfirmationModal';
import { FaTrash } from 'react-icons/fa';
import ExpandableText from '../shared/ExpandableText';

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Safe property access helper functions
  const getPropertyValue = (enquiry, key, defaultValue = '') => {
    if (!enquiry) return defaultValue;
    return enquiry[key] !== undefined ? enquiry[key] : defaultValue;
  };

  // Fetch enquiries
  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getAllContacts();
      
      // Handle different response formats
      let enquiriesData = [];
      
      if (response) {
        // If response is already an array (direct return from API)
        if (Array.isArray(response)) {
          enquiriesData = response;
        }
        // If response has a data property that's an array
        else if (response.data && Array.isArray(response.data)) {
          enquiriesData = response.data;
        }
        // If response has a results property (common API pattern)
        else if (response.results && Array.isArray(response.results)) {
          enquiriesData = response.items;
        }
        // If response has an items property
        else if (response.items && Array.isArray(response.items)) {
          enquiriesData = response.items;
        }
        else {
          setError('Unexpected data format from server');
          setEnquiries([]);
          return;
        }
      }
      
      if (enquiriesData.length === 0) {
        setEnquiries([]);
        setError(null);
        return;
      }
      
      setEnquiries(enquiriesData);
      setError(null);
      
    } catch (err) {
      setError('Failed to fetch enquiries. Please try again.');
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  // Open confirmation modal
  const handleDeleteClick = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowConfirmModal(true);
  };

  // Delete enquiry
  const handleDelete = async () => {
    try {
      await propertyAPI.deleteContact(selectedEnquiry.id);
      setEnquiries(enquiries.filter(enquiry => enquiry.id !== selectedEnquiry.id));
      setShowConfirmModal(false);
      setSelectedEnquiry(null);
    } catch (err) {
      setError('Failed to delete enquiry');
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8">
      <div className="text-red-500 mb-2">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Enquiries</h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <button 
        onClick={fetchEnquiries}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="p-2 sm:p-4 max-w-full">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 px-2">Property Enquiries</h2>
      
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto rounded-lg shadow">
        {enquiries.length === 0 ? (
          <div className="text-center py-12 bg-white">
            <div className="text-gray-500">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Enquiries Yet</h3>
              <p className="text-gray-500 mb-4">There are no property enquiries to display at the moment.</p>
              <p className="text-sm text-gray-400">New enquiries will appear here when customers contact you about properties.</p>
            </div>
          </div>
        ) : (
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enquiries.map((enquiry) => (
              <tr key={enquiry.id} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-4 py-3 text-sm text-gray-900">{getPropertyValue(enquiry, 'name')}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{getPropertyValue(enquiry, 'email')}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{getPropertyValue(enquiry, 'phone_number')}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{getPropertyValue(enquiry, 'subject')}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{getPropertyValue(enquiry, 'budget_range')}</td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                  <ExpandableText text={getPropertyValue(enquiry, 'message')} maxLength={200} />
                </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                    {getPropertyValue(enquiry, 'created_at') ? new Date(enquiry.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => handleDeleteClick(enquiry)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {enquiries.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Enquiries Yet</h3>
              <p className="text-gray-500 mb-4">There are no property enquiries to display at the moment.</p>
              <p className="text-sm text-gray-400">New enquiries will appear here when customers contact you about properties.</p>
            </div>
          </div>
        ) : (
          enquiries.map((enquiry) => (
          <div key={enquiry.id} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium text-gray-900">{getPropertyValue(enquiry, 'name')}</h3>
                <p className="text-sm text-gray-500">{getPropertyValue(enquiry, 'email')}</p>
              </div>
              <button
                onClick={() => handleDeleteClick(enquiry)}
                className="inline-flex items-center p-1.5 border border-transparent text-sm font-medium rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Phone:</span>
                <p className="text-gray-900">{getPropertyValue(enquiry, 'phone_number')}</p>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>
                <p className="text-gray-900">{getPropertyValue(enquiry, 'created_at') ? new Date(enquiry.created_at).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Subject:</span>
                <p className="text-gray-900">{getPropertyValue(enquiry, 'subject')}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Budget Range:</span>
                <p className="text-gray-900">{getPropertyValue(enquiry, 'budget_range')}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Message:</span>
                <div className="mt-1">
                  <ExpandableText text={getPropertyValue(enquiry, 'message')} maxLength={200} />
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>

      {/* Confirmation Modal - Now more mobile friendly */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedEnquiry(null);
        }}
        onConfirm={handleDelete}
        title="Delete Enquiry"
      >
        <div className="p-4 sm:p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
              Delete this enquiry?
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone.
            </p>
            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md text-left">
              <p className="mb-1"><strong>Name:</strong> {getPropertyValue(selectedEnquiry, 'name')}</p>
              <p className="mb-1"><strong>Email:</strong> {getPropertyValue(selectedEnquiry, 'email')}</p>
              <p><strong>Subject:</strong> {getPropertyValue(selectedEnquiry, 'subject')}</p>
            </div>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
}

export default Enquiries;