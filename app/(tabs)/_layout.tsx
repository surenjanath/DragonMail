import CustomTabBar from '@/components/ui/CustomTabBar';
import { useEmail } from '@/contexts/EmailContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

const ICON_SIZE = 26;
const ACTIVE_COLOR = '#4A90E2';
const INACTIVE_COLOR = '#8E8E93';

export default function TabLayout() {
  const { generateEmail } = useEmail();
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} onFabPress={generateEmail} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Mail',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'mail' : 'mail-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'mail-open' : 'mail-open-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved-emails"
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={ICON_SIZE} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
});