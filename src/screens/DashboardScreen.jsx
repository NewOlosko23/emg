import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { dbHelpers, authHelpers } from '../lib/supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DashboardScreen = ({ navigation }) => {
  const { user, getUserName } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalTracks: 0,
    totalPlays: 0,
    totalEarnings: 0,
    recentActivity: [],
  });

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const { data: profile } = await authHelpers.getUserProfile(user.id);
      setUserProfile(profile);

      // Load user tracks
      const { data: tracks } = await dbHelpers.getUserTracks(user.id);
      const totalTracks = tracks?.length || 0;

      // Calculate total plays
      const totalPlays = tracks?.reduce((sum, track) => sum + (track.play_count || 0), 0) || 0;

      // Load earnings
      const { data: earnings } = await dbHelpers.getUserEarnings(user.id);
      const totalEarnings = earnings?.reduce((sum, earning) => sum + (earning.revenue_amount || 0), 0) || 0;

      // Get recent activity (recent tracks)
      const recentActivity = tracks?.slice(0, 5) || [];

      setDashboardData({
        totalTracks,
        totalPlays,
        totalEarnings,
        recentActivity,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={[styles.statCard, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const QuickActionButton = ({ title, icon, onPress, color = '#8B5CF6' }) => (
    <TouchableOpacity style={[styles.quickActionButton, { borderColor: color }]} onPress={onPress}>
      <Icon name={icon} size={20} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{getUserName()}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Icon name="person" size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Tracks"
          value={dashboardData.totalTracks}
          icon="music-note"
          color="#8B5CF6"
          onPress={() => navigation.navigate('MyMusic')}
        />
        <StatCard
          title="Total Plays"
          value={dashboardData.totalPlays.toLocaleString()}
          icon="play-arrow"
          color="#10B981"
          onPress={() => navigation.navigate('Analytics')}
        />
        <StatCard
          title="Total Earnings"
          value={`$${dashboardData.totalEarnings.toFixed(2)}`}
          icon="attach-money"
          color="#F59E0B"
          onPress={() => navigation.navigate('Analytics')}
        />
        <StatCard
          title="Profile Complete"
          value={`${userProfile?.profile_completion_percentage || 0}%`}
          icon="check-circle"
          color="#EF4444"
          onPress={() => navigation.navigate('Profile')}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            title="Upload Music"
            icon="cloud-upload"
            onPress={() => navigation.navigate('Upload')}
          />
          <QuickActionButton
            title="View Analytics"
            icon="analytics"
            onPress={() => navigation.navigate('Analytics')}
            color="#10B981"
          />
          <QuickActionButton
            title="My Music"
            icon="library-music"
            onPress={() => navigation.navigate('MyMusic')}
            color="#F59E0B"
          />
          <QuickActionButton
            title="Settings"
            icon="settings"
            onPress={() => navigation.navigate('Profile')}
            color="#6B7280"
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentActivityContainer}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {dashboardData.recentActivity.length > 0 ? (
          dashboardData.recentActivity.map((track, index) => (
            <View key={track.id || index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon name="music-note" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{track.title}</Text>
                <Text style={styles.activitySubtitle}>
                  {track.approval_status === 'approved' ? 'Approved' : 'Pending approval'} • {track.play_count || 0} plays
                </Text>
              </View>
              <Text style={styles.activityTime}>
                {new Date(track.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="music-note" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No tracks yet</Text>
            <Text style={styles.emptyStateSubtext}>Upload your first track to get started</Text>
            <TouchableOpacity
              style={styles.uploadFirstButton}
              onPress={() => navigation.navigate('Upload')}
            >
              <Text style={styles.uploadFirstButtonText}>Upload Music</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Profile Completion Banner */}
      {userProfile && userProfile.profile_completion_percentage < 80 && (
        <View style={styles.profileBanner}>
          <View style={styles.bannerContent}>
            <Icon name="info" size={20} color="#F59E0B" />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Complete Your Profile</Text>
              <Text style={styles.bannerSubtitle}>
                {userProfile.profile_completion_percentage}% complete
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.bannerButtonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  statsContainer: {
    padding: 20,
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  quickActionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  recentActivityContainer: {
    padding: 20,
    paddingTop: 0,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadFirstButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 16,
  },
  uploadFirstButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#B45309',
    marginTop: 2,
  },
  bannerButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bannerButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreen;
