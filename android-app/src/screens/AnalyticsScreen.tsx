import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { taskService } from '../services/taskService';
import { colors, spacing, typography, borderRadius, shadow } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const { settings } = useSettings();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
    },
  });

  const isDark = settings.theme === 'dark';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTaskStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const progressRate = stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0;
  const pendingRate = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;

  const styles = createStyles(isDark);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
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
      {/* Overview Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task Overview</Text>
        <View style={styles.cardGrid}>
          <View style={styles.overviewCard}>
            <Text style={styles.cardNumber}>{stats.total}</Text>
            <Text style={styles.cardLabel}>Total Tasks</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={[styles.cardNumber, { color: colors.success }]}>{stats.completed}</Text>
            <Text style={styles.cardLabel}>Completed</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={[styles.cardNumber, { color: colors.warning }]}>{stats.inProgress}</Text>
            <Text style={styles.cardLabel}>In Progress</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={[styles.cardNumber, { color: colors.textSecondary }]}>{stats.pending}</Text>
            <Text style={styles.cardLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Progress Bars */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress Breakdown</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Completed</Text>
              <Text style={styles.progressPercentage}>{completionRate.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completionRate}%`, backgroundColor: colors.success }]} />
            </View>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>In Progress</Text>
              <Text style={styles.progressPercentage}>{progressRate.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressRate}%`, backgroundColor: colors.warning }]} />
            </View>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Pending</Text>
              <Text style={styles.progressPercentage}>{pendingRate.toFixed(1)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${pendingRate}%`, backgroundColor: colors.textSecondary }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Priority Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Priority Distribution</Text>
        <View style={styles.priorityGrid}>
          <View style={styles.priorityCard}>
            <View style={[styles.priorityIndicator, { backgroundColor: colors.error }]} />
            <Text style={styles.priorityNumber}>{stats.byPriority.high}</Text>
            <Text style={styles.priorityLabel}>High Priority</Text>
          </View>
          <View style={styles.priorityCard}>
            <View style={[styles.priorityIndicator, { backgroundColor: colors.warning }]} />
            <Text style={styles.priorityNumber}>{stats.byPriority.medium}</Text>
            <Text style={styles.priorityLabel}>Medium Priority</Text>
          </View>
          <View style={styles.priorityCard}>
            <View style={[styles.priorityIndicator, { backgroundColor: colors.info }]} />
            <Text style={styles.priorityNumber}>{stats.byPriority.low}</Text>
            <Text style={styles.priorityLabel}>Low Priority</Text>
          </View>
        </View>
      </View>

      {/* Productivity Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productivity Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>🎯 Completion Rate</Text>
          <Text style={styles.insightValue}>{completionRate.toFixed(1)}%</Text>
          <Text style={styles.insightDescription}>
            {completionRate >= 80
              ? 'Excellent! You\'re completing tasks efficiently.'
              : completionRate >= 60
              ? 'Good progress! Keep up the momentum.'
              : completionRate >= 40
              ? 'Room for improvement. Try breaking tasks into smaller chunks.'
              : 'Focus on completing existing tasks before adding new ones.'}
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>⚡ Task Distribution</Text>
          <Text style={styles.insightDescription}>
            {stats.byPriority.high > stats.byPriority.low + stats.byPriority.medium
              ? 'You have many high-priority tasks. Consider delegating or postponing some lower-priority items.'
              : 'Good balance of task priorities. Keep focusing on high-priority items first.'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.backgroundDark : colors.background,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      color: isDark ? colors.textDark : colors.text,
      fontSize: typography.fontSize.base,
    },
    section: {
      padding: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.md,
    },
    cardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    overviewCard: {
      flex: 1,
      minWidth: (width - spacing.lg * 2 - spacing.sm) / 2,
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      ...shadow.small,
    },
    cardNumber: {
      fontSize: typography.fontSize.xxxxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    cardLabel: {
      fontSize: typography.fontSize.sm,
      color: isDark ? colors.textSecondaryDark : colors.textSecondary,
      textAlign: 'center',
    },
    progressContainer: {
      gap: spacing.md,
    },
    progressItem: {
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      ...shadow.small,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    progressLabel: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: isDark ? colors.textDark : colors.text,
    },
    progressPercentage: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.primary,
    },
    progressBar: {
      height: 8,
      backgroundColor: isDark ? colors.borderDark : colors.border,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    priorityGrid: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    priorityCard: {
      flex: 1,
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      ...shadow.small,
    },
    priorityIndicator: {
      width: 4,
      height: 24,
      borderRadius: borderRadius.sm,
      marginBottom: spacing.sm,
    },
    priorityNumber: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.xs,
    },
    priorityLabel: {
      fontSize: typography.fontSize.xs,
      color: isDark ? colors.textSecondaryDark : colors.textSecondary,
      textAlign: 'center',
    },
    insightCard: {
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
      ...shadow.small,
    },
    insightTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.sm,
    },
    insightValue: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    insightDescription: {
      fontSize: typography.fontSize.sm,
      color: isDark ? colors.textSecondaryDark : colors.textSecondary,
      lineHeight: 20,
    },
  });

export default AnalyticsScreen;