import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEmail } from '../contexts/EmailContext';

export default function SiteInput() {
  const { account, updateSiteUsedFor } = useEmail();
  const [site, setSite] = useState(account?.siteUsedFor || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateSiteUsedFor(site);
    setIsSaving(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Site Used For</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={site}
          onChangeText={setSite}
          placeholder="Enter site or app name"
          placeholderTextColor="#A9A9A9"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Ionicons name="save" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1D1D1F',
  },
  saveButton: {
    padding: 8,
  },
});