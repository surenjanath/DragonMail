import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, AppSettings } from '../types';

// Storage keys
const ACCOUNT_KEY = 'dragonmail_account';
const SETTINGS_KEY = 'dragonmail_settings';

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  expirationMinutes: 5,
  pollingIntervalSeconds: 10,
};

/**
 * Save account to storage
 */
export const saveAccount = async (account: Account): Promise<void> => {
  try {
    await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch (error) {
    console.error('Error saving account:', error);
  }
};

/**
 * Get account from storage
 */
export const getAccount = async (): Promise<Account | null> => {
  try {
    const accountJson = await AsyncStorage.getItem(ACCOUNT_KEY);
    if (accountJson) {
      return JSON.parse(accountJson);
    }
    return null;
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
};

/**
 * Update account site used field
 */
export const updateAccountSite = async (siteUsedFor: string): Promise<void> => {
  try {
    const account = await getAccount();
    if (account) {
      account.siteUsedFor = siteUsedFor;
      await saveAccount(account);
    }
  } catch (error) {
    console.error('Error updating account site:', error);
  }
};

/**
 * Clear account from storage
 */
export const clearAccount = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ACCOUNT_KEY);
  } catch (error) {
    console.error('Error clearing account:', error);
  }
};

/**
 * Save settings to storage
 */
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

/**
 * Get settings from storage
 */
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
};