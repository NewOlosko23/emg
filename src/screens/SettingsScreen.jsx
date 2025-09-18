import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = ({ navigation }) => {
  const { signOut } = useAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoPlay: true,
    dataSaver: false,
    analytics: true,
  });

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, rightComponent }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>
          <Icon name={icon} size={20} color="#6B7280" />
        </View>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || <Icon name="chevron-right" size={20} color="#6B7280" />}
    </TouchableOpacity>
  );

  const SwitchSetting = ({ icon, title, subtitle, value, onValueChange }) => (
    <SettingItem
      icon={icon}
      title={title}
      subtitle={subtitle}
      rightComponent={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
          thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
        />
      }
    />
  );

  return (
    <ScrollView style={styles.container}>
      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        
        <SwitchSetting
          icon="notifications"
          title="Push Notifications"
          subtitle="Receive notifications about your music"
          value={settings.notifications}
          onValueChange={(value) => setSettings(prev => ({ ...prev, notifications: value }))}
        />
        
        <SwitchSetting
          icon="dark-mode"
          title="Dark Mode"
          subtitle="Use dark theme"
          value={settings.darkMode}
          onValueChange={(value) => setSettings(prev => ({ ...prev, darkMode: value }))}
        />
        
        <SwitchSetting
          icon="play-arrow"
          title="Auto Play"
          subtitle="Automatically play previews"
          value={settings.autoPlay}
          onValueChange={(value) => setSettings(prev => ({ ...prev, autoPlay: value }))}
        />
        
        <SwitchSetting
          icon="data-usage"
          title="Data Saver"
          subtitle="Reduce data usage"
          value={settings.dataSaver}
          onValueChange={(value) => setSettings(prev => ({ ...prev, dataSaver: value }))}
        />
        
        <SwitchSetting
          icon="analytics"
          title="Analytics"
          subtitle="Help improve the app"
          value={settings.analytics}
          onValueChange={(value) => setSettings(prev => ({ ...prev, analytics: value }))}
        />
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <SettingItem
          icon="person"
          title="Edit Profile"
          subtitle="Update your personal information"
          onPress={() => navigation.navigate('Profile')}
        />
        
        <SettingItem
          icon="security"
          title="Privacy & Security"
          subtitle="Manage your privacy settings"
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
        />
        
        <SettingItem
          icon="payment"
          title="Billing & Payments"
          subtitle="Manage your subscription"
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
        />
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <SettingItem
          icon="help"
          title="Help Center"
          subtitle="Get help and support"
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
        />
        
        <SettingItem
          icon="feedback"
          title="Send Feedback"
          subtitle="Help us improve the app"
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
        />
        
        <SettingItem
          icon="info"
          title="About"
          subtitle="App version and information"
          onPress={() => Alert.alert('About', 'EMG Music Mobile v1.0.0')}
        />
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        
        <SettingItem
          icon="description"
          title="Terms of Service"
          subtitle="Read our terms and conditions"
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
        />
        
        <SettingItem
          icon="privacy-tip"
          title="Privacy Policy"
          subtitle="How we handle your data"
          onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon')}
        />
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    padding: 20,
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FEF2F2',
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
});

export default SettingsScreen;
