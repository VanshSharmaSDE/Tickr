import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { colors, spacing, typography, borderRadius } from '../styles/globalStyles';
import { RootStackParamList } from '../navigation/AppNavigator';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, loading } = useAuth();
  const { settings } = useSettings();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isDark = settings.theme === 'dark';

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return;
    }

    if (password !== confirmPassword) {
      // Handle password mismatch
      return;
    }

    const result = await register(name.trim(), email.trim(), password);
    
    if (result.success) {
      // Navigate to login screen after successful registration
      navigation.navigate('Login');
    }
  };

  const styles = createStyles(isDark);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Tickr today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor={isDark ? colors.textSecondaryDark : colors.textSecondary}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? colors.textSecondaryDark : colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={isDark ? colors.textSecondaryDark : colors.textSecondary}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor={isDark ? colors.textSecondaryDark : colors.textSecondary}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading || !name.trim() || !email.trim() || !password.trim() || password !== confirmPassword}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    title: {
      fontSize: typography.fontSize.xxxxl,
      fontWeight: typography.fontWeight.bold,
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.fontSize.lg,
      color: isDark ? colors.textSecondaryDark : colors.textSecondary,
    },
    form: {
      marginBottom: spacing.xxl,
    },
    inputContainer: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? colors.borderDark : colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.fontSize.base,
      color: isDark ? colors.textDark : colors.text,
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? colors.borderDark : colors.border,
      borderRadius: borderRadius.md,
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
    },
    passwordInput: {
      flex: 1,
      padding: spacing.md,
      fontSize: typography.fontSize.base,
      color: isDark ? colors.textDark : colors.text,
    },
    passwordToggle: {
      padding: spacing.md,
    },
    passwordToggleText: {
      color: colors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    registerButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      marginTop: spacing.lg,
    },
    registerButtonDisabled: {
      backgroundColor: isDark ? colors.borderDark : colors.border,
    },
    registerButtonText: {
      color: colors.background,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      fontSize: typography.fontSize.base,
      color: isDark ? colors.textSecondaryDark : colors.textSecondary,
    },
    footerLink: {
      fontSize: typography.fontSize.base,
      color: colors.primary,
      fontWeight: typography.fontWeight.medium,
    },
  });

export default RegisterScreen;