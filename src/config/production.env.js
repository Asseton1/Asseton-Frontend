// Production Environment Configuration
export const PRODUCTION_ENV = {
  // API Configuration
  API_BASE_URL: 'https://asseton-api-bqa7a5cgffe2ghga.southindia-01.azurewebsites.net/api/',
  
  // Direct API Configuration (no CORS proxies)
  API_DIRECT: {
    ENABLED: true,
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 2000,
  },
  
  // Performance Configuration
  PERFORMANCE: {
    ENABLE_SERVICE_WORKER: true,
    ENABLE_CACHING: true,
    ENABLE_COMPRESSION: true,
    CACHE_DURATION: 86400000, // 24 hours
  },
  
  // Security Configuration
  SECURITY: {
    ENABLE_HTTPS: true,
    ENABLE_CSP: true,
    ENABLE_HSTS: true,
    SESSION_TIMEOUT: 3600000, // 1 hour
  },
  
  // Monitoring Configuration
  MONITORING: {
    ENABLE_ERROR_TRACKING: true,
    ENABLE_PERFORMANCE_MONITORING: true,
    ENABLE_ANALYTICS: true,
    LOG_LEVEL: 'error', // Only log errors in production
  },
  
  // Retry Configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    INITIAL_DELAY: 2000,
    MAX_DELAY: 10000,
    BACKOFF_MULTIPLIER: 2,
  },
  
  // Timeout Configuration
  TIMEOUTS: {
    API_REQUEST: 30000, // 30 seconds
    LOGIN_REQUEST: 45000, // 45 seconds
    UPLOAD_REQUEST: 120000, // 2 minutes
  }
};

// Production-specific constants
export const PRODUCTION_CONSTANTS = {
  APP_NAME: 'PropertyFinder',
  APP_VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@asseton.in',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 50,
  }
};

// Export default production configuration
export default {
  ...PRODUCTION_ENV,
  ...PRODUCTION_CONSTANTS
};
