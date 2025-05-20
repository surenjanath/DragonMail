import axios from 'axios';
import {
    Account,
    MessageResponse,
    MessagesResponse,
    TokenResponse,
} from '../types';

const API_URL = 'https://api.mail.tm';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for rate limiting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If we get a 429 (Too Many Requests) and haven't retried yet
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      // Retry the request
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// Generate a random string for username, email, and password
const generateRandomString = (length: number) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Create a new temporary email account
 */
export const createAccount = async (): Promise<Account> => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const username = generateRandomString(10);
      const password = generateRandomString(12);
      const domain = await getRandomDomain();
      const address = `${username}@${domain}`;

      // Register the account
      const registerResponse = await api.post('/accounts', {
        address,
        password,
      });

      // Get auth token
      const loginResponse = await api.post<TokenResponse>('/token', {
        address,
        password,
      });

      // Return the account info
      return {
        id: registerResponse.data.id,
        address,
        password,
        username,
        token: loginResponse.data.token,
        siteUsedFor: '',
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes by default
      };
    } catch (error: any) {
      retries++;
      if (retries === MAX_RETRIES) {
        console.error('Error creating account:', error?.response?.data || error?.message);
        throw new Error('Failed to create temporary email account');
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  throw new Error('Failed to create temporary email account after multiple retries');
};

/**
 * Get a random available domain from Mail.tm
 */
export const getRandomDomain = async (): Promise<string> => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const response = await api.get('/domains');
      const domains = response.data['hydra:member'];
      
      if (domains.length === 0) {
        throw new Error('No available domains');
      }
      
      const randomIndex = Math.floor(Math.random() * domains.length);
      return domains[randomIndex].domain;
    } catch (error: any) {
      retries++;
      if (retries === MAX_RETRIES) {
        console.error('Error getting domains:', error?.response?.data || error?.message);
        return 'mail.tm'; // Fallback domain
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  return 'mail.tm'; // Fallback domain
};

/**
 * Get messages for an account
 */
export const getMessages = async (token: string): Promise<MessagesResponse> => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const response = await api.get<MessagesResponse>('/messages', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure we have the correct response structure
      return {
        hydraTotalItems: response.data.hydraTotalItems || 0,
        hydraMember: Array.isArray(response.data.hydraMember) ? response.data.hydraMember : [],
      };
    } catch (error: any) {
      retries++;
      if (retries === MAX_RETRIES) {
        console.error('Error getting messages:', error?.response?.data || error?.message);
        // Return empty response instead of throwing
        return {
          hydraTotalItems: 0,
          hydraMember: [],
        };
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  return {
    hydraTotalItems: 0,
    hydraMember: [],
  };
};

/**
 * Get a specific message by ID
 */
export const getMessage = async (token: string, messageId: string): Promise<MessageResponse> => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      const response = await api.get<MessageResponse>(`/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      retries++;
      if (retries === MAX_RETRIES) {
        console.error(`Error getting message ${messageId}:`, error?.response?.data || error?.message);
        throw new Error('Failed to get message details');
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  throw new Error('Failed to get message details after multiple retries');
};

/**
 * Delete the account when done
 */
export const deleteAccount = async (token: string, accountId: string): Promise<boolean> => {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      await api.delete(`/accounts/${accountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error: any) {
      retries++;
      if (retries === MAX_RETRIES) {
        console.error('Error deleting account:', error?.response?.data || error?.message);
        return false;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  
  return false;
};