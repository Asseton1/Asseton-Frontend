// API Configuration
export const API_CONFIG = {
  // Development environment
  development: {
    baseURL: 'https://asseton-api-bqa7a5cgffe2ghga.southindia-01.azurewebsites.net/api/',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  // Production environment - Direct API calls to backend
  production: {
    baseURL: 'https://asseton-api-bqa7a5cgffe2ghga.southindia-01.azurewebsites.net/api/',
    timeout: 30000, // 30 seconds for production reliability
    retryAttempts: 3,
    retryDelay: 2000,
  },
  
  // Staging environment
  staging: {
    baseURL: 'https://asseton-api-bqa7a5cgffe2ghga.southindia-01.azurewebsites.net/api/',
    timeout: 20000,
    retryAttempts: 3,
    retryDelay: 1500,
  }
};

// Get current environment
export const getCurrentEnvironment = () => {
  if (import.meta.env.DEV) return 'development';
  if (import.meta.env.MODE === 'staging') return 'staging';
  return 'production';
};

// Get API config for current environment
export const getAPIConfig = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env] || API_CONFIG.development;
};

// Log current configuration - Only in development
if (import.meta.env.DEV) {
  console.log('API Config: Environment:', getCurrentEnvironment());
  console.log('API Config: Settings:', getAPIConfig());
}
