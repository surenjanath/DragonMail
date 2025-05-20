import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useEmail } from '../contexts/EmailContext';

export default function CountdownTimer() {
  const { timeRemaining, account, settings } = useEmail();
  
  // Format the time remaining
  const formattedTime = useMemo(() => {
    const totalSeconds = Math.max(0, Math.ceil(timeRemaining / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, [timeRemaining]);

  // Calculate the percentage of time remaining
  const percentRemaining = useMemo(() => {
    if (!account) return 0;
    
    const totalDuration = settings.expirationMinutes * 60 * 1000;
    return Math.max(0, Math.min(100, (timeRemaining / totalDuration) * 100));
  }, [account, settings.expirationMinutes, timeRemaining]);

  // Determine color based on time remaining
  const timerColor = useMemo(() => {
    if (percentRemaining > 50) return '#34C759'; // Green
    if (percentRemaining > 25) return '#FF9500'; // Orange
    return '#FF3B30'; // Red
  }, [percentRemaining]);

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <View style={styles.timerIconContainer}>
          <Ionicons name="time" size={24} color={timerColor} />
        </View>
        <View style={styles.timerTextContainer}>
          <Text style={[styles.timerText, { color: timerColor }]}>
            {formattedTime}
          </Text>
          <Text style={styles.timerLabel}>remaining</Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBarFill, 
            { 
              width: `${percentRemaining}%`,
              backgroundColor: timerColor,
            }
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 12,
  },
  timerIconContainer: {
    marginRight: 12,
  },
  timerTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#34C759',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  timerLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
});