import { API_BASE_URL, API_ENDPOINTS, API_HEADERS } from '../config';

interface ApiLimits {
  remaining: number;
  total: number;
  resetTime: number;
}

interface AuthResponse {
  token: string;
  id: string;
}

interface Message {
  id: string;
  msgid: string;
  from: {
    address: string;
    name: string;
  };
  to: Array<{
    address: string;
    name: string;
  }>;
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  sourceUrl: string;
  createdAt: string;
  updatedAt: string;
  accountId: string;
}

interface MessagesResponse {
  '@context': string;
  '@id': string;
  '@type': string;
  'hydra:member': Message[];
  'hydra:totalItems': number;
}

interface Domain {
  '@id': string;
  '@type': string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
}

interface DomainsResponse {
  '@context': string;
  '@id': string;
  '@type': string;
  'hydra:member': Domain[];
  'hydra:totalItems': number;
}

let authToken: string | null = null;
let currentAccount: { address: string; password: string } | null = null;

const getAuthHeaders = () => ({
  ...API_HEADERS,
  ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
});

const getRandomDomain = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DOMAINS}`);
    if (!response.ok) {
      throw new Error('Failed to fetch domains');
    }
    const data: DomainsResponse = await response.json();
    if (!data['hydra:member'] || data['hydra:member'].length === 0) {
      throw new Error('No domains available');
    }
    // Filter for active domains and get a random one
    const activeDomains = data['hydra:member'].filter(d => d.isActive);
    if (activeDomains.length === 0) {
      throw new Error('No active domains available');
    }
    const randomDomain = activeDomains[Math.floor(Math.random() * activeDomains.length)];
    return randomDomain.domain;
  } catch (error) {
    console.error('Error fetching domain:', error);
    return 'mail.tm'; // Fallback domain
  }
};

const generateRandomEmail = async (): Promise<{ address: string; password: string }> => {
  const domain = await getRandomDomain();
  const username = Math.random().toString(36).slice(-8);
  const password = Math.random().toString(36).slice(-8);
  return {
    address: `${username}@${domain}`,
    password,
  };
};

export const createAccount = async (): Promise<{ address: string; password: string }> => {
  try {
    const account = await generateRandomEmail();
    console.log('\n=== Creating New Email Account ===');
    console.log('Email Address:', account.address);
    console.log('Password:', account.password);
    console.log('================================\n');
    
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CREATE_ACCOUNT}`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({
        address: account.address,
        password: account.password,
        quota: 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to create account:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      if (response.status === 400) {
        throw new Error('Invalid email address or password format');
      } else if (response.status === 409) {
        throw new Error('Email address already exists');
      } else if (response.status === 422) {
        throw new Error('Invalid request data');
      } else {
        throw new Error(errorData.message || `Failed to create account: ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Account created successfully!');
    
    currentAccount = {
      address: account.address,
      password: account.password
    };
    
    await authenticate();
    
    return account;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const authenticate = async (): Promise<void> => {
  try {
    if (!currentAccount) {
      throw new Error('No account available. Please create an account first.');
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH}`, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify({
        address: currentAccount.address,
        password: currentAccount.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 && errorData.message?.includes('no longer exists')) {
        clearAuthState();
        throw new Error('Account expired');
      }
      throw new Error(errorData.message || 'Authentication failed');
    }

    const data: AuthResponse = await response.json();
    authToken = data.token;
  } catch (error) {
    if (error instanceof Error && error.message === 'Account expired') {
      throw error;
    }
    throw new Error('Authentication failed');
  }
};

export const getApiLimits = async (): Promise<ApiLimits> => {
  try {
    if (!authToken) {
      if (!currentAccount) {
        throw new Error('No account available');
      }
      await authenticate();
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_LIMITS}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await authenticate();
        return getApiLimits();
      }
      return {
        remaining: 100,
        total: 100,
        resetTime: Date.now() + 24 * 60 * 60 * 1000,
      };
    }

    const data = await response.json();
    return {
      remaining: data.quota?.remaining || 100,
      total: data.quota?.total || 100,
      resetTime: data.quota?.resetTime || (Date.now() + 24 * 60 * 60 * 1000),
    };
  } catch (error) {
    return {
      remaining: 100,
      total: 100,
      resetTime: Date.now() + 24 * 60 * 60 * 1000,
    };
  }
};

