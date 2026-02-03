import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';
import { propertyAPI } from '../../Services/api';
import { toast } from 'react-toastify';
import ConfirmationModal from '../shared/ConfirmationModal';

function Settings() {
  // State for features
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  const [editingFeature, setEditingFeature] = useState(null);
  const [editFeatureName, setEditFeatureName] = useState('');

  // State for property types
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [newPropertyType, setNewPropertyType] = useState('');
  const [editingPropertyType, setEditingPropertyType] = useState(null);
  const [editPropertyTypeName, setEditPropertyTypeName] = useState('');

  // State for deletion confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: null, // 'feature' or 'propertyType'
    id: null,
    name: ''
  });

  // Fetch features and property types on component mount
  useEffect(() => {
    fetchFeatures();
    fetchPropertyTypes();
  }, []);

  const fetchFeatures = async () => {
    try {
      const data = await propertyAPI.getAmenities();
      setFeatures(data);
    } catch (error) {
      toast.error('Failed to fetch features');
      console.error('Error fetching features:', error);
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const data = await propertyAPI.getPropertyTypes();
      setPropertyTypes(data);
    } catch (error) {
      toast.error('Failed to fetch property types');
      console.error('Error fetching property types:', error);
    }
  };

  // Feature management functions
  const handleAddFeature = async (e) => {
    e.preventDefault();
    if (newFeature.trim()) {
      try {
        await propertyAPI.createFeature({ name: newFeature.trim() });
        await fetchFeatures();
        setNewFeature('');
        toast.success('Feature added successfully');
      } catch (error) {
        toast.error('Failed to add feature');
        console.error('Error adding feature:', error);
      }
    }
  };

  const handleEditFeature = (id, name) => {
    setEditingFeature(id);
    setEditFeatureName(name);
  };

  const handleUpdateFeature = async (id) => {
    if (editFeatureName.trim()) {
      try {
        await propertyAPI.updateFeature(id, { name: editFeatureName.trim() });
        await fetchFeatures();
        setEditingFeature(null);
        setEditFeatureName('');
        toast.success('Feature updated successfully');
      } catch (error) {
        toast.error('Failed to update feature');
        console.error('Error updating feature:', error);
      }
    }
  };

  const handleDeleteFeature = async (id) => {
    try {
      await propertyAPI.deleteFeature(id);
      await fetchFeatures();
      toast.success('Feature deleted successfully');
    } catch (error) {
      toast.error('Failed to delete feature');
      console.error('Error deleting feature:', error);
    }
  };

  // Property type management functions
  const handleAddPropertyType = async (e) => {
    e.preventDefault();
    if (newPropertyType.trim()) {
      try {
        await propertyAPI.createPropertyType({ name: newPropertyType.trim() });
        await fetchPropertyTypes();
        setNewPropertyType('');
        toast.success('Property type added successfully');
      } catch (error) {
        toast.error('Failed to add property type');
        console.error('Error adding property type:', error);
      }
    }
  };

  const handleEditPropertyType = (id, name) => {
    setEditingPropertyType(id);
    setEditPropertyTypeName(name);
  };

  const handleUpdatePropertyType = async (id) => {
    if (editPropertyTypeName.trim()) {
      try {
        await propertyAPI.updatePropertyType(id, { name: editPropertyTypeName.trim() });
        await fetchPropertyTypes();
        setEditingPropertyType(null);
        setEditPropertyTypeName('');
        toast.success('Property type updated successfully');
      } catch (error) {
        toast.error('Failed to update property type');
        console.error('Error updating property type:', error);
      }
    }
  };

  const handleDeletePropertyType = async (id) => {
    try {
      await propertyAPI.deletePropertyType(id);
      await fetchPropertyTypes();
      toast.success('Property type deleted successfully');
    } catch (error) {
      toast.error('Failed to delete property type');
      console.error('Error deleting property type:', error);
    }
  };

  const handleDeleteClick = (type, id, name) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      name
    });
  };

  const handleDeleteConfirm = async () => {
    const { type, id } = deleteConfirmation;
    try {
      if (type === 'feature') {
        await propertyAPI.deleteFeature(id);
        await fetchFeatures();
        toast.success('Feature deleted successfully');
      } else if (type === 'propertyType') {
        await propertyAPI.deletePropertyType(id);
        await fetchPropertyTypes();
        toast.success('Property type deleted successfully');
      }
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
      console.error(`Error deleting ${type}:`, error);
    } finally {
      setDeleteConfirmation({ isOpen: false, type: null, id: null, name: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, type: null, id: null, name: '' });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
      <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Settings</h1>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 border border-gray-200 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-6 sm:h-8 bg-blue-600 rounded"></div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Features</h2>
        </div>
        
        {/* Add Feature Form */}
        <div className="mb-6">
          <form onSubmit={handleAddFeature} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Enter feature name"
              className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
            >
              Add Feature
            </button>
          </form>
        </div>

        {/* Features List */}
        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              {editingFeature === feature.id ? (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
                  <input
                    type="text"
                    value={editFeatureName}
                    onChange={(e) => setEditFeatureName(e.target.value)}
                    className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateFeature(feature.id)}
                      className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingFeature(null)}
                      className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-sm sm:text-base text-gray-800 flex-1">{feature.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditFeature(feature.id, feature.name)}
                      className="p-1 sm:p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit Feature"
                    >
                      <FaEdit className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick('feature', feature.id, feature.name)}
                      className="p-1 sm:p-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete Feature"
                    >
                      <FaTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Property Types Section */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-6 sm:h-8 bg-green-600 rounded"></div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">Property Types</h2>
        </div>
        
        {/* Add Property Type Form */}
        <div className="mb-6">
          <form onSubmit={handleAddPropertyType} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="text"
              value={newPropertyType}
              onChange={(e) => setNewPropertyType(e.target.value)}
              placeholder="Enter property type name"
              className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              required
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base font-medium"
            >
              Add Property Type
            </button>
          </form>
        </div>

        {/* Property Types List */}
        <div className="space-y-3">
          {propertyTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              {editingPropertyType === type.id ? (
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
                  <input
                    type="text"
                    value={editPropertyTypeName}
                    onChange={(e) => setEditPropertyTypeName(e.target.value)}
                    className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePropertyType(type.id)}
                      className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPropertyType(null)}
                      className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-sm sm:text-base text-gray-800 flex-1">{type.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPropertyType(type.id, type.name)}
                      className="p-1 sm:p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit Property Type"
                    >
                      <FaEdit className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick('propertyType', type.id, type.name)}
                      className="p-1 sm:p-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete Property Type"
                    >
                      <FaTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteConfirmation.type === 'feature' ? 'Feature' : 'Property Type'}`}
        message={`Are you sure you want to delete "${deleteConfirmation.name}"? This action cannot be undone.`}
      />
    </div>
  );
}

export default Settings; 