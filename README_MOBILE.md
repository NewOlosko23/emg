# EMG Music Mobile App

A React Native mobile application for the EMG Music Platform, providing artists with a comprehensive mobile experience for managing their music, analytics, and profile.

## Features

### 🎵 Core Features
- **Authentication**: Secure login/signup with Supabase Auth
- **Dashboard**: Overview of tracks, plays, earnings, and recent activity
- **Music Management**: Upload, view, and manage your tracks
- **Analytics**: Track performance metrics and earnings
- **Profile Management**: Complete artist profile with social links
- **Admin Panel**: Full admin functionality for platform management

### 📱 Mobile-Specific Features
- **Offline Support**: Basic offline functionality with AsyncStorage
- **Push Notifications**: Real-time updates (configurable)
- **Dark Mode**: Theme switching capability
- **Data Saver**: Optimized for mobile data usage
- **Touch-Optimized UI**: Native mobile interactions

## Tech Stack

- **React Native 0.81.4**
- **React Navigation 6** - Navigation and routing
- **Supabase** - Backend, authentication, and database
- **React Native Vector Icons** - Icon library
- **AsyncStorage** - Local data persistence
- **React Native Chart Kit** - Analytics charts
- **React Native SVG** - Vector graphics

## Setup Instructions

### Prerequisites
- Node.js (>= 20)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Supabase**
   - Open `src/config/supabase.js`
   - Replace `YOUR_SUPABASE_URL` with your Supabase project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your Supabase anon key

3. **iOS Setup** (macOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Run the App**
   ```bash
   # Start Metro bundler
   npm start
   
   # Run on Android
   npm run android
   
   # Run on iOS
   npm run ios
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, etc.)
├── lib/               # Utilities and configurations
│   └── supabaseClient.js
├── navigation/        # Navigation configuration
│   └── AppNavigator.jsx
├── screens/          # Screen components
│   ├── LoginScreen.jsx
│   ├── SignupScreen.jsx
│   ├── DashboardScreen.jsx
│   ├── MyMusicScreen.jsx
│   ├── UploadMusicScreen.jsx
│   ├── AnalyticsScreen.jsx
│   ├── ProfileScreen.jsx
│   ├── SettingsScreen.jsx
│   └── admin/
│       └── AdminDashboardScreen.jsx
└── config/
    └── supabase.js    # Supabase configuration
```

## Key Screens

### Authentication
- **Login Screen**: Email/password authentication
- **Signup Screen**: Account creation with profile setup
- **Forgot Password**: Password reset functionality

### Main App
- **Dashboard**: Overview with stats and quick actions
- **My Music**: Track management with search and filtering
- **Upload Music**: Track upload with metadata
- **Analytics**: Performance charts and metrics
- **Profile**: User profile and settings management

### Admin
- **Admin Dashboard**: Platform management overview
- **User Management**: User administration
- **Content Moderation**: Track approval/rejection
- **Analytics**: Platform-wide analytics

## Configuration

### Supabase Setup
1. Create a new Supabase project
2. Set up the database schema (use the SQL files from the main project)
3. Configure Row Level Security (RLS) policies
4. Set up storage buckets for audio files and images
5. Update the configuration in `src/config/supabase.js`

### Environment Variables
The app uses a configuration file instead of environment variables for simplicity. Update `src/config/supabase.js` with your credentials.

## Features in Detail

### Authentication
- Secure authentication with Supabase Auth
- Role-based access control (User/Admin)
- Automatic session management
- Password reset functionality

### Music Management
- Track upload with metadata
- Cover art upload
- Track approval workflow
- Search and filtering
- Track analytics

### Analytics
- Performance metrics
- Earnings tracking
- Time-series charts
- Top tracks analysis

### Admin Features
- User management
- Content moderation
- Platform analytics
- Track approval/rejection

## Development

### Adding New Screens
1. Create the screen component in `src/screens/`
2. Add the route in `src/navigation/AppNavigator.jsx`
3. Update navigation types if using TypeScript

### Styling
- Uses StyleSheet for consistent styling
- Purple theme (#8B5CF6) matching the web app
- Responsive design for different screen sizes

### State Management
- React Context for global state (Auth)
- Local state with useState/useEffect
- Supabase for data persistence

## Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
1. Open `ios/EMG_Mobile.xcworkspace` in Xcode
2. Select your target device/simulator
3. Product → Archive

## Troubleshooting

### Common Issues
1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **iOS build issues**: Run `cd ios && pod install`
3. **Android build issues**: Clean with `cd android && ./gradlew clean`

### Supabase Connection Issues
- Verify your Supabase URL and anon key
- Check network connectivity
- Ensure RLS policies are properly configured

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include loading states
4. Test on both iOS and Android
5. Update documentation for new features

## License

This project is part of the EMG Music Platform. All rights reserved.
