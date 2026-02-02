import React, { useState, useEffect } from 'react';
import { propertyAPI } from '../../Services/api';
import { useNavigate } from 'react-router-dom';

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
  const [previewImages, setPreviewImages] = useState([]);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(previews);
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
        formDataToSend.append('uploaded_images', image);
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

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Add New Property</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Property For</label>
            <select
              name="property_for"
              value={formData.property_for}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="rent">Rent</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Property Ownership</label>
            <select
              name="property_ownership"
              value={formData.property_ownership}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="management">Management</option>
              <option value="direct_owner">Direct Owner</option>
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Contact Name</label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">WhatsApp Number</label>
            <input
              type="text"
              name="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Location Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2">State</label>
            <select
              name="state"
              value={states.find(state => state.name === formData.state)?.id || ''}
              onChange={handleStateChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state.id} value={state.id}>{state.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">District</label>
            <select
              name="district"
              value={districts.find(district => district.name === formData.district)?.id || ''}
              onChange={handleDistrictChange}
              className="w-full p-2 border rounded"
              required
              disabled={!formData.state}
            >
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district.id} value={district.id}>{district.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">City</label>
            <select
              name="city"
              value={cities.find(city => city.name === formData.city)?.id || ''}
              onChange={handleCityChange}
              className="w-full p-2 border rounded"
              required
              disabled={!formData.district}
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Property Type</label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Property Type</option>
              {propertyTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Area (sq ft)</label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Location Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Latitude</label>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Longitude</label>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>

        {/* Features */}
        <div>
          <label className="block mb-2">Features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map(feature => (
              <div key={feature.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`feature-${feature.id}`}
                  value={feature.id}
                  checked={formData.features.includes(feature.id)}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor={`feature-${feature.id}`}>{feature.name}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Google Maps URL</label>
            <input
              type="url"
              name="google_maps_url"
              value={formData.google_maps_url}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">YouTube Video Link</label>
            <input
              type="url"
              name="youtube_video_link"
              value={formData.youtube_video_link}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Built Year</label>
            <input
              type="number"
              name="built_year"
              value={formData.built_year}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Furnishing</label>
            <select
              name="furnishing"
              value={formData.furnishing}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="unfurnished">Unfurnished</option>
              <option value="semi_furnished">Semi-Furnished</option>
              <option value="furnished">Furnished</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Parking Spaces</label>
            <input
              type="number"
              name="parking_spaces"
              value={formData.parking_spaces}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {/* Google Embedded Map Link */}
        <div>
          <label className="block mb-2">Google Embedded Map Link</label>
          <textarea
            name="google_embedded_map_link"
            value={formData.google_embedded_map_link}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            rows="3"
            placeholder="Paste the Google Maps embed iframe code here..."
          />
        </div>

        {/* Nearby Places */}
        <div>
          <label className="block mb-2">Nearby Places</label>
          {nearbyPlaces.map((place, index) => (
            <div key={index} className="flex gap-4 mb-4">
              <div className="flex-1 flex gap-4">
                <input
                  type="text"
                  placeholder="Place name (e.g., International School)"
                  value={place.place}
                  onChange={(e) => handleNearbyPlaceChange(index, 'place', e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Distance (km)"
                  value={place.km}
                  onChange={(e) => handleNearbyPlaceChange(index, 'km', e.target.value)}
                  className="w-32 p-2 border rounded"
                  onBlur={(e) => {
                    // Format the distance to one decimal place
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) {
                      handleNearbyPlaceChange(index, 'km', value.toFixed(1));
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => removeNearbyPlace(index)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addNearbyPlace}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Nearby Place
          </button>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-2">Property Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {previewImages.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;
