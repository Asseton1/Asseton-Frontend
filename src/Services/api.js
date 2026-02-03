import axios from 'axios';
import { getAPIConfig } from '../config/api';

// Get API configuration for current environment
const apiConfig = getAPIConfig();

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    
    // Don't modify Content-Type if it's FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor with proper error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      console.log('[API] 401 Unauthorized - Clearing auth data');
      localStorage.removeItem('adminAuthenticated');
      localStorage.removeItem('adminToken');
      
      // Only redirect if we're on admin pages
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
      
      return Promise.reject({
        message: 'Authentication required. Please log in again.',
        status: 401,
        isAuthError: true
      });
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

// Simple API call with fallback
const apiCallWithFallback = async (apiCall, fallbackData) => {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error.message);
    
    // If it's an auth error, don't use fallback
    if (error.isAuthError) {
      throw error;
    }
    
    return fallbackData;
  }
};

// Auth APIs - Simple and direct
export const authAPI = {
  login: async (email, password) => {
    try {
      if (import.meta.env.DEV) {
        console.log('API: Making login request to:', `${apiConfig.baseURL}/accounts/login/`)
      }
      
      const response = await apiClient.post('/accounts/login/', { email, password });
      
      if (import.meta.env.DEV) {
        console.log('API: Login response received:', response.data)
      }
      
      return response.data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API: Login error:', error)
      }
      
      // If it's an axios error with response, throw the error as-is for proper handling
      if (error.response) {
        throw error;
      }
      
      // If it's a network error or other type, throw a structured error
      throw {
        message: error.message || 'Network error occurred',
        isNetworkError: true,
        originalError: error
      };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/accounts/forgot-password/', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      const response = await apiClient.post('/accounts/verify-otp/', {
        email,
        otp,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    try {
      const response = await apiClient.post('/accounts/reset-password/', {
        email,
        otp,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Property APIs with better error handling
export const propertyAPI = {
  // Get all properties with pagination and filtering
  getAllProperties: async (params = {}) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      // Pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.page_size) queryParams.append('page_size', params.page_size);
      
      // Price filters
      if (params.price_min !== undefined && params.price_min !== null) {
        queryParams.append('price_min', params.price_min);
      }
      if (params.price_max !== undefined && params.price_max !== null) {
        queryParams.append('price_max', params.price_max);
      }
      
      // Property type
      if (params.property_type) queryParams.append('property_type', params.property_type);
      
      // Bedrooms and bathrooms
      if (params.bedrooms_min !== undefined && params.bedrooms_min !== null) {
        queryParams.append('bedrooms_min', params.bedrooms_min);
      }
      if (params.bathrooms_min !== undefined && params.bathrooms_min !== null) {
        queryParams.append('bathrooms_min', params.bathrooms_min);
      }
      
      // Ownership
      if (params.ownership) queryParams.append('ownership', params.ownership);
      
      // Area filters
      if (params.area_min !== undefined && params.area_min !== null) {
        queryParams.append('area_min', params.area_min);
      }
      if (params.area_max !== undefined && params.area_max !== null) {
        queryParams.append('area_max', params.area_max);
      }
      if (params.area_unit) queryParams.append('area_unit', params.area_unit);
      
      // Location
      if (params.location) queryParams.append('location', params.location);
      
      // Property for (rent/sell)
      if (params.property_for) queryParams.append('property_for', params.property_for);
      
      // Furnishing
      if (params.furnishing) queryParams.append('furnishing', params.furnishing);
      
      // Search query
      if (params.search) queryParams.append('search', params.search);
      
      const queryString = queryParams.toString();
      const url = `/properties/properties/${queryString ? `?${queryString}` : ''}`;
      
      if (import.meta.env.DEV) {
        console.log('[API] getAllProperties →', url);
      }
      
      const response = await apiClient.get(url);
      
      // Handle paginated response (common Django REST framework format)
      if (response && response.data) {
        // If response.data has pagination structure (count, next, previous, results)
        if (response.data.results && Array.isArray(response.data.results)) {
          return {
            results: response.data.results,
            count: response.data.count || response.data.results.length,
            next: response.data.next || null,
            previous: response.data.previous || null,
            page: params.page || 1,
            pageSize: params.page_size || response.data.results.length
          };
        }
        // If response.data is an array (non-paginated)
        else if (Array.isArray(response.data)) {
          return {
            results: response.data,
            count: response.data.length,
            next: null,
            previous: null,
            page: 1,
            pageSize: response.data.length
          };
        }
        // If response.data has an items property
        else if (response.data.items && Array.isArray(response.data.items)) {
          return {
            results: response.data.items,
            count: response.data.count || response.data.items.length,
            next: response.data.next || null,
            previous: response.data.previous || null,
            page: params.page || 1,
            pageSize: params.page_size || response.data.items.length
          };
        }
        // If response.data is an object with data property
        else if (response.data.data && Array.isArray(response.data.data)) {
          return {
            results: response.data.data,
            count: response.data.count || response.data.data.length,
            next: response.data.next || null,
            previous: response.data.previous || null,
            page: params.page || 1,
            pageSize: params.page_size || response.data.data.length
          };
        }
        // If response.data is not an array, return empty results
        else {
          console.warn('[API] Unexpected response format for getAllProperties:', response.data);
          return {
            results: [],
            count: 0,
            next: null,
            previous: null,
            page: params.page || 1,
            pageSize: params.page_size || 12
          };
        }
      }
      
      return {
        results: [],
        count: 0,
        next: null,
        previous: null,
        page: params.page || 1,
        pageSize: params.page_size || 12
      };
    } catch (error) {
      const status = error.response?.status;
      const detail =
        (typeof error.response?.data === 'string' && error.response?.data) ||
        error.response?.data?.detail ||
        error.message;
      
      console.error('[API] Failed to get properties:', `(${status || 'no-status'})`, detail);
      
      // Return empty paginated structure for public pages instead of crashing
      const fallback = {
        results: [],
        count: 0,
        next: null,
        previous: null,
        page: params.page || 1,
        pageSize: params.page_size || 12
      };
      
      if (
        status === 404 &&
        typeof detail === 'string' &&
        detail.toLowerCase().includes('page')
      ) {
        fallback.error = 'invalid-page';
      }
      
      return fallback;
    }
  },

  // Get single property by ID
  getPropertyById: async (id) => {
    try {
      const response = await apiClient.get(`/properties/properties/${id}/`);
      return response.data;
    } catch (error) {
      // Return null instead of crashing
      return null;
    }
  },

  // Contact form submission
  submitContactForm: async (contactData) => {
    try {
      const response = await apiClient.post('/properties/contacts/', contactData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get property types with fallback
  getPropertyTypes: async () => {
    try {
      const response = await apiClient.get('/properties/property-types/');
      return response.data;
    } catch (error) {
      console.error('[API] Failed to get property types:', error.message);
      // Return empty array for public pages instead of crashing
      return [];
    }
  },

  // Get locations
  getStates: async () => {
    try {
      const response = await apiClient.get('/properties/states/');
      return response.data;
    } catch (error) {
      console.error('[API] Failed to get states:', error.message);
      // Return empty array for public pages instead of crashing
      return [];
    }
  },

  getDistricts: async (stateId) => {
    try {
      const response = await apiClient.get(`/properties/districts/?state=${stateId}`);
      return response.data;
    } catch (error) {
      console.error('[API] Failed to get districts:', error.message);
      // Return empty array for public pages instead of crashing
      return [];
    }
  },

  getCities: async (districtId) => {
    try {
      const response = await apiClient.get(`/properties/cities/?district=${districtId}`);
      return response.data;
    } catch (error) {
      console.error('[API] Failed to get cities:', error.message);
      // Return empty array for public pages instead of crashing
      return [];
    }
  },

  // Get amenities/features
  getAmenities: async () => {
    try {
      const response = await apiClient.get('/properties/features/');
      return response.data;
    } catch (error) {
      console.error('[API] Failed to get amenities:', error.message);
      // Return empty array for public pages instead of crashing
      return [];
    }
  },

  // Get hero banners
  getHeroBanners: async () => {
    try {
      const response = await apiClient.get('/properties/hero-banners/');
      return response.data;
    } catch (error) {
      console.error('[API] Failed to get hero banners:', error.message);
      // Return empty array for public pages instead of crashing
      return [];
    }
  },

  // Get offer banners
  getOfferBanners: async () => {
    try {
      const response = await apiClient.get('/properties/offer-banners/');
      return response.data;
    } catch (error) {
      console.error('[API] Failed to get offer banners:', error.message);
      // Return empty array for public pages instead of crashing
      return [];
    }
  },

  // Add hero banner
  addHeroBanner: async (formData) => {
    try {
      const response = await apiClient.post('/properties/hero-banners/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add offer banner
  addOfferBanner: async (formData) => {
    try {
      const response = await apiClient.post('/properties/offer-banners/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete hero banner
  deleteHeroBanner: async (id) => {
    try {
      const response = await apiClient.delete(`/properties/hero-banners/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete offer banner
  deleteOfferBanner: async (id) => {
    try {
      const response = await apiClient.delete(`/properties/offer-banners/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Location Management APIs
  createState: async (stateData) => {
    try {
      const response = await apiClient.post('/properties/states/', stateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createDistrict: async (districtData) => {
    try {
      const response = await apiClient.post('/properties/districts/', districtData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createCity: async (cityData) => {
    try {
      const response = await apiClient.post('/properties/cities/', cityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Admin-specific methods (require authentication)
  // Create new feature
  createFeature: async (featureData) => {
    try {
      const response = await apiClient.post('/properties/features/', featureData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update feature
  updateFeature: async (id, featureData) => {
    try {
      const response = await apiClient.patch(`/properties/features/${id}/`, featureData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete feature
  deleteFeature: async (id) => {
    try {
      const response = await apiClient.delete(`/properties/features/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create property type
  createPropertyType: async (propertyTypeData) => {
    try {
      const response = await apiClient.post('/properties/property-types/', propertyTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update property type
  updatePropertyType: async (id, propertyTypeData) => {
    try {
      const response = await apiClient.patch(`/properties/property-types/${id}/`, propertyTypeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete property type
  deletePropertyType: async (id) => {
    try {
      const response = await apiClient.delete(`/properties/property-types/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create property
  createProperty: async (propertyData) => {
    try {
      const response = await apiClient.post('/properties/properties/', propertyData);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              errorMessages.push(`${field}: ${errorData[field].join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errorData[field]}`);
            }
          });
          throw new Error(errorMessages.join('\n'));
        }
        throw new Error(errorData.detail || errorData.message || 'Failed to update property');
      }
      throw new Error('Failed to update property. Please check your connection and try again.');
    }
  },

  // Update property
  updateProperty: async (id, propertyData) => {
    try {
      const response = await apiClient.patch(`/properties/properties/${id}/`, propertyData);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              errorMessages.push(`${field}: ${errorData[field].join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errorData[field]}`);
            }
          });
          throw new Error(errorMessages.join('\n'));
        }
        throw new Error(errorData.detail || errorData.message || 'Failed to update property');
      }
      throw new Error('Failed to update property. Please check your connection and try again.');
    }
  },

  // Delete property
  deleteProperty: async (id) => {
    try {
      const response = await apiClient.delete(`/properties/properties/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new property
  createProperty: async (propertyData) => {
    try {
      const response = await apiClient.post('/properties/properties/', propertyData);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              errorMessages.push(`${field}: ${errorData[field].join(', ')}`);
            } else {
              errorMessages.push(`${field}: ${errorData[field]}`);
            }
          });
          throw new Error(errorMessages.join('\n'));
        }
        throw new Error(errorData.detail || errorData.message || 'Failed to create property');
      }
      throw new Error('Failed to create property. Please check your connection and try again.');
    }
  },

  // Delete property image
  deletePropertyImage: async (propertyId, imageId) => {
    try {
      const response = await apiClient.delete(`/properties/properties/${propertyId}/delete_image/`, {
        data: { image_id: imageId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all contacts (admin only)
  getAllContacts: async () => {
    try {
      const response = await apiClient.get('/properties/contacts/');
      
      // Handle different response formats
      if (response && response.data) {
        // If response.data is an array, return it directly
        if (Array.isArray(response.data)) {
          return response.data;
        }
        // If response.data has a results property (common API pattern)
        else if (response.data.results && Array.isArray(response.data.results)) {
          return response.data.results;
        }
        // If response.data has an items property
        else if (response.data.items && Array.isArray(response.data.items)) {
          return response.data.items;
        }
        // If response.data is an object with data property
        else if (response.data.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        // If response.data is not an array, return empty array
        else {
          console.warn('[API] Unexpected response format for getAllContacts:', response.data);
          return [];
        }
      }
      
      return [];
    } catch (error) {
      console.error('[API] Failed to get contacts:', error.message);
      // Return empty array instead of throwing
      return [];
    }
  },

  // Delete contact (admin only)
  deleteContact: async (id) => {
    try {
      const response = await apiClient.delete(`/properties/contacts/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default apiClient;
