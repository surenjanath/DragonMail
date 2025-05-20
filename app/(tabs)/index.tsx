import CopyableText from '@/components/CopyableText';
import CountdownTimer from '@/components/CountdownTimer';
import Loader from '@/components/Loader';
import SiteInput from '@/components/SiteInput';
import { useEmail } from '@/contexts/EmailContext';
import { deleteEmail, getApiLimits } from '@/services/emailApi';
import { getEmails, initDB, saveEmail } from '@/services/localEmailDb';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface SavedEmail {
  id: string;
  address: string;
  username: string;
  password: string;
  createdAt: number;
  siteUsedFor?: string;
}

interface ApiLimits {
  remaining: number;
  total: number;
  resetTime: number;
}

export default function EmailScreen() {
  const { account, isLoading, generateEmail, setAccount } = useEmail();
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [savedEmails, setSavedEmails] = useState<SavedEmail[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<SavedEmail | null>(null);
  const [apiLimits, setApiLimits] = useState<ApiLimits | null>(null);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const setupDatabase = async () => {
      try {
        console.log('Starting database initialization...');
        await initDB();
        if (isMounted) {
          console.log('Database initialized successfully');
          setIsDbInitialized(true);
          setDbError(null);
          // Load saved emails after initialization
          const emails = await getEmails();
          if (isMounted) {
            setSavedEmails(emails);
          }
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
        if (isMounted) {
          setDbError(error instanceof Error ? error.message : 'Failed to initialize database');
        }
      }
    };
    
    setupDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchApiLimits = async () => {
      try {
        const limits = await getApiLimits();
        setApiLimits(limits);
      } catch (error) {
        console.error('Failed to fetch API limits:', error);
      }
    };

    fetchApiLimits();
  }, []);

  useEffect(() => {
    let cleanupTimer: ReturnType<typeof setTimeout>;

    if (account) {
      // Set up cleanup timer for when the email expires
      cleanupTimer = setTimeout(async () => {
        try {
          // Delete the email from the API
          await deleteEmail(account.address);
          // Clear the account from context
          setAccount(null);
          // Refresh API limits
          const limits = await getApiLimits();
          setApiLimits(limits);
        } catch (error) {
          console.error('Failed to cleanup expired email:', error);
        }
      }, account.expiresAt - Date.now());
    }

    return () => {
      if (cleanupTimer) {
        clearTimeout(cleanupTimer);
      }
    };
  }, [account]);

  const handleSaveEmail = async () => {
    if (!account || isSaving) return;
    
    try {
      setIsSaving(true);
      // Only save the fields needed for SavedEmail
      const savedEmail = {
        id: account.id || Date.now().toString(),
        address: account.address,
        username: account.username || account.address.split('@')[0],
        password: account.password,
        createdAt: account.createdAt,
        siteUsedFor: account.siteUsedFor || '',
      };
      await saveEmail(savedEmail);
      // Refresh saved emails list
      const emails = await getEmails();
      setSavedEmails(emails);
      console.log('Email saved successfully');
    } catch (error) {
      console.error('Failed to save email:', error);
      setDbError(error instanceof Error ? error.message : 'Failed to save email');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEmail = async () => {
    if (!account) return;

    Alert.alert(
      'Delete Email',
      'Are you sure you want to delete this email? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEmail(account.address);
              setAccount(null);
              const limits = await getApiLimits();
              setApiLimits(limits);
            } catch (error) {
              console.error('Failed to delete email:', error);
              // If the email is already deleted or not found, still clear the account
              if (error instanceof Error && error.message.includes('404')) {
                setAccount(null);
                const limits = await getApiLimits();
                setApiLimits(limits);
              } else {
                Alert.alert(
                  'Error',
                  'Failed to delete email. Please try again.',
                  [{ text: 'OK' }]
                );
              }
            }
          },
        },
      ]
    );
  };

  const handleEmailPress = (email: SavedEmail) => {
    setSelectedEmail(email);
  };

  const closeEmailDetails = () => {
    setSelectedEmail(null);
  };

  const navigateToSavedEmails = () => {
    router.push('/saved-emails');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="mail" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>DragonMail</Text>
              <Text style={styles.headerSubtitle}>Secure & Disposable</Text>
            </View>
          </View>
          <View style={styles.headerLine} />
        </View>
      </LinearGradient>
      
      {isLoading && <Loader message="Generating email..." />}
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {account ? (
          <View style={styles.emailInfo}>
            <CountdownTimer />
            
            <View style={styles.card}>
              <View style={styles.emailHeader}>
                <View style={styles.titleContainer}>
                  <Ionicons name="mail" size={20} color="#4A90E2" />
                  <Text style={styles.emailTitle}>Your Email</Text>
                </View>
                <View style={styles.headerLine} />
              </View>
              
              <CopyableText 
                label="Email Address" 
                value={account.address} 
                monospace={true}
              />
              
              <View style={styles.divider} />
              
              <CopyableText 
                label="Username" 
                value={account.address.split('@')[0]} 
                monospace={true}
              />
              
              <View style={styles.divider} />
              
              <CopyableText 
                label="Password" 
                value={account.password} 
                monospace={true}
              />
              
              <View style={styles.divider} />
              
              <SiteInput />
              
              <Text style={styles.disclaimer}>
                This email will self-destruct after the timer expires.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                  onPress={handleSaveEmail}
                  disabled={isSaving}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={isSaving ? "hourglass-outline" : "save-outline"} 
                    size={24} 
                    color="#4A90E2" 
                  />
                  <Text style={styles.saveButtonText}>
                    {isSaving ? 'Saving...' : 'Save Email'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeleteEmail}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                  <Text style={styles.deleteButtonText}>Delete Email</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateEmail}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={24} color="#4A90E2" />
              <Text style={styles.generateButtonText}>Generate New Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.savedEmailsButton}
              onPress={navigateToSavedEmails}
              activeOpacity={0.7}
            >
              <Ionicons name="bookmark" size={24} color="#4A90E2" />
              <Text style={styles.savedEmailsButtonText}>View Saved Emails</Text>
            </TouchableOpacity>

            {apiLimits && (
              <View style={styles.limitsCard}>
                <View style={styles.limitsHeader}>
                  <Ionicons name="analytics" size={20} color="#4A90E2" />
                  <Text style={styles.limitsTitle}>API Usage</Text>
                </View>
                <View style={styles.headerLine} />
                
                <View style={styles.limitsRow}>
                  <Text style={styles.limitsLabel}>Remaining Calls</Text>
                  <Text style={styles.limitsValue}>
                    {apiLimits.remaining} / {apiLimits.total}
                  </Text>
                </View>
                
                <View style={styles.limitsRow}>
                  <Text style={styles.limitsLabel}>Reset Time</Text>
                  <Text style={styles.limitsValue}>
                    {new Date(apiLimits.resetTime).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="mail" size={48} color="#4A90E2" />
            </View>
            
            <Text style={styles.emptyTitle}>
              Generate a Temporary Email
            </Text>
            
            <Text style={styles.emptyDescription}>
              Create a disposable email address that lasts for 5 minutes.
              Perfect for signups and verification links.
            </Text>
            
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateEmail}
              activeOpacity={0.7}
            >
              <Text style={styles.generateButtonText}>Generate Email</Text>
            </TouchableOpacity>

            {apiLimits && (
              <View style={styles.limitsCard}>
                <View style={styles.limitsHeader}>
                  <Ionicons name="analytics" size={20} color="#4A90E2" />
                  <Text style={styles.limitsTitle}>API Usage</Text>
                </View>
                <View style={styles.headerLine} />
                
                <View style={styles.limitsRow}>
                  <Text style={styles.limitsLabel}>Remaining Calls</Text>
                  <Text style={styles.limitsValue}>
                    {apiLimits.remaining} / {apiLimits.total}
                  </Text>
                </View>
                
                <View style={styles.limitsRow}>
                  <Text style={styles.limitsLabel}>Reset Time</Text>
                  <Text style={styles.limitsValue}>
                    {new Date(apiLimits.resetTime).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={selectedEmail !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={closeEmailDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Email Details</Text>
              <TouchableOpacity
                onPress={closeEmailDetails}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#1D1D1F" />
              </TouchableOpacity>
            </View>

            {selectedEmail && (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.detailCard}>
                  <CopyableText
                    label="Email Address"
                    value={selectedEmail.address}
                    monospace={true}
                  />
                  
                  <View style={styles.divider} />
                  
                  <CopyableText
                    label="Username"
                    value={selectedEmail.username}
                    monospace={true}
                  />
                  
                  <View style={styles.divider} />
                  
                  <CopyableText
                    label="Password"
                    value={selectedEmail.password}
                    monospace={true}
                  />
                  
                  <View style={styles.divider} />
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Created At</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedEmail.createdAt).toLocaleString()}
                    </Text>
                  </View>

                  {selectedEmail.siteUsedFor && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Used For</Text>
                        <Text style={styles.detailValue}>
                          {selectedEmail.siteUsedFor}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerLine: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 120,
  },
  emailInfo: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  emailHeader: {
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 20,
  },
  disclaimer: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(74,144,226,0.08)',
  },
  generateButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(74,144,226,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  savedEmailsContainer: {
    marginTop: 24,
  },
  savedEmailsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  savedEmailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  savedEmailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedEmailAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  savedEmailDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  savedEmailSite: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '500',
  },
  savedEmailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(74,144,226,0.08)',
    marginTop: 12,
  },
  savedEmailsButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  limitsCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  limitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  limitsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginLeft: 8,
  },
  limitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  limitsLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  limitsValue: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '500',
  },
});