import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useEmail } from '../contexts/EmailContext';
import { getMessage } from '../services/emailApi';

// Initialize dayjs plugins
dayjs.extend(relativeTime);

// Create animated FlatList
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface Message {
  id: string;
  from: {
    address: string;
    name: string;
  };
  subject: string;
  intro: string;
  text?: string;
  html?: string;
  createdAt: string;
  seen: boolean;
}

export default function MessageList() {
  const { messages, refreshMessages, isLoading } = useEmail();
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleMessagePress = async (messageId: string) => {
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null);
      setSelectedMessage(null);
      return;
    }

    setSelectedMessageId(messageId);
    setIsLoadingMessage(true);
    try {
      const fullMessage = await getMessage(messageId);
      setSelectedMessage(fullMessage);
    } catch (error) {
      console.error('Error fetching message:', error);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="mail-open" size={48} color="#007AFF" />
        </View>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>
          Pull down to refresh
        </Text>
      </View>
    );
  }

  const renderMessageItem = ({ item, index }) => (
    <View style={styles.messageContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.messageItem,
          pressed && styles.messageItemPressed
        ]}
        onPress={() => handleMessagePress(item.id)}
        android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
      >
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <View style={styles.senderContainer}>
              <Text style={styles.sender} numberOfLines={1}>
                {item.from.name || item.from.address}
              </Text>
              <Text style={styles.time}>
                {dayjs(item.createdAt).fromNow()}
              </Text>
            </View>
            <Ionicons 
              name={selectedMessageId === item.id ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#8E8E93" 
            />
          </View>
          
          <Text style={styles.subject} numberOfLines={1}>
            {item.subject || '(No subject)'}
          </Text>
          
          <Text style={styles.preview}>
            {item.intro || '(No content)'}
          </Text>
        </View>
      </Pressable>

      {selectedMessageId === item.id && (
        <View style={styles.detailsCard}>
          {isLoadingMessage ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : selectedMessage ? (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>From</Text>
                <Text style={styles.detailValue}>
                  {selectedMessage.from.name || selectedMessage.from.address}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subject</Text>
                <Text style={styles.detailValue}>
                  {selectedMessage.subject || '(No subject)'}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {dayjs(selectedMessage.createdAt).format('MMMM D, YYYY h:mm A')}
                </Text>
              </View>

              <View style={styles.divider} />
              
              <Text style={styles.messageContent}>
                {selectedMessage.text || selectedMessage.html || selectedMessage.intro || '(No content)'}
              </Text>
            </>
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <AnimatedFlatList
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderMessageItem}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refreshMessages}
          tintColor="#007AFF"
          colors={['#007AFF']}
          progressBackgroundColor="#FFFFFF"
          progressViewOffset={Platform.OS === 'android' ? 20 : 0}
        />
      }
      scrollEnabled={true}
      bounces={true}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
  messageContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  messageItem: {
    padding: 16,
  },
  messageItemPressed: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  messageContent: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#1D1D1F',
    paddingVertical: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  senderContainer: {
    flex: 1,
    marginRight: 8,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: '#8E8E93',
  },
  subject: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  preview: {
    fontSize: 15,
    color: '#8E8E93',
    lineHeight: 22,
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  detailsCard: {
    backgroundColor: '#F8F8F8',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#1D1D1F',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,122,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  loader: {
    padding: 20,
  },
});