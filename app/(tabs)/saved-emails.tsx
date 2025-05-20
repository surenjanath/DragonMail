import { deleteEmail as deleteSavedEmail, getEmails } from '@/services/localEmailDb';
import { SavedEmail } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Alert, Clipboard, Platform, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';

export default function SavedEmailsScreen() {
  const [savedEmails, setSavedEmails] = useState<SavedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Reload emails every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadSavedEmails = async () => {
        try {
          setIsLoading(true);
          const emails = await getEmails();
          if (isActive) setSavedEmails(emails);
        } catch (error) {
          console.error('Failed to load saved emails:', error);
        } finally {
          if (isActive) setIsLoading(false);
        }
      };
      loadSavedEmails();
      return () => { isActive = false; };
    }, [])
  );

  // Function to manually refresh emails
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const emails = await getEmails();
      setSavedEmails(emails);
    } catch (error) {
      console.error('Failed to refresh saved emails:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleDeleteEmail = (email: SavedEmail) => {
    Alert.alert(
      'Delete Saved Email',
      'Are you sure you want to delete this saved email? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSavedEmail(email.id);
              const emails = await getEmails();
              setSavedEmails(emails);
            } catch (error) {
              console.error('Failed to delete saved email:', error);
              Alert.alert('Error', 'Failed to delete saved email. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Export saved emails as JSON file
  const handleExport = async () => {
    try {
      const emails = await getEmails();
      const json = JSON.stringify(emails, null, 2);
      const fileUri = FileSystem.cacheDirectory + 'dragonmail_saved_emails.json';
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Saved Emails',
        UTI: 'public.json',
      });
    } catch (error) {
      console.error('Failed to export saved emails:', error);
      Alert.alert('Export Failed', 'Could not export saved emails.');
    }
  };

  // Copy email address to clipboard with feedback
  const handleCopy = (text: string, label: string = 'Copied!') => {
    Clipboard.setString(text);
    ToastAndroid.show(label, ToastAndroid.SHORT);
  };

  return (
    <View style={styles.screenBackground}>
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
              <Ionicons name="bookmark" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Saved Emails</Text>
              <Text style={styles.headerSubtitle}>Your Collection</Text>
            </View>
            <TouchableOpacity onPress={handleExport} style={styles.exportButton} accessibilityLabel="Export Saved Emails">
              <Ionicons name="download-outline" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerLine} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <Text style={{ textAlign: 'center', marginTop: 32 }}>Loading...</Text>
        ) : savedEmails.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="bookmark" size={48} color="#4A90E2" />
            </View>
            <Text style={styles.emptyTitle}>No Saved Emails</Text>
            <Text style={styles.emptyDescription}>
              Save your temporary emails to access them later.
            </Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => router.push('/')}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color="#4A90E2" />
              <Text style={styles.generateButtonText}>Generate New Email</Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedEmails.map((email, idx) => (
            <View key={email.id} style={styles.emailCard}>
              <View style={styles.siteBar}>
                <Text style={styles.siteBarText}>
                  {email.siteUsedFor && email.siteUsedFor.trim() !== '' ? email.siteUsedFor : 'No Site Specified'}
                </Text>
              </View>
              <View style={styles.emailRow}>
                <Text style={styles.emailAddress}>{email.address}</Text>
                <TouchableOpacity onPress={() => handleCopy(email.address)} style={styles.copyButton} accessibilityLabel="Copy Email Address">
                  <Ionicons name="copy-outline" size={20} color="#4A90E2" />
                </TouchableOpacity>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Username:</Text>
                <Text style={styles.infoValue}>{email.username}</Text>
                <TouchableOpacity onPress={() => handleCopy(email.username, 'Username copied!')} style={styles.copyButtonSmall} accessibilityLabel="Copy Username">
                  <Ionicons name="copy-outline" size={16} color="#4A90E2" />
                </TouchableOpacity>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Password:</Text>
                <Text style={styles.infoValue}>{email.password}</Text>
                <TouchableOpacity onPress={() => handleCopy(email.password, 'Password copied!')} style={styles.copyButtonSmall} accessibilityLabel="Copy Password">
                  <Ionicons name="copy-outline" size={16} color="#4A90E2" />
                </TouchableOpacity>
              </View>
              <Text style={styles.createdAt}>Created: {formatDate(email.createdAt)}</Text>
              <TouchableOpacity onPress={() => handleDeleteEmail(email)} style={styles.deleteButton} accessibilityLabel="Delete Email">
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
              {idx < savedEmails.length - 1 && <View style={styles.cardDivider} />}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenBackground: {
    flex: 1,
    backgroundColor: '#F7F8FA',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    padding: 24,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(74,144,226,0.1)',
    padding: 16,
    borderRadius: 12,
  },
  generateButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  siteBar: {
    backgroundColor: '#E3F0FB',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  siteBarText: {
    color: '#357ABD',
    fontWeight: '700',
    fontSize: 16,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
  },
  copyButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(74,144,226,0.08)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginRight: 6,
  },
  infoValue: {
    fontSize: 14,
    color: '#1D1D1F',
    fontWeight: '600',
  },
  createdAt: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,59,48,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
    marginHorizontal: 8,
    borderRadius: 1,
  },
  exportButton: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(74,144,226,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButtonSmall: {
    marginLeft: 6,
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(74,144,226,0.08)',
  },
}); 