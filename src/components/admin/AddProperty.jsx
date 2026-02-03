import React, { useState, useEffect, useCallback } from 'react';
import { propertyAPI } from '../../Services/api';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaTrash } from 'react-icons/fa';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [features, setFeatures] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([{ place: '', km: '' }]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageError, setImageError] = useState('');

  const [formData, setFormData] = useState({
    property_for: 'rent',
    property_ownership: 'management',
    contact_name: '',
    whatsapp_number: '',
    phone_number: '',
    email: '',
    state: '',
    district: '',
    city: '',
    title: '',
    price: '',
    property_type: '',
    latitude: '',
    longitude: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    features: [],
    google_maps_url: '',
    google_embedded_map_link: '',
    youtube_video_link: '',
    built_year: '',
    furnishing: 'unfurnished', // Valid values: 'furnished', 'semi_furnished', 'unfurnished'
    parking_spaces: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statesData, propertyTypesData, featuresData] = await Promise.all([
          propertyAPI.getStates(),
          propertyAPI.getPropertyTypes(),
          propertyAPI.getAmenities()
        ]);
        setStates(statesData);
        setPropertyTypes(propertyTypesData);
        setFeatures(featuresData);
      } catch (err) {
        setError('Failed to load initial data');
        console.error(err);
      }
    };
    fetchInitialData();
  }, []);

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

  const handleStateChange = async (e) => {
    const stateId = e.target.value;
    const selectedState = states.find(state => state.id.toString() === stateId);
    setFormData({ 
      ...formData, 
      state: selectedState ? selectedState.name : '', 
      district: '', 
      city: '' 
    });
    try {
      if (stateId) {
        const districtsData = await propertyAPI.getDistricts(stateId);
        setDistricts(districtsData);
      } else {
        setDistricts([]);
      }
      setCities([]);
    } catch (err) {
      console.error('Failed to fetch districts:', err);
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    const selectedDistrict = districts.find(district => district.id.toString() === districtId);
    setFormData({ 
      ...formData, 
      district: selectedDistrict ? selectedDistrict.name : '', 
      city: '' 
    });
    try {
      if (districtId) {
        const citiesData = await propertyAPI.getCities(districtId);
        setCities(citiesData);
      } else {
        setCities([]);
      }
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    }
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    const selectedCity = cities.find(city => city.id.toString() === cityId);
    setFormData({ 
      ...formData, 
      city: selectedCity ? selectedCity.name : '' 
    });
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1 MB
    let hasOversizedFiles = false;

    // Create preview URLs for the newly selected images
    const newImagePreviews = acceptedFiles.reduce((previews, file) => {
      if (file.size > MAX_IMAGE_SIZE) {
        hasOversizedFiles = true;
        return previews;
      }

      // Create a new file object with proper name and type
      const renamedFile = new File([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });

      previews.push({
        file: renamedFile,
        preview: URL.createObjectURL(file)
      });

      return previews;
    }, []);

    setSelectedImages(prev => [...prev, ...newImagePreviews]);

    if (hasOversizedFiles) {
      setImageError('Each image must be 1 MB or smaller. Oversized files were skipped.');
    } else {
      setImageError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  const handleImageDelete = (index) => {
    setSelectedImages(prev => {
      const updatedImages = prev.filter((_, i) => i !== index);
      // Cleanup the preview URL
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return updatedImages;
    });
  };

  const handleNearbyPlaceChange = (index, field, value) => {
    const updatedPlaces = [...nearbyPlaces];
    updatedPlaces[index][field] = value;
    setNearbyPlaces(updatedPlaces);
  };

  const addNearbyPlace = () => {
    setNearbyPlaces([...nearbyPlaces, { place: '', km: '' }]);
  };

  const removeNearbyPlace = (index) => {
    const updatedPlaces = nearbyPlaces.filter((_, i) => i !== index);
    setNearbyPlaces(updatedPlaces);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.state || !formData.district || !formData.city) {
        throw new Error('Please select state, district, and city');
      }

      const formDataToSend = new FormData();
      
      console.log('Current furnishing value:', formData.furnishing);
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'features') {
          // Handle features array
          formData[key].forEach(feature => {
            formDataToSend.append('features', feature);
          });
        } else if (formData[key] !== '') {
          // Only append non-empty values
          // Ensure furnishing is sent as a plain string
          if (key === 'furnishing') {
            formDataToSend.append(key, formData[key].toString().trim());
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Filter out empty nearby places and format as single string
      const validNearbyPlaces = nearbyPlaces.filter(place => 
        place.place.trim() !== '' && place.km !== '' && !isNaN(parseFloat(place.km))
      );
      
      // Format nearby places as JSON array
      if (validNearbyPlaces.length > 0) {
        const formattedPlaces = validNearbyPlaces.map(place => ({
          place: place.place.trim(),
          distance: parseFloat(place.km).toFixed(1)
        }));
        formDataToSend.append('nearby_places', JSON.stringify(formattedPlaces));
      }

      // Append images
      selectedImages.forEach(image => {
        if (image.file) {
          formDataToSend.append('uploaded_images', image.file);
        }
      });

      console.log('Form data being submitted:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File - ${value.name}`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      await propertyAPI.createProperty(formDataToSend);
      navigate('/admin/properties');
    } catch (err) {
      setError(err.message || 'Failed to create property');
      console.error('Error creating property:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const featureId = parseInt(value);
      const updatedFeatures = checked
        ? [...formData.features, featureId]
        : formData.features.filter(id => id !== featureId);
      setFormData({ ...formData, features: updatedFeatures });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePropertyTypeChange = (e) => {
    const { value } = e.target;
    const nextPropertyType = propertyTypes.find(type => type.id.toString() === value);
    const nextIsLandProperty =
      nextPropertyType && nextPropertyType.name.toLowerCase() === 'land';

    setFormData(prevData => {
      const prevPropertyType = propertyTypes.find(
        type => type.id.toString() === prevData.property_type
      );
      const prevIsLandProperty =
        prevPropertyType && prevPropertyType.name.toLowerCase() === 'land';

      return {
        ...prevData,
        property_type: value,
        bedrooms: nextIsLandProperty ? '0' : (prevIsLandProperty ? '' : prevData.bedrooms),
        bathrooms: nextIsLandProperty ? '0' : (prevIsLandProperty ? '' : prevData.bathrooms),
        furnishing: nextIsLandProperty
          ? 'unfurnished'
          : (prevIsLandProperty ? 'unfurnished' : prevData.furnishing || 'unfurnished'),
        parking_spaces: nextIsLandProperty
          ? '0'
          : (prevIsLandProperty ? '' : prevData.parking_spaces),
        built_year: nextIsLandProperty ? '0' : (prevIsLandProperty ? '' : prevData.built_year)
      };
    });
  };

  // Check if current property type is Land
  const selectedPropertyType = propertyTypes.find(type => type.id.toString() === formData.property_type);
  const isLandProperty = selectedPropertyType && selectedPropertyType.name.toLowerCase() === 'land';

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Add New Property</h1>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Property For</label>
              <select
                name="property_for"
                value={formData.property_for}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              >
                <option value="">Select property type</option>
                <option value="sell">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Property Ownership</label>
              <select
                name="property_ownership"
                value={formData.property_ownership}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              >
                <option value="">Select ownership</option>
                <option value="management">Management</option>
                <option value="direct_owner">Direct Owner</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Contact Name</label>
              <input
                type="text"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">WhatsApp Number</label>
              <input
                type="tel"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
          </div>
        </div>

        {/* Location Selection */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Location</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">State</label>
              <select
                name="state"
                value={states.find(state => state.name === formData.state)?.id || ''}
                onChange={handleStateChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">District</label>
              <select
                name="district"
                value={districts.find(district => district.name === formData.district)?.id || ''}
                onChange={handleDistrictChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
                disabled={!formData.state}
              >
                <option value="">{formData.state ? 'Select a district' : 'Please select a state first'}</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">City</label>
              <select
                name="city"
                value={cities.find(city => city.name === formData.city)?.id || ''}
                onChange={handleCityChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
                disabled={!formData.district}
              >
                <option value="">{formData.district ? 'Select a city' : 'Please select a district first'}</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Property Details</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Price</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Property Type</label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handlePropertyTypeChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              >
                <option value="">Select property type</option>
                {propertyTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">
                {isLandProperty ? 'Area (cents)' : 'Area (sq ft)'}
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                disabled={isLandProperty}
                className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                  isLandProperty ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                disabled={isLandProperty}
                className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                  isLandProperty ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                required
              />
            </div>
          </div>

          {/* Property Description */}
          <div className="mt-4 sm:mt-6">
            <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Property Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Enter a detailed description of the property..."
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Additional Details</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">YouTube Video Link</label>
              <input
                type="url"
                name="youtube_video_link"
                value={formData.youtube_video_link}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Built Year</label>
              <input
                type="number"
                name="built_year"
                value={formData.built_year}
                onChange={handleInputChange}
                disabled={isLandProperty}
                className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                  isLandProperty ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Furnishing</label>
              <select
                name="furnishing"
                value={formData.furnishing}
                onChange={handleInputChange}
                disabled={isLandProperty}
                className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                  isLandProperty ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="unfurnished">Unfurnished</option>
                <option value="furnished">Furnished</option>
                <option value="semi_furnished">Semi-furnished</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Parking Spaces</label>
              <input
                type="number"
                name="parking_spaces"
                value={formData.parking_spaces}
                onChange={handleInputChange}
                disabled={isLandProperty}
                className={`w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base ${
                  isLandProperty ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                min="0"
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <label className="block mb-2 text-sm sm:text-base font-medium text-gray-700">Google Embedded Map Link</label>
            <textarea
              name="google_map_link"
              value={formData.google_map_link}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Paste the Google Maps embed iframe code here..."
            />
          </div>
        </div>

        {/* Nearby Places */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Nearby Places</h2>
          
          <div className="space-y-3 sm:space-y-4">
            {nearbyPlaces.map((place, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input
                  type="text"
                  value={place.name}
                  onChange={(e) => handleNearbyPlaceChange(index, 'name', e.target.value)}
                  className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Place name (e.g., International Airport)"
                />
                <input
                  type="number"
                  value={place.distance}
                  onChange={(e) => handleNearbyPlaceChange(index, 'distance', e.target.value)}
                  className="w-full sm:w-32 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Distance (km)"
                  step="0.1"
                />
                <button
                  type="button"
                  onClick={() => removeNearbyPlace(index)}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
                >
                  Remove
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addNearbyPlace}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Add Nearby Place
            </button>
          </div>
        </div>

        {/* Property Images */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Property Images</h2>
          
          {/* Image Preview Grid */}
          {selectedImages.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-32 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageDelete(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Drag and Drop Upload Area */}
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
          {imageError && (
            <p className="mt-2 text-sm text-red-600">
              {imageError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex flex-wrap justify-end items-center gap-3">
          {error && (
            <div className="px-3 py-2 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm sm:text-base">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all text-sm sm:text-base font-medium flex items-center justify-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
                <span>Creating Property...</span>
              </>
            ) : (
              'Create Property'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
