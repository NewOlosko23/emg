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
import { dbHelpers } from '../../lib/supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AdminDashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalTracks: 0,
    pendingTracks: 0,
    totalEarnings: 0,
    recentUsers: [],
    pendingApprovals: [],
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load all users
      const { data: users } = await dbHelpers.getAllUsers();
      
      // Load all tracks
      const { data: tracks } = await dbHelpers.getAllTracks();
      
      // Load pending tracks
      const { data: pendingTracks } = await dbHelpers.getPendingTracks();
      
      // Load total earnings
      const { data: totalEarnings } = await dbHelpers.getTotalEarnings();
      
      // Get recent users (last 5)
      const recentUsers = users?.slice(0, 5) || [];
      
      // Get pending approvals (last 5)
      const pendingApprovals = pendingTracks?.slice(0, 5) || [];

      setAdminData({
        totalUsers: users?.length || 0,
        totalTracks: tracks?.length || 0,
        pendingTracks: pendingTracks?.length || 0,
        totalEarnings: totalEarnings?.total || 0,
        recentUsers,
        pendingApprovals,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const handleApproveTrack = async (trackId) => {
    try {
      const { error } = await dbHelpers.updateTrackApproval(trackId, 'approved');
      if (error) {
        Alert.alert('Error', 'Failed to approve track');
        return;
      }
      await loadAdminData();
      Alert.alert('Success', 'Track approved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve track');
    }
  };

  const handleRejectTrack = async (trackId) => {
    Alert.prompt(
      'Reject Track',
      'Please provide a reason for rejection:',
      async (reason) => {
        if (!reason) return;
        
        try {
          const { error } = await dbHelpers.updateTrackApproval(trackId, 'rejected', reason);
          if (error) {
            Alert.alert('Error', 'Failed to reject track');
            return;
          }
          await loadAdminData();
          Alert.alert('Success', 'Track rejected successfully');
        } catch (error) {
          Alert.alert('Error', 'Failed to reject track');
        }
      }
    );
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

  const QuickActionButton = ({ title, icon, onPress, color = '#DC2626' }) => (
    <TouchableOpacity style={[styles.quickActionButton, { borderColor: color }]} onPress={onPress}>
      <Icon name={icon} size={20} color={color} />
      <Text style={[styles.quickActionText, { color }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your platform</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Users"
          value={adminData.totalUsers}
          icon="people"
          color="#DC2626"
        />
        <StatCard
          title="Total Tracks"
          value={adminData.totalTracks}
          icon="music-note"
          color="#8B5CF6"
        />
        <StatCard
          title="Pending Tracks"
          value={adminData.pendingTracks}
          icon="pending"
          color="#F59E0B"
        />
        <StatCard
          title="Total Earnings"
          value={`$${adminData.totalEarnings.toFixed(2)}`}
          icon="attach-money"
          color="#10B981"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickActionButton
            title="Manage Users"
            icon="people"
            onPress={() => navigation.navigate('UserManagement')}
          />
          <QuickActionButton
            title="Content Review"
            icon="content-copy"
            onPress={() => navigation.navigate('ContentModeration')}
            color="#F59E0B"
          />
          <QuickActionButton
            title="Analytics"
            icon="analytics"
            onPress={() => navigation.navigate('Analytics')}
            color="#10B981"
          />
          <QuickActionButton
            title="Settings"
            icon="settings"
            onPress={() => navigation.navigate('Settings')}
            color="#6B7280"
          />
        </View>
      </View>

      {/* Pending Approvals */}
      <View style={styles.pendingContainer}>
        <Text style={styles.sectionTitle}>Pending Approvals</Text>
        {adminData.pendingApprovals.length > 0 ? (
          adminData.pendingApprovals.map((track) => (
            <View key={track.id} style={styles.pendingItem}>
              <View style={styles.pendingInfo}>
                <Text style={styles.pendingTitle}>{track.title}</Text>
                <Text style={styles.pendingArtist}>
                  by {track.profiles_emg?.full_name || track.profiles_emg?.username || 'Unknown Artist'}
                </Text>
                <Text style={styles.pendingGenre}>{track.genre}</Text>
              </View>
              <View style={styles.pendingActions}>
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => handleApproveTrack(track.id)}
                >
                  <Icon name="check" size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleRejectTrack(track.id)}
                >
                  <Icon name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="check-circle" size={48} color="#10B981" />
            <Text style={styles.emptyStateText}>No pending approvals</Text>
            <Text style={styles.emptyStateSubtext}>All tracks are up to date</Text>
          </View>
        )}
      </View>

      {/* Recent Users */}
      <View style={styles.recentUsersContainer}>
        <Text style={styles.sectionTitle}>Recent Users</Text>
        {adminData.recentUsers.length > 0 ? (
          adminData.recentUsers.map((user) => (
            <View key={user.id} style={styles.userItem}>
              <View style={styles.userAvatar}>
                <Icon name="person" size={20} color="#6B7280" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {user.full_name || user.username || 'Unknown User'}
                </Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userRole}>
                  {user.role} • {user.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <Text style={styles.userDate}>
                {new Date(user.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="people" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No users yet</Text>
          </View>
        )}
      </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
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
  pendingContainer: {
    padding: 20,
    paddingTop: 0,
  },
  pendingItem: {
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
  pendingInfo: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pendingArtist: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  pendingGenre: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10B981',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentUsersContainer: {
    padding: 20,
    paddingTop: 0,
  },
  userItem: {
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
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  userDate: {
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
});

export default AdminDashboardScreen;
