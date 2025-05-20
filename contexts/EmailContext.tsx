import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import * as emailApi from '../services/emailApi';
import * as storage from '../services/storage';
import {
    Account,
    AppSettings,
    Message,
    MessageResponse,
} from '../types';

interface EmailContextType {
  account: Account | null;
  messages: Message[];
  settings: AppSettings;
  isLoading: boolean;
  selectedMessage: MessageResponse | null;
  timeRemaining: number;
  generateEmail: () => Promise<void>;
  fetchMessages: () => Promise<void>;
  viewMessage: (messageId: string) => Promise<void>;
  clearSelectedMessage: () => void;
  updateSiteUsedFor: (site: string) => Promise<void>;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  clearSession: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  setAccount: (account: Account | null) => void;
}

export const EmailContext = createContext<EmailContextType | undefined>(undefined);

export const EmailProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<Account | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storage.DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageResponse | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [expirationTimeout, setExpirationTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load account and settings on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const savedSettings = await storage.getSettings();
        setSettings(savedSettings);
        
        const savedAccount = await storage.getAccount();
        
        if (savedAccount) {
          // Check if account has expired
          if (savedAccount.expiresAt > Date.now()) {
            setAccount(savedAccount);
            
            // Set current account in emailApi
            emailApi.setCurrentAccount({
              address: savedAccount.address,
              password: savedAccount.password
            });
            
            // Authenticate silently
            try {
              await emailApi.authenticate();
              startExpirationTimer(savedAccount.expiresAt);
            } catch (error) {
              // Silently clear session if authentication fails
              await clearSession();
            }
          } else {
            await clearSession();
          }
        }
      } catch (error) {
        // Silently handle any initialization errors
        await clearSession();
      }
    };
    
    initialize();
    
    return () => {
      if (expirationTimeout) clearTimeout(expirationTimeout);
    };
  }, []);

  // Fetch messages for current account
  const fetchMessages = useCallback(async () => {
    if (!account?.token) return;

    try {
      setIsLoading(true);
      const messages = await emailApi.getMessages();
      setMessages(messages);
    } catch (error) {
      if (error instanceof Error && error.message.includes('no longer exists')) {
        await clearSession();
      }
    } finally {
      setIsLoading(false);
    }
  }, [account?.token]);

  // Start expiration timer
  const startExpirationTimer = (expiresAt: number) => {
    if (expirationTimeout) clearTimeout(expirationTimeout);
    
    // Update time remaining every second
    const updateTimeRemaining = () => {
      const remaining = Math.max(0, expiresAt - Date.now());
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        console.log('Timer expired, clearing session...');
        clearSession();
      } else {
        // Schedule next update in 1 second
        const timeout = setTimeout(updateTimeRemaining, 1000);
        setExpirationTimeout(timeout);
      }
    };
    
    // Start the timer
    updateTimeRemaining();
  };

  // Generate a new email
  const generateEmail = async () => {
    try {
      setIsLoading(true);
      
      if (account) {
        await clearSession();
      }
      
      const newAccount = await emailApi.createAccount();
      
      emailApi.setCurrentAccount({
        address: newAccount.address,
        password: newAccount.password
      });
      
      await emailApi.authenticate();
      
      const authToken = emailApi.getAuthToken();
      if (!authToken) {
        throw new Error('Failed to get authentication token');
      }
      
      const accountData = {
        ...newAccount,
        token: authToken,
        expiresAt: Date.now() + (settings.expirationMinutes * 60 * 1000),
        createdAt: Date.now(),
      };
      
      await storage.saveAccount(accountData);
      setAccount(accountData);
      startExpirationTimer(accountData.expiresAt);
      
    } catch (error) {
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  };

  // View a specific message
  const viewMessage = async (messageId: string) => {
    if (!account?.token) return;
    
    try {
      setIsLoading(true);
      const message = await emailApi.getMessage(messageId);
      setSelectedMessage(message);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Error viewing message:', error);
    }
  };

  // Clear selected message
  const clearSelectedMessage = () => {
    setSelectedMessage(null);
  };

  // Update site used for
  const updateSiteUsedFor = async (site: string) => {
    if (!account) return;
    
    try {
      await storage.updateAccountSite(site);
      setAccount({ ...account, siteUsedFor: site });
    } catch (error) {
      console.error('Error updating site:', error);
    }
  };

  // Update settings
  const updateSettings = async (newSettings: AppSettings) => {
    try {
      await storage.saveSettings(newSettings);
      setSettings(newSettings);
      
      // If we have an active account, update its expiration time
      if (account) {
        const timeElapsed = Date.now() - account.createdAt;
        const newExpirationTime = account.createdAt + (newSettings.expirationMinutes * 60 * 1000);
        
        // Only update if the new expiration time is later than now
        if (newExpirationTime > Date.now()) {
          const updatedAccount = {
            ...account,
            expiresAt: newExpirationTime,
          };
          
          await storage.saveAccount(updatedAccount);
          setAccount(updatedAccount);
          
          // Restart expiration timer
          startExpirationTimer(newExpirationTime);
        }
      }
      
      // Update polling interval if changed
      if (account?.token && pollingInterval) {
        startPolling(account.address);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  // Clear current session
  const clearSession = async () => {
    try {
      if (expirationTimeout) {
        clearTimeout(expirationTimeout);
        setExpirationTimeout(null);
      }
      
      await storage.clearAccount();
      
      setAccount(null);
      setMessages([]);
      setSelectedMessage(null);
      setTimeRemaining(0);
      setIsLoading(false);
      setIsRefreshing(false);
      
      emailApi.clearAuthState();
    } catch (error) {
      // Silently handle any cleanup errors
    }
  };

  const refreshMessages = useCallback(async () => {
    if (!account?.token || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchMessages();
    } finally {
      setIsRefreshing(false);
    }
  }, [account?.token, fetchMessages, isRefreshing]);

  return (
    <EmailContext.Provider
      value={{
        account,
        messages,
        settings,
        isLoading,
        selectedMessage,
        timeRemaining,
        generateEmail,
        fetchMessages,
        viewMessage,
        clearSelectedMessage,
        updateSiteUsedFor,
        updateSettings,
        clearSession,
        refreshMessages,
        setAccount,
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

// Custom hook to use the email context
export const useEmail = () => {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};