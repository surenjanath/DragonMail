import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Animated, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useEmail } from '../contexts/EmailContext';

export default function MessageViewer() {
  const { selectedMessage, closeMessage } = useEmail();
  const [showHtml, setShowHtml] = useState(false);
  const scrollY = new Animated.Value(0);

  if (!selectedMessage) {
    return null;
  }

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${selectedMessage.from.address}`);
  };

  const handleAttachmentPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} style={styles.headerBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
            style={styles.headerGradient}
          >
            <Pressable
              style={styles.closeButton}
              onPress={closeMessage}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={24} color="#007AFF" />
            </Pressable>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {selectedMessage.subject || '(No subject)'}
            </Text>
            {selectedMessage.html && (
              <Pressable
                style={styles.viewToggle}
                onPress={() => setShowHtml(!showHtml)}
              >
                <Ionicons 
                  name={showHtml ? "document-text" : "globe"} 
                  size={24} 
                  color="#007AFF" 
                />
              </Pressable>
            )}
          </LinearGradient>
        </BlurView>
      </Animated.View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.messageHeader}>
          <Pressable 
            style={styles.senderInfo}
            onPress={handleEmailPress}
          >
            <Text style={styles.senderName}>
              {selectedMessage.from.name || selectedMessage.from.address}
            </Text>
            <Text style={styles.senderEmail}>
              {selectedMessage.from.address}
            </Text>
          </Pressable>
          <Text style={styles.time}>
            {dayjs(selectedMessage.createdAt).format('MMM D, YYYY h:mm A')}
          </Text>
        </View>

        <View style={styles.divider} />

        {selectedMessage.hasAttachments && (
          <View style={styles.attachmentsContainer}>
            <Text style={styles.attachmentsTitle}>Attachments</Text>
            <Pressable
              style={styles.attachmentButton}
              onPress={() => handleAttachmentPress(selectedMessage.downloadUrl)}
            >
              <Ionicons name="download" size={20} color="#007AFF" />
              <Text style={styles.attachmentText}>Download</Text>
            </Pressable>
          </View>
        )}

        <LinearGradient
          colors={['#FFFFFF', '#F8F8F8']}
          style={styles.messageBody}
        >
          {showHtml && selectedMessage.html ? (
            <WebView
              source={{ html: selectedMessage.html }}
              style={styles.webview}
              scrollEnabled={false}
              originWhitelist={['*']}
            />
          ) : (
            <Text style={styles.messageText}>
              {selectedMessage.text || selectedMessage.intro || '(No content)'}
            </Text>
          )}
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  headerBlur: {
    flex: 1,
  },
  headerGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  closeButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1D1D1F',
    flex: 1,
  },
  viewToggle: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 88 : 64,
  },
  messageHeader: {
    marginBottom: 16,
  },
  senderInfo: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
  senderName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  senderEmail: {
    fontSize: 15,
    color: '#8E8E93',
  },
  time: {
    fontSize: 14,
    color: '#8E8E93',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
  },
  attachmentsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
  },
  attachmentsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  attachmentText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  messageBody: {
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1D1D1F',
  },
  webview: {
    flex: 1,
    minHeight: 300,
  },
});