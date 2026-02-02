import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI } from '../../Services/api';
import { FaMapMarkerAlt, FaImage, FaTrash, FaPlus, FaArrowLeft, FaUpload } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [features, setFeatures] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    property_for: '',
    property_ownership: '',
    contact_name: '',
    whatsapp_number: '',
    phone_number: '',
    email: '',
    location: {
      state: '',
      district: '',
      city: ''
    },
    title: '',
    price: '',
    property_type_details: {
      id: '',
      name: ''
    },
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    feature_details: [],
    google_maps_url: '',
    google_embedded_map_link: '',
    youtube_video_link: '',
    latitude: '',
    longitude: '',
    nearby_places: [],
    built_year: '',
    furnishing: '',
    parking_spaces: '',
    images: []
  });

  useEffect(() => {
    fetchPropertyTypes();
    fetchFeatures();
    if (id) {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      // Cleanup preview URLs when component unmounts
      selectedImages.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, [selectedImages]);

  const fetchPropertyTypes = async () => {
    try {
      const data = await propertyAPI.getPropertyTypes();
      setPropertyTypes(data);
    } catch (err) {
      console.error('Error fetching property types:', err);
    }
  };

  const fetchFeatures = async () => {
    try {
      const data = await propertyAPI.getAmenities();
      setFeatures(data);
    } catch (err) {
      console.error('Error fetching features:', err);
    }
  };

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const data = await propertyAPI.getProperty(id, { admin: true });
      
      // Format and validate the data
      const formattedData = {
        ...data,
        // Ensure location object exists with all required fields
        location: {
          state: data.location?.state || '',
          district: data.location?.district || '',
          city: data.location?.city || ''
        },
        // Ensure numeric fields are within reasonable ranges
        bedrooms: Math.min(Number(data.bedrooms) || 0, 10),
        bathrooms: Math.min(Number(data.bathrooms) || 0, 10),
        parking_spaces: Math.min(Number(data.parking_spaces) || 0, 10),
        built_year: Math.min(Number(data.built_year) || 0, new Date().getFullYear()),
        area: Number(data.area) || 0,
        price: Number(data.price) || 0,
        
        // Ensure arrays are properly formatted
        feature_details: Array.isArray(data.feature_details) ? data.feature_details : [],
        
        // Handle nearby places properly
        nearby_places: (() => {
          if (Array.isArray(data.nearby_places)) {
            return data.nearby_places;
          }
          if (typeof data.nearby_places === 'string') {
            try {
              // Try to parse if it's a JSON string
              const parsed = JSON.parse(data.nearby_places);
              return Array.isArray(parsed) ? parsed : [data.nearby_places];
            } catch {
              // If parsing fails, treat it as a single place
              return [data.nearby_places];
            }
          }
          return [];
        })(),
            
        // Ensure other fields are properly formatted
        property_type_details: data.property_type_details || { id: '', name: '' },
        images: Array.isArray(data.images) ? data.images : [],
        
        // Ensure required fields have default values
        property_for: data.property_for || '',
        property_ownership: data.property_ownership || '',
        contact_name: data.contact_name || '',
        whatsapp_number: data.whatsapp_number || '',
        phone_number: data.phone_number || '',
        email: data.email || '',
        title: data.title || '',
        description: data.description || '',
        furnishing: data.furnishing || '',
        google_maps_url: data.google_maps_url || '',
        google_embedded_map_link: data.google_embedded_map_link || '',
        youtube_video_link: data.youtube_video_link || '',
        latitude: data.latitude || '',
        longitude: data.longitude || ''
      };

      setFormData(formattedData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch property details');
      console.error('Error fetching property:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Ensure the parent object exists and maintain its structure
        const parentObj = prev[parent] || {};
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNearbyPlaceChange = (index, value) => {
    // Remove any special characters or formatting that might cause issues
    const cleanValue = value.trim();
    
    const updatedPlaces = [...formData.nearby_places];
    updatedPlaces[index] = cleanValue;
    setFormData(prev => ({
      ...prev,
      nearby_places: updatedPlaces
    }));
  };

  const addNearbyPlace = () => {
    setFormData(prev => ({
      ...prev,
      nearby_places: [...prev.nearby_places, '']
    }));
  };

  const removeNearbyPlace = (index) => {
    setFormData(prev => ({
      ...prev,
      nearby_places: prev.nearby_places.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureToggle = (featureId) => {
    setFormData(prev => {
      const currentFeatures = prev.feature_details || [];
      const isSelected = currentFeatures.some(f => f.id === featureId);
      
      if (isSelected) {
        return {
          ...prev,
          feature_details: currentFeatures.filter(f => f.id !== featureId)
        };
      } else {
        const featureToAdd = features.find(f => f.id === featureId);
        return {
          ...prev,
          feature_details: [...currentFeatures, { id: featureId, name: featureToAdd.name }]
        };
      }
    });
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    // Create preview URLs for the newly selected images
    const newImagePreviews = acceptedFiles.map(file => {
      // Create a new file object with proper name and type
      const renamedFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
      
      return {
        file: renamedFile,
        preview: URL.createObjectURL(file)
      };
    });

    setSelectedImages(prev => [...prev, ...newImagePreviews]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const handleImageDelete = async (imageId) => {
    try {
      // Call the new API endpoint to delete the image
      await propertyAPI.deletePropertyImage(id, imageId);
      
      // Update the local state to remove the deleted image
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageId)
      }));
      
      setError(null);
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate numeric fields
      const numericFields = {
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        built_year: Number(formData.built_year),
        parking_spaces: Number(formData.parking_spaces)
      };

      // Validate numeric fields are within reasonable ranges
      if (numericFields.bedrooms > 10) {
        throw new Error('Bedrooms cannot exceed 10');
      }
      if (numericFields.bathrooms > 10) {
        throw new Error('Bathrooms cannot exceed 10');
      }
      if (numericFields.parking_spaces > 10) {
        throw new Error('Parking spaces cannot exceed 10');
      }
      if (numericFields.built_year > new Date().getFullYear()) {
        throw new Error('Built year cannot be in the future');
      }
      if (numericFields.area <= 0) {
        throw new Error('Area must be greater than 0');
      }
      if (numericFields.price <= 0) {
        throw new Error('Price must be greater than 0');
      }

      // Create FormData object
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append('property_for', formData.property_for);
      formDataToSend.append('property_ownership', formData.property_ownership);
      formDataToSend.append('contact_name', formData.contact_name.trim());
      formDataToSend.append('whatsapp_number', formData.whatsapp_number.trim());
      formDataToSend.append('phone_number', formData.phone_number.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('furnishing', formData.furnishing);
      formDataToSend.append('google_maps_url', formData.google_maps_url.trim());
      formDataToSend.append('google_embedded_map_link', formData.google_embedded_map_link.trim());
      formDataToSend.append('youtube_video_link', formData.youtube_video_link.trim());
      formDataToSend.append('latitude', formData.latitude.trim());
      formDataToSend.append('longitude', formData.longitude.trim());

      // Add location fields
      formDataToSend.append('state', formData.location?.state?.trim() || '');
      formDataToSend.append('district', formData.location?.district?.trim() || '');
      formDataToSend.append('city', formData.location?.city?.trim() || '');

      // Add numeric fields
      Object.entries(numericFields).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Add property type
      if (formData.property_type_details?.id) {
        formDataToSend.append('property_type', formData.property_type_details.id);
      }

      // Add features as an array
      if (formData.feature_details && formData.feature_details.length > 0) {
        formData.feature_details.forEach((feature) => {
          formDataToSend.append('features', feature.id);
        });
      }

      // Add nearby places as an array - filter out empty strings
      if (formData.nearby_places && formData.nearby_places.length > 0) {
        const validNearbyPlaces = formData.nearby_places
          .map(place => place.toString().trim())
          .filter(place => place !== '');
        
        if (validNearbyPlaces.length > 0) {
          // Convert the array to JSON string before appending
          formDataToSend.append('nearby_places', JSON.stringify(validNearbyPlaces));
        }
      }

      // Add new images
      if (selectedImages && selectedImages.length > 0) {
        selectedImages.forEach((image, index) => {
          if (image.file) {
            formDataToSend.append('uploaded_images', image.file);
          }
        });
      }

      // Add existing image IDs
      if (formData.images && formData.images.length > 0) {
        const existingImageIds = formData.images.map(img => img.id);
        formDataToSend.append('existing_image_ids', JSON.stringify(existingImageIds));
      }

      // Log FormData contents for debugging
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(key, `File: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(key, value);
        }
      }

      const response = await propertyAPI.updateProperty(id, formDataToSend);
      
      if (response.images) {
        // Update the formData with the new images and clear selected images
        setFormData(prev => ({
          ...prev,
          images: response.images
        }));
        
        // Cleanup preview URLs and clear selected images
        selectedImages.forEach(image => {
          if (image.preview) {
            URL.revokeObjectURL(image.preview);
          }
        });
        setSelectedImages([]);
      }

      navigate('/admin/properties');
    } catch (err) {
      console.error('Error updating property:', err);
      const errorMessage = err.response?.data?.state || 
                          err.response?.data?.detail || 
                          err.response?.data?.message ||
                          err.message ||
                          'Failed to update property. Please check all required fields.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/admin/properties')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/properties')}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property For</label>
                <select
                  name="property_for"
                  value={formData.property_for}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select</option>
                  <option value="rent">Rent</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Ownership</label>
                <select
                  name="property_ownership"
                  value={formData.property_ownership}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select</option>
                  <option value="management">Management</option>
                  <option value="direct_owner">Owner</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Property Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  name="property_type_details.id"
                  value={formData.property_type_details?.id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select</option>
                  {propertyTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area (sq.ft)</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Built Year</label>
                <input
                  type="number"
                  name="built_year"
                  value={formData.built_year}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parking Spaces</label>
                <input
                  type="number"
                  name="parking_spaces"
                  value={formData.parking_spaces}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select</option>
                  <option value="furnished">Furnished</option>
                  <option value="semi_furnished">Semi-Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                <input
                  type="tel"
                  name="whatsapp_number"
                  value={formData.whatsapp_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <input
                  type="text"
                  name="location.district"
                  value={formData.location.district}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Maps URL</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="google_maps_url"
                    value={formData.google_maps_url}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Embedded Map Link</label>
                <textarea
                  name="google_embedded_map_link"
                  value={formData.google_embedded_map_link}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Description</h2>
            <div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {features.map(feature => (
                <div key={feature.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`feature-${feature.id}`}
                    checked={(formData.feature_details || []).some(f => f.id === feature.id)}
                    onChange={() => handleFeatureToggle(feature.id)}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={`feature-${feature.id}`} className="text-sm text-gray-700">
                    {feature.name}
                  </label>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Nearby Places */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Nearby Places</h2>
            <div className="space-y-4">
              {formData.nearby_places.map((place, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={String(place || '')}
                      onChange={(e) => handleNearbyPlaceChange(index, e.target.value)}
                      placeholder="Enter place name with distance (e.g., Shopping Mall 1.5km)"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {typeof place === 'string' && (place.includes('[]') || place.includes('""')) && (
                      <p className="text-sm text-red-500 mt-1">
                        Please remove any brackets or quotes from the text
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNearbyPlace(index)}
                    className="p-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <FaTrash className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addNearbyPlace}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Nearby Place</span>
              </button>
            </div>
          </motion.div>

          {/* Media */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Media</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Video Link</label>
                <input
                  type="url"
                  name="youtube_video_link"
                  value={formData.youtube_video_link}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Property Images</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Existing Images */}
                  {formData.images.map((image, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={image.image}
                        alt={`Property ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageDelete(image.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {/* New Selected Images */}
                  {selectedImages.map((image, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={image.preview}
                        alt={`New Upload ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(image.preview);
                          setSelectedImages(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Image Upload Section */}
                <div className="mt-4">
                  <div
                    {...getRootProps()}
                    className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg appearance-none cursor-pointer hover:border-blue-500 focus:outline-none"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <FaUpload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {isDragActive ? "Drop the files here" : "Drag & drop files or click to select"}
                      </span>
                    </div>
                    <input {...getInputProps()} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Submit Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end space-x-4"
          >
            <button
              type="button"
              onClick={() => navigate('/admin/properties')}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Save Changes
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default EditProperty; 