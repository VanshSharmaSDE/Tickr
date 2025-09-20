# Tickr Mobile App

A React Native mobile application for task management, converted from the web version with native mobile optimization.

## 🚀 Features

- **Authentication Flow**: Login, Register, Forgot Password
- **Task Management**: Create, view, update, and delete tasks
- **Analytics Dashboard**: Task statistics and productivity insights
- **Dark/Light Theme**: Theme toggle with persistent settings
- **Card/List View**: Toggle between different task view modes
- **Real-time Sync**: Settings and tasks sync with backend
- **TypeScript**: Full TypeScript support for better development experience

## 📱 Screens

- **LoginScreen**: User authentication
- **RegisterScreen**: New user registration
- **ForgotPasswordScreen**: Password reset functionality
- **DashboardScreen**: Main task management interface
- **AnalyticsScreen**: Task statistics and insights

## 🛠 Tech Stack

- **React Native**: 0.72.6
- **TypeScript**: 4.8.4
- **React Navigation**: 6.x (Stack Navigator)
- **AsyncStorage**: Local data persistence
- **React Native Toast**: User notifications
- **React Native Vector Icons**: Icon library

## 📁 Project Structure

```
android-app/
├── src/
│   ├── components/          # Reusable components
│   ├── context/            # Context providers (Auth, Settings)
│   ├── navigation/         # Navigation configuration
│   ├── screens/           # Screen components
│   ├── services/          # API services
│   ├── styles/           # Global styles and theme
│   └── utils/            # Utility functions
├── App.tsx              # Main app component
├── index.js            # Entry point
├── package.json        # Dependencies
└── tsconfig.json      # TypeScript configuration
```

## 🎨 Design System

### Colors
- **Primary**: #3b82f6 (Blue)
- **Primary Dark**: #2563eb
- **Secondary**: #10b981 (Green)
- **Background**: #ffffff (Light) / #1f2937 (Dark)
- **Surface**: #f9fafb (Light) / #374151 (Dark)
- **Text**: #111827 (Light) / #f9fafb (Dark)

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

### Typography
- **Font Sizes**: 12px - 36px
- **Font Weights**: normal, medium, semibold, bold

## 🔧 Setup Instructions

### Prerequisites
- Node.js (>= 16)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

### Installation

1. **Navigate to the android-app directory**:
   ```bash
   cd android-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (macOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure API URL**:
   - Update the `API_URL` in `src/services/api.ts`
   - Replace `http://localhost:5000/api` with your backend URL

### Running the App

#### Android
```bash
npm run android
```

#### iOS (macOS only)
```bash
npm run ios
```

#### Start Metro Bundler
```bash
npm start
```

## 🔗 API Integration

The app connects to the same backend as the web version. Make sure your backend server is running and accessible.

### API Services
- **authService**: Handle authentication (login, register, forgot password)
- **taskService**: Manage tasks (CRUD operations, statistics)
- **settingsService**: User preferences and settings

### Key Features
- **Automatic token management**: AsyncStorage for persistent authentication
- **Error handling**: Proper error messages and user feedback
- **Offline support**: Local storage for settings
- **Auto-sync**: Settings sync when connectivity is restored

## 🎯 Key Differences from Web Version

### Mobile Optimizations
1. **Touch-friendly UI**: Larger touch targets, proper spacing
2. **Mobile navigation**: Stack navigator instead of web routing
3. **Native components**: Using React Native components instead of HTML
4. **AsyncStorage**: Instead of localStorage for data persistence
5. **Toast notifications**: Native mobile toast messages
6. **Keyboard handling**: KeyboardAvoidingView for better UX
7. **Pull-to-refresh**: Native refresh control for data reloading

### Removed Features
- **Landing Page**: Not needed for mobile app
- **404 Page**: Handled by navigation
- **Web-specific animations**: Replaced with React Native animations

### Enhanced Features
- **Better touch interactions**: Optimized for mobile gestures
- **Native performance**: Better scrolling and animations
- **Mobile-first design**: Optimized layouts for small screens
- **Offline capabilities**: Better offline experience

## 🔧 Development

### Code Style
- **TypeScript**: Strict typing for better code quality
- **Functional Components**: Using React hooks
- **StyleSheet**: React Native's StyleSheet API instead of CSS
- **Context API**: For global state management

### Testing
```bash
npm test
```

### Building for Production

#### Android APK
```bash
cd android
./gradlew assembleRelease
```

#### iOS Archive (macOS only)
```bash
npx react-native run-ios --configuration Release
```

## 🚀 Deployment

### Android Play Store
1. Generate signed APK
2. Upload to Google Play Console
3. Follow Play Store guidelines

### iOS App Store (macOS only)
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both platforms
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For technical support or questions about the mobile app:
- Check the troubleshooting section
- Open an issue on GitHub
- Contact the development team

---

**Note**: This React Native app provides the same functionality as the web version but optimized for mobile devices with native performance and user experience.