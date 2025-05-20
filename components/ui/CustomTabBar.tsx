import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BlurTabBarBackground from './TabBarBackground';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  onFabPress: () => void;
}

const ICONS = [
  { name: 'mail', outline: 'mail-outline', label: 'Mail' },
  { name: 'mail-open', outline: 'mail-open-outline', label: 'Inbox' },
  { name: 'bookmark', outline: 'bookmark-outline', label: 'Saved' },
  { name: 'settings', outline: 'settings-outline', label: 'Settings' },
];

export default function CustomTabBar({ state, descriptors, navigation, onFabPress }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>  
      {Platform.OS === 'ios' ? <BlurTabBarBackground /> : <View style={styles.androidBlur} />}
      {state.routes.map((route: any, idx: number) => {
        // Place FAB in the center
        if (idx === 2) {
          return (
            <React.Fragment key={route.key}>
              <TouchableOpacity
                style={styles.fabContainer}
                onPress={onFabPress}
                activeOpacity={0.85}
              >
                <View style={styles.fabButton}>
                  <Ionicons name="add" size={32} color="#fff" />
                </View>
              </TouchableOpacity>
              {renderTabButton(route, idx, activeIndex, navigation, descriptors)}
            </React.Fragment>
          );
        }
        return renderTabButton(route, idx, activeIndex, navigation, descriptors);
      })}
    </View>
  );
}

function renderTabButton(route: any, idx: number, activeIndex: number, navigation: any, descriptors: any) {
  const { options } = descriptors[route.key];
  const isFocused = activeIndex === idx;
  const iconInfo = ICONS[idx >= 2 ? idx : idx];
  return (
    <TouchableOpacity
      key={route.key}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarTestID}
      onPress={() => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name);
        }
      }}
      style={[styles.tabButton, isFocused && styles.tabButtonActive]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={isFocused ? iconInfo.name : iconInfo.outline}
        size={28}
        color={isFocused ? '#4A90E2' : '#8E8E93'}
      />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{iconInfo.label}</Text>
      {isFocused && <View style={styles.activeDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 70,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.7)',
    overflow: 'visible',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  androidBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  tabButtonActive: {
    // Optionally add a subtle background for active tab
    backgroundColor: 'rgba(74,144,226,0.08)',
    borderRadius: 16,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#4A90E2',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
  },
  fabContainer: {
    position: 'relative',
    top: -28,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
}); 