import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { dbHelpers } from '../lib/supabaseClient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const UploadMusicScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    description: '',
    duration: '',
    releaseDate: '',
  });

  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Classical',
    'Country', 'Reggae', 'Blues', 'Folk', 'Alternative', 'Indie', 'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a track title');
      return false;
    }
    if (!formData.genre) {
      Alert.alert('Error', 'Please select a genre');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const trackData = {
        title: formData.title.trim(),
        genre: formData.genre,
        description: formData.description.trim(),
        duration: formData.duration,
        release_date: formData.releaseDate,
        artist_id: user.id,
        approval_status: 'pending',
        is_approved: false,
        play_count: 0,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await dbHelpers.createTrack(trackData);
      
      if (error) {
        Alert.alert('Error', 'Failed to upload track');
        return;
      }

      Alert.alert(
        'Success',
        'Track uploaded successfully! It will be reviewed before being published.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                title: '',
                genre: '',
                description: '',
                duration: '',
                releaseDate: '',
              });
              navigation.navigate('MyMusic');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload track');
    } finally {
      setLoading(false);
    }
  };

  const GenreSelector = () => (
    <View style={styles.genreContainer}>
      <Text style={styles.label}>Genre *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.genreChip,
              formData.genre === genre && styles.genreChipSelected,
            ]}
            onPress={() => handleInputChange('genre', genre)}
          >
            <Text
              style={[
                styles.genreChipText,
                formData.genre === genre && styles.genreChipTextSelected,
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload New Track</Text>
        <Text style={styles.headerSubtitle}>Share your music with the world</Text>
      </View>

      <View style={styles.form}>
        {/* Track Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Track Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Enter track title"
            maxLength={100}
          />
        </View>

        {/* Genre Selector */}
        <GenreSelector />

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Describe your track..."
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        {/* Duration */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration</Text>
          <TextInput
            style={styles.input}
            value={formData.duration}
            onChangeText={(value) => handleInputChange('duration', value)}
            placeholder="e.g., 3:45"
            keyboardType="default"
          />
        </View>

        {/* Release Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Release Date</Text>
          <TextInput
            style={styles.input}
            value={formData.releaseDate}
            onChangeText={(value) => handleInputChange('releaseDate', value)}
            placeholder="YYYY-MM-DD"
            keyboardType="default"
          />
        </View>

        {/* Upload Info */}
        <View style={styles.infoContainer}>
          <Icon name="info" size={20} color="#8B5CF6" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Upload Process</Text>
            <Text style={styles.infoDescription}>
              Your track will be reviewed by our team before being published. 
              This usually takes 24-48 hours.
            </Text>
          </View>
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Icon name="cloud-upload" size={20} color="white" />
              <Text style={styles.uploadButtonText}>Upload Track</Text>
            </>
          )}
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
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
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
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  genreContainer: {
    marginBottom: 20,
  },
  genreScroll: {
    marginTop: 8,
  },
  genreChip: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  genreChipSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  genreChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  genreChipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 16,
  },
  uploadButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: '#A78BFA',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadMusicScreen;
