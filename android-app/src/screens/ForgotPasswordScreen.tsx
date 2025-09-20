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

type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const { forgotPassword, loading } = useAuth();
  const { settings } = useSettings();
  
  const [email, setEmail] = useState('');

  const isDark = settings.theme === 'dark';

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      return;
    }

    const result = await forgotPassword(email.trim());
    
    if (result.success) {
      // Navigate back to login after sending reset link
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
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
        </View>

        <View style={styles.form}>
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

          <TouchableOpacity
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleForgotPassword}
            disabled={loading || !email.trim()}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember your password? </Text>
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
      textAlign: 'center',
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
    resetButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      marginTop: spacing.lg,
    },
    resetButtonDisabled: {
      backgroundColor: isDark ? colors.borderDark : colors.border,
    },
    resetButtonText: {
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

export default ForgotPasswordScreen;