import AsyncStorage from '@react-native-async-storage/async-storage';
import { SavedEmail } from '../types';

const EMAILS_STORAGE_KEY = '@dragonmail_emails';

export const saveEmail = async (email: SavedEmail) => {
  try {
    const existingData = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
    const emails: SavedEmail[] = existingData ? JSON.parse(existingData) : [];
    emails.unshift(email); // Add new email to the start
    await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(emails));
  } catch (error) {
    console.error('Error saving email:', error);
    throw error;
  }
};

export const getEmails = async (): Promise<SavedEmail[]> => {
  try {
    const data = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting emails:', error);
    throw error;
  }
};

export const deleteEmail = async (id: string) => {
  try {
    const existingData = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
    let emails: SavedEmail[] = existingData ? JSON.parse(existingData) : [];
    emails = emails.filter(email => email.id !== id);
    await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(emails));
  } catch (error) {
    console.error('Error deleting email:', error);
    throw error;
  }
};

export const initDB = async () => {
  // No-op for AsyncStorage, but keep for compatibility
  return Promise.resolve();
};

export async function initDBAsync() {
  try {
    console.log('Initializing storage...');
    // Check if we have any existing data
    const existingData = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
    if (!existingData) {
      // Initialize with empty array if no data exists
      await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify([]));
    }
    console.log('Storage initialization completed successfully');
  } catch (error) {
    console.error('Storage initialization error:', error);
    throw error;
  }
}

export async function saveEmailAsync({ address, username, password }) {
  try {
    const existingData = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
    const emails: SavedEmail[] = existingData ? JSON.parse(existingData) : [];
    
    const newEmail: SavedEmail = {
      id: Date.now().toString(),
      address,
      username,
      password,
      createdAt: Date.now(),
      siteUsedFor: ''
    };
    
    emails.push(newEmail);
    await AsyncStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(emails));
    console.log('Email saved successfully');
  } catch (error) {
    console.error('Error saving email:', error);
    throw error;
  }
}

export async function getEmailsAsync(): Promise<SavedEmail[]> {
  try {
    const data = await AsyncStorage.getItem(EMAILS_STORAGE_KEY);
    const emails: SavedEmail[] = data ? JSON.parse(data) : [];
    console.log('Emails retrieved successfully');
    return emails.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting emails:', error);
    throw error;
  }
} 