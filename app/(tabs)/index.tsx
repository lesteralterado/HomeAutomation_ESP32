import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Link } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRelays, useSchedules, useConnectionStatus } from '@/hooks/useFirebase';

export default function DashboardScreen() {
  const { relays, loading: relaysLoading } = useRelays();
  const { schedules } = useSchedules();
  const { isConnected } = useConnectionStatus();

  // Calculate dashboard stats
  const activeDevices = Object.values(relays).filter(state => state).length;
  const totalDevices = Object.keys(relays).length;
  const activeSchedules = schedules.filter(schedule => schedule.relay === 'ALL').length;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#1F2937', dark: '#111827' }}
      headerImage={
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">🏠 Smart Home Dashboard</ThemedText>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#10B981' : '#EF4444' }]} />
          <ThemedText style={styles.statusText}>
            {isConnected ? 'System Online' : 'System Offline'}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Quick Stats */}
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{activeDevices}/{totalDevices}</ThemedText>
          <ThemedText style={styles.statLabel}>Active Devices</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{activeSchedules}</ThemedText>
          <ThemedText style={styles.statLabel}>Active Schedules</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{schedules.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Schedules</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Device Status Overview */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Device Status</ThemedText>
        <ThemedView style={styles.deviceGrid}>
          {Object.entries(relays).map(([deviceKey, isOn]) => (
            <ThemedView key={deviceKey} style={styles.deviceCard}>
              <View style={[styles.deviceIndicator, { backgroundColor: isOn ? '#10B981' : '#6B7280' }]} />
              <ThemedText style={styles.deviceName}>
                {deviceKey === 'relay1' && 'Living Room Light'}
                {deviceKey === 'relay2' && 'Bedroom Fan'}
                {deviceKey === 'relay3' && 'Kitchen Light'}
                {deviceKey === 'relay4' && 'Garden Pump'}
              </ThemedText>
              <ThemedText style={styles.deviceStatus}>{isOn ? 'ON' : 'OFF'}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
        <ThemedView style={styles.actionsGrid}>
          <Link href="/(tabs)/controller" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <ThemedText style={styles.actionIcon}>🎛️</ThemedText>
              <ThemedText style={styles.actionText}>Device Control</ThemedText>
            </TouchableOpacity>
          </Link>
          <Link href="/(tabs)/schedules" asChild>
            <TouchableOpacity style={styles.actionCard}>
              <ThemedText style={styles.actionIcon}>⏰</ThemedText>
              <ThemedText style={styles.actionText}>Schedules</ThemedText>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.actionCard}>
            <ThemedText style={styles.actionIcon}>📊</ThemedText>
            <ThemedText style={styles.actionText}>Analytics</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <ThemedText style={styles.actionIcon}>⚙️</ThemedText>
            <ThemedText style={styles.actionText}>Settings</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Recent Activity */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Activity</ThemedText>
        <ThemedView style={styles.activityList}>
          {schedules.slice(0, 3).map((schedule, index) => (
            <ThemedView key={schedule.id || index} style={styles.activityItem}>
              <ThemedText style={styles.activityIcon}>
                {schedule.action === 'ON' ? '🔆' : '🌙'}
              </ThemedText>
              <View style={styles.activityContent}>
                <ThemedText style={styles.activityText}>
                  Scheduled {schedule.action.toLowerCase()} at {schedule.time}
                </ThemedText>
                <ThemedText style={styles.activityTime}>
                  {schedule.createdAt ? new Date(schedule.createdAt).toLocaleDateString() : 'Recently'}
                </ThemedText>
              </View>
            </ThemedView>
          ))}
          {schedules.length === 0 && (
            <ThemedText style={styles.emptyText}>No recent activity</ThemedText>
          )}
        </ThemedView>
      </ThemedView>

      {/* System Info */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>System Information</ThemedText>
        <ThemedView style={styles.infoCard}>
          <ThemedText style={styles.infoText}>
            🏠 Home Automation System v1.0
          </ThemedText>
          <ThemedText style={styles.infoText}>
            📡 Firebase Realtime Database
          </ThemedText>
          <ThemedText style={styles.infoText}>
            ⚡ ESP32 Microcontroller Integration
          </ThemedText>
          <ThemedText style={styles.infoText}>
            📱 Cross-platform Mobile App
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: 120,
    width: 200,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deviceCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  deviceIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  deviceStatus: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: 'white',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingVertical: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
});
