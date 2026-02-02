import axios from 'axios';

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ?? 'https://asseton-api-bqa7a5cgffe2ghga.southindia-01.azurewebsites.net/api/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

const resolveToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

apiClient.interceptors.request.use((config) => {
  const requiresAuth = config.requiresAuth ?? false;

  if (requiresAuth) {
    const token = resolveToken();

    if (!token) {
      return Promise.reject(new Error('Authentication token missing.'));
    }

    if (!config.headers) config.headers = {};
    config.headers.Authorization = `Token ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  if ('requiresAuth' in config) {
    delete config.requiresAuth;
  }

  return config;
});

const multipartConfig = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
};

const withAuth = (config = {}) => ({
  ...config,
  requiresAuth: true,
});

const buildListConfig = (options) => {
  if (!options) return {};

  const config = {};

  if (options.params) {
    config.params = options.params;
  }

  if (options.admin) {
    config.requiresAuth = true;
  }

  return config;
};

const unwrap = (promise) => promise.then((response) => response.data);

export const propertyAPI = {
  // Properties
  getAllProperties: (options) =>
    unwrap(apiClient.get('/properties/properties/', buildListConfig(options))),
  getProperty: (id, options) =>
    unwrap(apiClient.get(`/properties/properties/${id}/`, buildListConfig(options))),
  createProperty: (formData) =>
    apiClient.post('/properties/properties/', formData, withAuth({ ...multipartConfig })),
  updateProperty: (id, formData) =>
    unwrap(
      apiClient.patch(
        `/properties/properties/${id}/`,
        formData,
        withAuth({ ...multipartConfig })
      )
    ),
  deleteProperty: (id) => apiClient.delete(`/properties/properties/${id}/`, withAuth()),
  deletePropertyImage: (propertyId, imageId) =>
    apiClient.delete(
      `/properties/properties/${propertyId}/delete_image/`,
      withAuth({
        data: { image_id: imageId },
      })
    ),

  // Property types & features (amenities)
  getPropertyTypes: () => unwrap(apiClient.get('/properties/property-types/')),
  createPropertyType: (payload) =>
    unwrap(apiClient.post('/properties/property-types/', payload, withAuth())),
  updatePropertyType: (id, payload) =>
    unwrap(apiClient.patch(`/properties/property-types/${id}/`, payload, withAuth())),
  deletePropertyType: (id) => apiClient.delete(`/properties/property-types/${id}/`, withAuth()),

  getAmenities: () => unwrap(apiClient.get('/properties/features/')),
  createFeature: (payload) =>
    unwrap(apiClient.post('/properties/features/', payload, withAuth())),
  updateFeature: (id, payload) =>
    unwrap(apiClient.patch(`/properties/features/${id}/`, payload, withAuth())),
  deleteFeature: (id) => apiClient.delete(`/properties/features/${id}/`, withAuth()),

  // Location data
  getStates: () => unwrap(apiClient.get('/properties/states/')),
  getDistricts: (stateId) =>
    unwrap(
      apiClient.get('/properties/districts/', {
        params: { state_id: stateId },
      })
    ),
  getCities: (districtId) =>
    unwrap(
      apiClient.get('/properties/cities/', {
        params: { district_id: districtId },
      })
    ),

  // Banners
  getHeroBanners: () => unwrap(apiClient.get('/properties/hero-banners/')),
  addHeroBanner: (formData) =>
    unwrap(
      apiClient.post(
        '/properties/hero-banners/',
        formData,
        withAuth({ ...multipartConfig })
      )
    ),
  deleteHeroBanner: (id) =>
    apiClient.delete(`/properties/hero-banners/${id}/`, withAuth()),

  getOfferBanners: () => unwrap(apiClient.get('/properties/offer-banners/')),
  addOfferBanner: (formData) =>
    unwrap(
      apiClient.post(
        '/properties/offer-banners/',
        formData,
        withAuth({ ...multipartConfig })
      )
    ),
  deleteOfferBanner: (id) =>
    apiClient.delete(`/properties/offer-banners/${id}/`, withAuth()),

  // Contacts / enquiries
  submitContactForm: (payload) => unwrap(apiClient.post('/properties/contacts/', payload)),
  getAllContacts: () => unwrap(apiClient.get('/properties/contacts/', withAuth())),
  deleteContact: (id) => apiClient.delete(`/properties/contacts/${id}/`, withAuth()),
};

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/accounts/login/', { email, password });
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await apiClient.post('/accounts/forgot-password/', { email });
    return response.data;
  },
  verifyOTP: async (email, otp) => {
    const response = await apiClient.post('/accounts/verify-otp/', { email, otp });
    return response.data;
  },
  resetPassword: async (email, newPassword, confirmPassword) => {
    const response = await apiClient.post('/accounts/reset-password/', {
      email,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
    return response.data;
  },
};

export default {
  propertyAPI,
  authAPI,
};
