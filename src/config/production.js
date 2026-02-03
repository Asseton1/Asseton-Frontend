// Production Configuration
export const PRODUCTION_CONFIG = {
  // API Settings
  api: {
    baseURL: 'https://asseton-api-bqa7a5cgffe2ghga.southindia-01.azurewebsites.net/api/',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 2000,
  },
  
  // Performance Settings
  performance: {
    enableServiceWorker: true,
    enableCaching: true,
    enableCompression: true,
  },
  
  // Security Settings
  security: {
    enableHTTPS: true,
    enableCSP: true,
    enableHSTS: true,
  },
  
  // Monitoring Settings
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableAnalytics: true,
  }
};

// Production-specific API endpoints
export const PRODUCTION_ENDPOINTS = {
  login: '/accounts/login/',
  forgotPassword: '/accounts/forgot-password/',
  verifyOTP: '/accounts/verify-otp/',
  resetPassword: '/accounts/reset-password/',
  properties: '/properties/properties/',
  contacts: '/properties/contacts/',
  banners: '/properties/hero-banners/',
  features: '/properties/features/',
  propertyTypes: '/properties/property-types/',
  states: '/properties/states/',
  districts: '/properties/districts/',
  cities: '/properties/cities/',
  amenities: '/properties/features/',
};
