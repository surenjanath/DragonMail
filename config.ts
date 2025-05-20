// API Configuration
export const API_BASE_URL = 'https://api.mail.tm';

// Default Settings
export const DEFAULT_SETTINGS = {
  expirationMinutes: 10,
  pollingIntervalSeconds: 10,
};

// API Endpoints
export const API_ENDPOINTS = {
  CREATE_ACCOUNT: '/accounts',
  GET_MESSAGES: '/messages',
  GET_MESSAGE: '/messages',
  DELETE_ACCOUNT: '/accounts',
  GET_LIMITS: '/me',
  AUTH: '/token',
  DOMAINS: '/domains',
};

// API Headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
}; 