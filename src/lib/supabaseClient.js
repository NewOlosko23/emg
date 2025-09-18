import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE_CONFIG } from '../config/supabase';

const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'emg-mobile-app'
    }
  }
});

// Helper functions for common operations
export const authHelpers = {
  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          full_name: userData.fullName || userData.full_name
        }
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get user profile with role
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles_emg')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles_emg')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Reset password
  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  }
};

// Database helpers
export const dbHelpers = {
  // Get user's tracks
  async getUserTracks(userId) {
    const { data, error } = await supabase
      .from('tracks_emg')
      .select('*')
      .eq('artist_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Create new track
  async createTrack(trackData) {
    const { data, error } = await supabase
      .from('tracks_emg')
      .insert([trackData])
      .select()
      .single();
    return { data, error };
  },

  // Update track
  async updateTrack(trackId, updates) {
    const { data, error } = await supabase
      .from('tracks_emg')
      .update(updates)
      .eq('id', trackId)
      .select()
      .single();
    return { data, error };
  },

  // Delete track
  async deleteTrack(trackId) {
    const { data, error } = await supabase
      .from('tracks_emg')
      .delete()
      .eq('id', trackId);
    return { data, error };
  },

  // Get user's earnings
  async getUserEarnings(userId) {
    const { data, error } = await supabase
      .from('earnings_emg')
      .select('*')
      .eq('artist_id', userId)
      .order('period_start', { ascending: false });
    return { data, error };
  },

  // Get track analytics
  async getTrackAnalytics(trackId, period = '30d') {
    const { data, error } = await supabase
      .from('track_plays_emg')
      .select('*')
      .eq('track_id', trackId)
      .gte('played_at', this.getDateFromPeriod(period))
      .order('played_at', { ascending: false });
    
    return { data, error };
  },

  // Get user analytics
  async getUserAnalytics(userId, period = '30d') {
    const { data, error } = await supabase
      .from('track_plays_emg')
      .select(`
        *,
        tracks_emg!inner(artist_id)
      `)
      .eq('tracks_emg.artist_id', userId)
      .gte('played_at', this.getDateFromPeriod(period))
      .order('played_at', { ascending: false });
    
    return { data, error };
  },

  // Helper function to get date from period
  getDateFromPeriod(period) {
    const now = new Date();
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }
};

// File upload helpers
export const fileHelpers = {
  // Upload file to Supabase Storage
  async uploadFile(bucket, file, path, options = {}) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        ...options
      });
    return { data, error };
  },

  // Get public URL for file
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Upload track audio file
  async uploadTrackAudio(file, userId, trackId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${trackId}/audio.${fileExt}`;
    
    const { data, error } = await this.uploadFile('tracks', file, fileName);
    if (error) return { data: null, error };
    
    const publicUrl = this.getPublicUrl('tracks', fileName);
    return { data: { path: fileName, url: publicUrl }, error: null };
  },

  // Upload cover art
  async uploadCoverArt(file, userId, trackId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${trackId}/cover.${fileExt}`;
    
    const { data, error } = await this.uploadFile('covers', file, fileName);
    if (error) return { data: null, error };
    
    const publicUrl = this.getPublicUrl('covers', fileName);
    return { data: { path: fileName, url: publicUrl }, error: null };
  },

  // Upload avatar
  async uploadAvatar(file, userId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    
    const { data, error } = await this.uploadFile('avatars', file, fileName);
    if (error) return { data: null, error };
    
    const publicUrl = this.getPublicUrl('avatars', fileName);
    return { data: { path: fileName, url: publicUrl }, error: null };
  }
};

export default supabase;
