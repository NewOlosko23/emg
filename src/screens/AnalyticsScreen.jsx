import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { dbHelpers } from '../lib/supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({
    totalPlays: 0,
    totalEarnings: 0,
    topTracks: [],
    playsOverTime: [],
    earningsOverTime: [],
  });

  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: '1y', label: '1 Year' },
  ];

  useEffect(() => {
    if (user?.id) {
      loadAnalytics();
    }
  }, [user?.id, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load user tracks
      const { data: tracks } = await dbHelpers.getUserTracks(user.id);
      
      // Load user analytics
      const { data: plays } = await dbHelpers.getUserAnalytics(user.id, selectedPeriod);
      
      // Load earnings
      const { data: earnings } = await dbHelpers.getUserEarnings(user.id);

      // Calculate analytics
      const totalPlays = plays?.length || 0;
      const totalEarnings = earnings?.reduce((sum, earning) => sum + (earning.revenue_amount || 0), 0) || 0;
      
      // Get top tracks by play count
      const topTracks = tracks
        ?.sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
        ?.slice(0, 5) || [];

      // Mock data for plays over time (in a real app, you'd get this from your analytics API)
      const playsOverTime = generateMockTimeSeriesData(selectedPeriod, 'plays');
      const earningsOverTime = generateMockTimeSeriesData(selectedPeriod, 'earnings');

      setAnalyticsData({
        totalPlays,
        totalEarnings,
        topTracks,
        playsOverTime,
        earningsOverTime,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTimeSeriesData = (period, type) => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: type === 'plays' 
          ? Math.floor(Math.random() * 100) + 10
          : Math.floor(Math.random() * 50) + 5,
      });
    }
    
    return data;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <Icon name={icon} size={24} color={color} />
        </View>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );

  const PeriodSelector = () => (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            selectedPeriod === period.key && styles.periodButtonSelected,
          ]}
          onPress={() => setSelectedPeriod(period.key)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period.key && styles.periodButtonTextSelected,
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const TopTracksList = () => (
    <View style={styles.topTracksContainer}>
      <Text style={styles.sectionTitle}>Top Performing Tracks</Text>
      {analyticsData.topTracks.length > 0 ? (
        analyticsData.topTracks.map((track, index) => (
          <View key={track.id} style={styles.trackItem}>
            <View style={styles.trackRank}>
              <Text style={styles.trackRankText}>#{index + 1}</Text>
            </View>
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{track.title}</Text>
              <Text style={styles.trackGenre}>{track.genre}</Text>
            </View>
            <View style={styles.trackStats}>
              <Text style={styles.trackPlays}>{track.play_count || 0} plays</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Icon name="music-note" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No tracks yet</Text>
          <Text style={styles.emptyStateSubtext}>Upload tracks to see analytics</Text>
        </View>
      )}
    </View>
  );

  const SimpleChart = ({ data, title, color }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.chart}>
          {data.slice(-7).map((item, index) => (
            <View key={index} style={styles.chartBar}>
              <View
                style={[
                  styles.chartBarFill,
                  {
                    height: (item.value / maxValue) * 100,
                    backgroundColor: color,
                  },
                ]}
              />
              <Text style={styles.chartBarLabel}>
                {new Date(item.date).getDate()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
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
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Track your music performance</Text>
      </View>

      {/* Period Selector */}
      <PeriodSelector />

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Plays"
          value={analyticsData.totalPlays.toLocaleString()}
          icon="play-arrow"
          color="#8B5CF6"
          subtitle={`Last ${selectedPeriod}`}
        />
        <StatCard
          title="Total Earnings"
          value={`$${analyticsData.totalEarnings.toFixed(2)}`}
          icon="attach-money"
          color="#10B981"
          subtitle="All time"
        />
      </View>

      {/* Charts */}
      <View style={styles.chartsContainer}>
        <SimpleChart
          data={analyticsData.playsOverTime}
          title="Plays Over Time"
          color="#8B5CF6"
        />
        <SimpleChart
          data={analyticsData.earningsOverTime}
          title="Earnings Over Time"
          color="#10B981"
        />
      </View>

      {/* Top Tracks */}
      <TopTracksList />
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
  periodSelector: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  periodButtonTextSelected: {
    color: 'white',
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
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  chartsContainer: {
    padding: 20,
    gap: 20,
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: 8,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  chartBarLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  topTracksContainer: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  trackItem: {
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
  trackRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackRankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  trackInfo: {
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
    marginLeft: 12,
  },
  trackPlays: {
    fontSize: 12,
    color: '#6B7280',
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

export default AnalyticsScreen;