export const getMessages = async (): Promise<Message[]> => {
  try {
    if (!authToken) {
      if (!currentAccount) {
        throw new Error('No account available. Please create an account first.');
      }
      await authenticate();
    }

    console.log('Fetching messages with token:', authToken);
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_MESSAGES}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await authenticate();
        return getMessages();
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch messages');
    }

    const data = await response.json();
    console.log('Raw API Response:', JSON.stringify(data, null, 2));
    
    // Handle both array and hydra response formats
    let messages: Message[];
    if (Array.isArray(data)) {
      messages = data;
    } else if (data['hydra:member']) {
      messages = data['hydra:member'];
    } else {
      messages = [];
    }
    
    console.log('Processed Messages:', JSON.stringify(messages, null, 2));
    
    if (messages.length === 0) {
      console.log('No messages found');
    } else {
      console.log(`Found ${messages.length} messages`);
    }
    
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const getMessage = async (messageId: string): Promise<Message> => {
  try {
    if (!authToken) {
      if (!currentAccount) {
        throw new Error('No account available. Please create an account first.');
      }
      await authenticate();
    }

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_MESSAGE}/${messageId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        await authenticate();
        return getMessage(messageId);
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch message');
    }

    const message: Message = await response.json();
    return message;
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error;
  }
};

export const deleteEmail = async (emailAddress: string, retryCount = 0): Promise<void> => {
  try {
    if (!authToken) {
      if (!currentAccount) {
        throw new Error('No account available. Please create an account first.');
      }
      await authenticate();
    }

    // First get the account ID from the /me endpoint
    const meResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_LIMITS}`, {
      headers: getAuthHeaders(),
    });

    if (!meResponse.ok) {
      if (meResponse.status === 401 && retryCount < 2) {
        // Clear auth token and retry
        authToken = null;
        await authenticate();
        return deleteEmail(emailAddress, retryCount + 1);
      }
      throw new Error('Failed to get account ID');
    }

    const meData = await meResponse.json();
    const accountId = meData.id;

    if (!accountId) {
      throw new Error('Account ID not found');
    }

    // Now delete using the account ID
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DELETE_ACCOUNT}/${accountId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401 && retryCount < 2) {
        // Clear auth token and retry
        authToken = null;
        await authenticate();
        return deleteEmail(emailAddress, retryCount + 1);
      }
      
      const errorData = await response.json().catch(() => ({}));
      console.error('Delete email error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        retryCount,
        emailAddress,
        accountId
      });

      // If the email is already deleted or doesn't exist, consider it a success
      if (response.status === 404) {
        console.log('Email already deleted or not found');
        return;
      }

      throw new Error(errorData.message || `Failed to delete email: ${response.statusText}`);
    }

    console.log('Email account deleted successfully');
  } catch (error) {
    console.error('Error deleting email:', error);
    
    // If we haven't exceeded retry limit and it's not a 404, retry
    if (retryCount < 2 && !(error instanceof Error && error.message.includes('404'))) {
      console.log(`Retrying delete email (attempt ${retryCount + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return deleteEmail(emailAddress, retryCount + 1);
    }
    
    throw error;
  }
};

// Add function to clear auth state
export const clearAuthState = () => {
  authToken = null;
  currentAccount = null;
};

// Add function to set current account
export const setCurrentAccount = (account: { address: string; password: string }) => {
  currentAccount = account;
};

// Add function to get auth token
export const getAuthToken = () => authToken; 