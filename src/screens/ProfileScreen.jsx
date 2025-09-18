import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { authHelpers } from '../lib/supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut, getUserName, getUserEmail } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    website: '',
    social_links: {
      instagram: '',
      twitter: '',
      youtube: '',
    },
    notification_settings: {
      email_notifications: true,
      push_notifications: true,
      marketing_emails: false,
    },
  });

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await authHelpers.getUserProfile(user.id);
      
      if (error) {
        Alert.alert('Error', 'Failed to load profile');
        return;
      }
      
      setUserProfile(data);
      setFormData({
        full_name: data?.full_name || '',
        username: data?.username || '',
        bio: data?.bio || '',
        location: data?.location || '',
        website: data?.website || '',
        social_links: {
          instagram: data?.social_links?.instagram || '',
          twitter: data?.social_links?.twitter || '',
          youtube: data?.social_links?.youtube || '',
        },
        notification_settings: {
          email_notifications: data?.notification_settings?.email_notifications !== false,
          push_notifications: data?.notification_settings?.push_notifications !== false,
          marketing_emails: data?.notification_settings?.marketing_emails === true,
        },
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await authHelpers.updateUserProfile(user.id, formData);
      
      if (error) {
        Alert.alert('Error', 'Failed to update profile');
        return;
      }
      
      setEditing(false);
      await loadUserProfile();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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

  const ProfileSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const InputField = ({ label, value, onChangeText, placeholder, multiline = false }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        editable={editing}
      />
    </View>
  );

  const SwitchField = ({ label, value, onValueChange }) => (
    <View style={styles.switchContainer}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
        thumbColor={value ? '#FFFFFF' : '#F3F4F6'}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="person" size={48} color="#8B5CF6" />
          </View>
        </View>
        <Text style={styles.userName}>{getUserName()}</Text>
        <Text style={styles.userEmail}>{getUserEmail()}</Text>
        
        <View style={styles.profileCompletion}>
          <Text style={styles.completionText}>
            Profile {userProfile?.profile_completion_percentage || 0}% complete
          </Text>
          <View style={styles.completionBar}>
            <View 
              style={[
                styles.completionFill, 
                { width: `${userProfile?.profile_completion_percentage || 0}%` }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Edit Button */}
      <View style={styles.editButtonContainer}>
        <TouchableOpacity
          style={[styles.editButton, editing && styles.saveButton]}
          onPress={editing ? handleSave : () => setEditing(true)}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Icon 
                name={editing ? "save" : "edit"} 
                size={20} 
                color="white" 
              />
              <Text style={styles.editButtonText}>
                {editing ? 'Save Changes' : 'Edit Profile'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Basic Information */}
      <ProfileSection title="Basic Information">
        <InputField
          label="Full Name"
          value={formData.full_name}
          onChangeText={(value) => setFormData(prev => ({ ...prev, full_name: value }))}
          placeholder="Enter your full name"
        />
        <InputField
          label="Username"
          value={formData.username}
          onChangeText={(value) => setFormData(prev => ({ ...prev, username: value }))}
          placeholder="Enter your username"
        />
        <InputField
          label="Bio"
          value={formData.bio}
          onChangeText={(value) => setFormData(prev => ({ ...prev, bio: value }))}
          placeholder="Tell us about yourself..."
          multiline
        />
        <InputField
          label="Location"
          value={formData.location}
          onChangeText={(value) => setFormData(prev => ({ ...prev, location: value }))}
          placeholder="Enter your location"
        />
        <InputField
          label="Website"
          value={formData.website}
          onChangeText={(value) => setFormData(prev => ({ ...prev, website: value }))}
          placeholder="Enter your website URL"
        />
      </ProfileSection>

      {/* Social Links */}
      <ProfileSection title="Social Links">
        <InputField
          label="Instagram"
          value={formData.social_links.instagram}
          onChangeText={(value) => setFormData(prev => ({ 
            ...prev, 
            social_links: { ...prev.social_links, instagram: value }
          }))}
          placeholder="@username"
        />
        <InputField
          label="Twitter"
          value={formData.social_links.twitter}
          onChangeText={(value) => setFormData(prev => ({ 
            ...prev, 
            social_links: { ...prev.social_links, twitter: value }
          }))}
          placeholder="@username"
        />
        <InputField
          label="YouTube"
          value={formData.social_links.youtube}
          onChangeText={(value) => setFormData(prev => ({ 
            ...prev, 
            social_links: { ...prev.social_links, youtube: value }
          }))}
          placeholder="Channel URL"
        />
      </ProfileSection>

      {/* Notification Settings */}
      <ProfileSection title="Notification Settings">
        <SwitchField
          label="Email Notifications"
          value={formData.notification_settings.email_notifications}
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            notification_settings: { ...prev.notification_settings, email_notifications: value }
          }))}
        />
        <SwitchField
          label="Push Notifications"
          value={formData.notification_settings.push_notifications}
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            notification_settings: { ...prev.notification_settings, push_notifications: value }
          }))}
        />
        <SwitchField
          label="Marketing Emails"
          value={formData.notification_settings.marketing_emails}
          onValueChange={(value) => setFormData(prev => ({
            ...prev,
            notification_settings: { ...prev.notification_settings, marketing_emails: value }
          }))}
        />
      </ProfileSection>

      {/* Account Actions */}
      <ProfileSection title="Account">
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="security" size={20} color="#6B7280" />
          <Text style={styles.actionButtonText}>Change Password</Text>
          <Icon name="chevron-right" size={20} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="download" size={20} color="#6B7280" />
          <Text style={styles.actionButtonText}>Download Data</Text>
          <Icon name="chevron-right" size={20} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Icon name="help" size={20} color="#6B7280" />
          <Text style={styles.actionButtonText}>Help & Support</Text>
          <Icon name="chevron-right" size={20} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <Icon name="logout" size={20} color="#EF4444" />
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Sign Out</Text>
        </TouchableOpacity>
      </ProfileSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  profileCompletion: {
    width: '100%',
    alignItems: 'center',
  },
  completionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  completionBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  editButtonContainer: {
    padding: 20,
  },
  editButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  logoutButton: {
    borderBottomWidth: 0,
  },
  logoutButtonText: {
    color: '#EF4444',
  },
});

export default ProfileScreen;
