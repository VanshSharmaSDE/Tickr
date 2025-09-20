import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { taskService, Task } from '../services/taskService';
import { colors, spacing, typography, borderRadius, shadow } from '../styles/globalStyles';
import { RootStackParamList } from '../navigation/AppNavigator';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user, logout } = useAuth();
  const { settings, toggleTheme, toggleTaskViewMode } = useSettings();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  const isDark = settings.theme === 'dark';
  const isCardView = settings.taskViewMode === 'card';

  useEffect(() => {
    loadTasks();
    loadStats();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await taskService.getTaskStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTasks(), loadStats()]);
    setRefreshing(false);
  };

  const handleTaskPress = (task: Task) => {
    // Handle task press - could navigate to task detail screen
    console.log('Task pressed:', task.title);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'in-progress':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      default:
        return colors.info;
    }
  };

  const renderTaskCard = ({ item: task }: { item: Task }) => (
    <TouchableOpacity
      style={[styles.taskCard, isCardView ? styles.cardView : styles.listView]}
      onPress={() => handleTaskPress(task)}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
      </View>
      
      {task.description && (
        <Text style={styles.taskDescription} numberOfLines={3}>
          {task.description}
        </Text>
      )}
      
      <View style={styles.taskFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.statusText}>{task.status.replace('-', ' ')}</Text>
        </View>
        {task.dueDate && (
          <Text style={styles.dueDate}>
            {new Date(task.dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const styles = createStyles(isDark);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading tasks...</Text>
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
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}!</Text>
          <Text style={styles.subtitle}>Let's manage your tasks</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleTheme}>
            <Text style={styles.actionButtonText}>
              {isDark ? '☀️' : '🌙'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={toggleTaskViewMode}>
            <Text style={styles.actionButtonText}>
              {isCardView ? '📋' : '📱'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={logout}>
            <Text style={styles.actionButtonText}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Text style={styles.quickActionText}>📊 Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionText}>➕ Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <View style={styles.tasksSection}>
        <Text style={styles.sectionTitle}>Recent Tasks</Text>
        
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks yet</Text>
            <Text style={styles.emptyStateSubtext}>Create your first task to get started</Text>
          </View>
        ) : (
          <FlatList
            data={tasks.slice(0, 10)} // Show only recent 10 tasks
            renderItem={renderTaskCard}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            numColumns={isCardView ? 1 : 1}
          />
        )}
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
      paddingTop: spacing.xl,
    },
    greeting: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: isDark ? colors.textDark : colors.text,
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: isDark ? colors.textSecondaryDark : colors.textSecondary,
      marginTop: spacing.xs,
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadow.small,
    },
    actionButtonText: {
      fontSize: typography.fontSize.lg,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    statCard: {
      flex: 1,
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      ...shadow.small,
    },
    statNumber: {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
    },
    statLabel: {
      fontSize: typography.fontSize.sm,
      color: isDark ? colors.textSecondaryDark : colors.textSecondary,
      marginTop: spacing.xs,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    quickActionButton: {
      flex: 1,
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      ...shadow.small,
    },
    quickActionText: {
      color: colors.background,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
    },
    tasksSection: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.md,
    },
    taskCard: {
      backgroundColor: isDark ? colors.surfaceDark : colors.surface,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.sm,
      ...shadow.small,
    },
    cardView: {
      // Additional styling for card view
    },
    listView: {
      // Additional styling for list view
    },
    taskHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    taskTitle: {
      flex: 1,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: isDark ? colors.textDark : colors.text,
      marginRight: spacing.sm,
    },
    priorityBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    priorityText: {
      color: colors.background,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      textTransform: 'uppercase',
    },
    taskDescription: {
      fontSize: typography.fontSize.sm,
      color: isDark ? colors.textSecondaryDark : colors.textSecondary,
      marginBottom: spacing.sm,
      lineHeight: 20,
    },
    taskFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
    },
    statusText: {
      color: colors.background,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      textTransform: 'capitalize',
    },
    dueDate: {
      fontSize: typography.fontSize.xs,
      color: isDark ? colors.textSecondaryDark : colors.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
    },
    emptyStateText: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      color: isDark ? colors.textDark : colors.text,
      marginBottom: spacing.sm,
    },
    emptyStateSubtext: {
      fontSize: typography.fontSize.base,
      color: isDark ? colors.textSecondaryDark : colors.textSecondary,
      textAlign: 'center',
    },
  });

export default DashboardScreen;