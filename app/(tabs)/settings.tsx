import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Constants from 'expo-constants';
import { useState } from 'react';
import { Linking, ScrollView, StatusBar, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { useEmail } from '../../contexts/EmailContext';

export default function SettingsScreen() {
  const { settings, updateSettings } = useEmail();
  const [expirationMinutes, setExpirationMinutes] = useState(settings.expirationMinutes);
  const [pollingSeconds, setPollingSeconds] = useState(settings.pollingIntervalSeconds);

  const handleSaveSettings = async () => {
    await updateSettings({ expirationMinutes, pollingIntervalSeconds: pollingSeconds });
    ToastAndroid.show('Settings saved!', ToastAndroid.SHORT);
  };

  const handleResetDefaults = async () => {
    setExpirationMinutes(5);
    setPollingSeconds(10);
    await updateSettings({ expirationMinutes: 5, pollingIntervalSeconds: 10 });
    ToastAndroid.show('Settings reset to defaults!', ToastAndroid.SHORT);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Ionicons name="settings-outline" size={28} color="#4A90E2" />
          <Text style={styles.header}>Settings</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingHeader}>
              <Ionicons name="time-outline" size={20} color="#4A90E2" />
              <Text style={styles.settingLabel}>Email Expiration</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={expirationMinutes}
              onValueChange={setExpirationMinutes}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="#E5E5EA"
              thumbTintColor="#4A90E2"
            />
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{expirationMinutes} min</Text>
              <Text style={styles.helperText}>How long each temporary email lasts before self-destructing</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingHeader}>
              <Ionicons name="refresh-outline" size={20} color="#4A90E2" />
              <Text style={styles.settingLabel}>Polling Interval</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={30}
              step={5}
              value={pollingSeconds}
              onValueChange={setPollingSeconds}
              minimumTrackTintColor="#4A90E2"
              maximumTrackTintColor="#E5E5EA"
              thumbTintColor="#4A90E2"
            />
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{pollingSeconds} sec</Text>
              <Text style={styles.helperText}>How often DragonMail checks for new messages</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]} 
            onPress={handleSaveSettings} 
            activeOpacity={0.8}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.resetButton]} 
            onPress={handleResetDefaults} 
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <Text style={styles.buttonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <Ionicons name="information-circle-outline" size={24} color="#4A90E2" />
            <Text style={styles.aboutTitle}>About DragonMail</Text>
          </View>
          <Text style={styles.version}>Version {Constants.expoConfig?.version || '1.0.0'}</Text>
          <Text style={styles.aboutText}>
            DragonMail creates temporary email addresses that self-destruct after the set time. 
            No data is stored on our servers, and all information is kept locally on your device.
          </Text>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Created by InsightFusion Tech</Text>
            <View style={styles.socialLinksContainer}>
              <View style={styles.socialLinksRow}>
                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://www.linkedin.com/in/surenjanath/')}
                  style={styles.socialLink}
                >
                  <Ionicons name="logo-linkedin" size={20} color="#4A90E2" />
                  <Text style={styles.socialLinkText}>LinkedIn</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://www.facebook.com/InsightFusion.Tech/')}
                  style={styles.socialLink}
                >
                  <Ionicons name="logo-facebook" size={20} color="#4A90E2" />
                  <Text style={styles.socialLinkText}>Facebook</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.socialLinksRow}>
                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://www.buymeacoffee.com/surenjanath')}
                  style={[styles.socialLink, styles.supportLink]}
                >
                  <Ionicons name="cafe" size={20} color="#FFDD00" />
                  <Text style={[styles.socialLinkText, styles.supportLinkText]}>Buy Me a Coffee</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => Linking.openURL('https://www.fiverr.com/surenjanath/webscrape-any-website-for-you-at-a-price#')}
                  style={[styles.socialLink, styles.supportLink]}
                >
                  <Ionicons name="briefcase" size={20} color="#00B22D" />
                  <Text style={[styles.socialLinkText, styles.supportLinkText]}>Hire on Fiverr</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#232946',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#232946',
    fontWeight: '600',
    marginLeft: 8,
  },
  settingValueContainer: {
    marginTop: 8,
  },
  settingValue: {
    fontSize: 15,
    color: '#4A90E2',
    fontWeight: '700',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  resetButton: {
    backgroundColor: '#395886',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#232946',
    marginLeft: 8,
  },
  version: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#232946',
    lineHeight: 20,
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  socialLinksContainer: {
    gap: 16,
  },
  socialLinksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  supportLink: {
    backgroundColor: 'rgba(255, 221, 0, 0.1)',
  },
  socialLinkText: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 8,
    fontWeight: '600',
  },
  supportLinkText: {
    color: '#232946',
  },
});