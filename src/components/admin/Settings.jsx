import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';
import { propertyAPI } from '../../Services/api';
import { toast } from 'react-toastify';
import ConfirmationModal from '../shared/ConfirmationModal';

function Settings() {
  // State for features
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState('');
  const [editingFeature, setEditingFeature] = useState({ id: null, value: '' });

  // State for property types
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [newPropertyType, setNewPropertyType] = useState('');
  const [editingPropertyType, setEditingPropertyType] = useState({ id: null, value: '' });

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
  const addFeature = async () => {
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

  const startEditFeature = (feature) => {
    setEditingFeature({ id: feature.id, value: feature.name });
  };

  const saveFeatureEdit = async () => {
    if (editingFeature.value.trim()) {
      try {
        await propertyAPI.updateFeature(editingFeature.id, { name: editingFeature.value.trim() });
        await fetchFeatures();
        setEditingFeature({ id: null, value: '' });
        toast.success('Feature updated successfully');
      } catch (error) {
        toast.error('Failed to update feature');
        console.error('Error updating feature:', error);
      }
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

  // Property type management functions
  const addPropertyType = async () => {
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

  const startEditPropertyType = (propertyType) => {
    setEditingPropertyType({ id: propertyType.id, value: propertyType.name });
  };

  const savePropertyTypeEdit = async () => {
    if (editingPropertyType.value.trim()) {
      try {
        await propertyAPI.updatePropertyType(editingPropertyType.id, { name: editingPropertyType.value.trim() });
        await fetchPropertyTypes();
        setEditingPropertyType({ id: null, value: '' });
        toast.success('Property type updated successfully');
      } catch (error) {
        toast.error('Failed to update property type');
        console.error('Error updating property type:', error);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Property Features Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-teal-600 rounded-full"></span>
            Property Features
          </h2>

          {/* Add new feature */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add new feature"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <button
              onClick={addFeature}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <FaPlus className="text-sm" />
              Add
            </button>
          </div>

          {/* Features list */}
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                {editingFeature.id === feature.id ? (
                  <input
                    type="text"
                    value={editingFeature.value}
                    onChange={(e) => setEditingFeature({ ...editingFeature, value: e.target.value })}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent mr-2"
                  />
                ) : (
                  <span>{feature.name}</span>
                )}
                <div className="flex items-center gap-2">
                  {editingFeature.id === feature.id ? (
                    <button
                      onClick={saveFeatureEdit}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FaSave className="text-sm" />
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditFeature(feature)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick('feature', feature.id, feature.name)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Property Types Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
            Property Types
          </h2>

          {/* Add new property type */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newPropertyType}
              onChange={(e) => setNewPropertyType(e.target.value)}
              placeholder="Add new property type"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={addPropertyType}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <FaPlus className="text-sm" />
              Add
            </button>
          </div>

          {/* Property types list */}
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {propertyTypes.map((propertyType) => (
              <div key={propertyType.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                {editingPropertyType.id === propertyType.id ? (
                  <input
                    type="text"
                    value={editingPropertyType.value}
                    onChange={(e) => setEditingPropertyType({ ...editingPropertyType, value: e.target.value })}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent mr-2"
                  />
                ) : (
                  <span>{propertyType.name}</span>
                )}
                <div className="flex items-center gap-2">
                  {editingPropertyType.id === propertyType.id ? (
                    <button
                      onClick={savePropertyTypeEdit}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FaSave className="text-sm" />
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditPropertyType(propertyType)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick('propertyType', propertyType.id, propertyType.name)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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