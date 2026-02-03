import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash } from 'react-icons/fa';
import { propertyAPI } from '../../Services/api';

function BannerManagement() {
  const [heroBanners, setHeroBanners] = useState([]);
  const [offerBanners, setOfferBanners] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bannerType, setBannerType] = useState('hero'); // 'hero' or 'offer'
  const [newBanner, setNewBanner] = useState({
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const [heroResponse, offerResponse] = await Promise.all([
        propertyAPI.getHeroBanners(),
        propertyAPI.getOfferBanners()
      ]);
      setHeroBanners(heroResponse);
      setOfferBanners(offerResponse);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewBanner({ image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newBanner.image) newErrors.image = 'Image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append('image', newBanner.image);

      if (bannerType === 'hero') {
        await propertyAPI.addHeroBanner(formData);
      } else {
        await propertyAPI.addOfferBanner(formData);
      }

      await fetchBanners();
      setShowAddModal(false);
      setNewBanner({ image: null });
      setPreviewImage(null);
    } catch (error) {
      console.error('Error adding banner:', error);
      setErrors({ submit: error.message });
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        if (type === 'hero') {
          await propertyAPI.deleteHeroBanner(id);
        } else {
          await propertyAPI.deleteOfferBanner(id);
        }
        await fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Banner Management</h1>
        <button
          onClick={() => {
            setBannerType('hero');
            setShowAddModal(true);
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Add New Banner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Hero Banners Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Hero Banners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {heroBanners.map((banner) => (
                <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <img
                    src={banner.image}
                    alt="Hero Banner"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Added: {new Date(banner.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(banner.id, 'hero')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offer Banners Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Offer Banners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offerBanners.map((banner) => (
                <div key={banner.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <img
                    src={banner.image}
                    alt="Offer Banner"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Added: {new Date(banner.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(banner.id, 'offer')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Add New Banner</h2>
            <form onSubmit={handleAddBanner}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Banner Type</label>
                  <select
                    value={bannerType}
                    onChange={(e) => setBannerType(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 sm:p-3 text-sm sm:text-base"
                  >
                    <option value="hero">Hero Banner</option>
                    <option value="offer">Offer Banner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Banner Image</label>
                  <div className="mt-1 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-2 sm:space-y-1 text-center">
                      {previewImage ? (
                        <div className="relative">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="mx-auto h-24 sm:h-32 w-auto"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage(null);
                              setNewBanner({ image: null });
                            }}
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <FaTrash className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <FaUpload className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                          <div className="flex flex-col sm:flex-row text-sm text-gray-600 items-center justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleImageUpload}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                </div>
              </div>

              {errors.submit && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Add Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BannerManagement; 