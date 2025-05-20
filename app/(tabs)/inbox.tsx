import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Loader from '../../components/Loader';
import MessageList from '../../components/MessageList';
import MessageViewer from '../../components/MessageViewer';
import { useEmail } from '../../contexts/EmailContext';

export default function InboxScreen() {
  const { account, fetchMessages, isLoading, selectedMessage, messages, timeRemaining, refreshMessages } = useEmail();

  useEffect(() => {
    if (account) {
      fetchMessages();
    }
  }, [account, fetchMessages]);

  // Format time remaining as mm:ss
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Utility to truncate long emails in the middle
  function truncateEmail(email: string, max = 18) {
    if (email.length <= max) return email;
    const [user, domain] = email.split('@');
    if (!domain) return email;
    return user.slice(0, 3) + '...' + user.slice(-2) + '@' + domain;
  }

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
              <Ionicons name="mail-open" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Inbox</Text>
              <Text style={styles.headerSubtitle}>Your Messages</Text>
            </View>
            {account && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshMessages}
                disabled={isLoading}
              >
                <Ionicons 
                  name="refresh" 
                  size={24} 
                  color={isLoading ? 'rgba(255,255,255,0.5)' : '#FFFFFF'} 
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.headerLine} />
        </View>
      </LinearGradient>
      
      {/* Show statistics if account exists */}
      {account && (
        <View style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statIconContainer}>
              <Ionicons name="mail" size={20} color="#4A90E2" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statsLabel}>Email</Text>
              <Text style={[styles.statsValue, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {truncateEmail(account.address)}
              </Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <View style={styles.statIconContainer}>
              <Ionicons name="chatbubble" size={20} color="#4A90E2" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statsLabel}>Messages</Text>
              <Text style={styles.statsValue}>{messages.length}</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statRow}>
            <View style={styles.statIconContainer}>
              <Ionicons name="time" size={20} color="#4A90E2" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statsLabel}>Expires in</Text>
              <Text style={styles.statsValue}>{formatTime(timeRemaining)}</Text>
            </View>
          </View>
        </View>
      )}
      
      {isLoading && !selectedMessage && (
        <View style={styles.loaderContainer}>
          <Loader message="Loading messages..." />
        </View>
      )}
      
      {!account ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📬</Text>
          </View>
          <Text style={styles.emptyTitle}>No Active Email</Text>
          <Text style={styles.emptyDescription}>
            Generate a temporary email to start receiving messages.
          </Text>
        </View>
      ) : (
        <View style={styles.messageListContainer}>
          <MessageList />
        </View>
      )}
      
      {selectedMessage && (
        <View style={styles.viewerContainer}>
          <MessageViewer />
        </View>
      )}
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
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsCard: {
    margin: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(74,144,226,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statsLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  statsValue: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '600',
  },
  statDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyIcon: {
    fontSize: 40,
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
  },
  messageListContainer: {
    flex: 1,
    margin: 24,
  },
  viewerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
});