import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';

import { AuthProvider } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext';
import AppNavigator from './src/navigation/AppNavigator';

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
          <AppNavigator />
          <Toast />
        </NavigationContainer>
      </AuthProvider>
    </SettingsProvider>
  );
};

export default App;