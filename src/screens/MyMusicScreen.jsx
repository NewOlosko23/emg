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
  TextInput,
  Modal,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { dbHelpers } from '../lib/supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MyMusicScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTracks();
    }
  }, [user?.id]);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const { data, error } = await dbHelpers.getUserTracks(user.id);
      
      if (error) {
        Alert.alert('Error', 'Failed to load tracks');
        return;
      }
      
      setTracks(data || []);
    } catch (error) {
      console.error('Error loading tracks:', error);
      Alert.alert('Error', 'Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTracks();
    setRefreshing(false);
  };

  const filteredTracks = tracks.filter(track =>
    track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteTrack = async (trackId) => {
    Alert.alert(
      'Delete Track',
      'Are you sure you want to delete this track?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await dbHelpers.deleteTrack(trackId);
              if (error) {
                Alert.alert('Error', 'Failed to delete track');
                return;
              }
              await loadTracks();
              setShowTrackModal(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete track');
            }
          },
        },
      ]
    );
  };

  const TrackCard = ({ track }) => (
    <TouchableOpacity
      style={styles.trackCard}
      onPress={() => {
        setSelectedTrack(track);
        setShowTrackModal(true);
      }}
    >
      <View style={styles.trackInfo}>
        <View style={styles.trackIcon}>
          <Icon name="music-note" size={24} color="#8B5CF6" />
        </View>
        <View style={styles.trackDetails}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackGenre}>{track.genre}</Text>
          <View style={styles.trackStats}>
            <Text style={styles.trackStat}>
              <Icon name="play-arrow" size={14} color="#6B7280" /> {track.play_count || 0}
            </Text>
            <Text style={styles.trackStat}>
              <Icon name="schedule" size={14} color="#6B7280" /> {track.duration || '0:00'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.trackStatus}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: track.approval_status === 'approved' ? '#10B981' : '#F59E0B' }
        ]}>
          <Text style={styles.statusText}>
            {track.approval_status === 'approved' ? 'Approved' : 'Pending'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const TrackModal = () => (
    <Modal
      visible={showTrackModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Track Details</Text>
          <TouchableOpacity onPress={() => setShowTrackModal(false)}>
            <Icon name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        {selectedTrack && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalTrackInfo}>
              <View style={styles.modalTrackIcon}>
                <Icon name="music-note" size={48} color="#8B5CF6" />
              </View>
              <Text style={styles.modalTrackTitle}>{selectedTrack.title}</Text>
              <Text style={styles.modalTrackGenre}>{selectedTrack.genre}</Text>
            </View>

            <View style={styles.modalStats}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{selectedTrack.play_count || 0}</Text>
                <Text style={styles.modalStatLabel}>Total Plays</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{selectedTrack.duration || '0:00'}</Text>
                <Text style={styles.modalStatLabel}>Duration</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>
                  {selectedTrack.approval_status === 'approved' ? 'Approved' : 'Pending'}
                </Text>
                <Text style={styles.modalStatLabel}>Status</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalActionButton}>
                <Icon name="edit" size={20} color="#8B5CF6" />
                <Text style={styles.modalActionText}>Edit Track</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalActionButton}>
                <Icon name="analytics" size={20} color="#10B981" />
                <Text style={styles.modalActionText}>View Analytics</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalActionButton, styles.deleteButton]}
                onPress={() => handleDeleteTrack(selectedTrack.id)}
              >
                <Icon name="delete" size={20} color="#EF4444" />
                <Text style={[styles.modalActionText, styles.deleteButtonText]}>Delete Track</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading your music...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Music</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => navigation.navigate('Upload')}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tracks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{tracks.length}</Text>
          <Text style={styles.statLabel}>Total Tracks</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {tracks.reduce((sum, track) => sum + (track.play_count || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Total Plays</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {tracks.filter(track => track.approval_status === 'approved').length}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
      </View>

      {/* Tracks List */}
      <ScrollView
        style={styles.tracksContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTracks.length > 0 ? (
          filteredTracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="music-note" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No tracks found' : 'No tracks yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Upload your first track to get started'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.uploadFirstButton}
                onPress={() => navigation.navigate('Upload')}
              >
                <Text style={styles.uploadFirstButtonText}>Upload Music</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <TrackModal />
    </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  uploadButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  tracksContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  trackCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trackDetails: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  trackGenre: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  trackStats: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  trackStat: {
    fontSize: 12,
    color: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackStatus: {
    marginLeft: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateText: {
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
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalTrackInfo: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  modalTrackIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTrackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  modalTrackGenre: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  modalStats: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    gap: 20,
  },
  modalStat: {
    flex: 1,
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  modalActions: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalActionText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  deleteButtonText: {
    color: '#EF4444',
  },
});

export default MyMusicScreen;
