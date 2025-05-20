import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CopyableTextProps {
  label: string;
  value: string;
  monospace?: boolean;
}

export default function CopyableText({ label, value, monospace = false }: CopyableTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
    
    // Give haptic feedback on mobile
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text 
          style={[
            styles.value, 
            monospace && styles.monospace
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
        
        <TouchableOpacity
          style={styles.copyButton}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={copied ? "checkmark" : "copy"} 
            size={20} 
            color={copied ? '#4CAF50' : '#666'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
  },
  value: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
  },
  monospace: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyButton: {
    padding: 4,
  },
});