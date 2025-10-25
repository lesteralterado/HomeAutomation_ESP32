/*
 * 🚀 Production-Ready Smart Home Controller
 * Enterprise-grade IoT home automation app
 *
 * Features:
 * - Real-time relay control with optimistic updates
 * - Unified scheduling system (all relays at once)
 * - Connection status monitoring
 * - Quick actions and emergency controls
 * - Production error handling and loading states
 * - Firebase integration with environment variables
 */

import React, { useState, useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '@/hooks/useNotifications';
import { useRelays, useSchedules, useScheduleEnabled, useConnectionStatus } from '@/hooks/useFirebase';
import { RelayButton } from '@/components/RelayButton';
import { ScheduleModal } from '@/components/ScheduleModal';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { QuickActions } from '@/components/QuickActions';
import { RelayState } from '@/lib/firebase';

const SmartHomeApp = () => {
  // Custom hooks for state management
  const { relays, loading: relaysLoading, error: relaysError, toggleRelay } = useRelays();
  const { schedules, saveSchedule, deleteSchedule, updateSchedule } = useSchedules();
  const scheduleEnabled = useScheduleEnabled();
  const { isConnected, lastPing } = useConnectionStatus();
  const { sendTestNotification } = useNotifications();

  // UI state
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Device configuration
  const devices = [
    { key: 'relay1' as keyof RelayState, name: 'Living Room Light', icon: '💡', color: '#F59E0B' },
    { key: 'relay2' as keyof RelayState, name: 'Bedroom Fan', icon: '🌪️', color: '#10B981' },
    { key: 'relay3' as keyof RelayState, name: 'Kitchen Light', icon: '🍳', color: '#3B82F6' },
    { key: 'relay4' as keyof RelayState, name: 'Garden Pump', icon: '🌱', color: '#8B5CF6' },
  ];

  // Handlers
  const handleToggleRelay = useCallback(async (relayName: keyof RelayState, deviceName: string) => {
    try {
      const result = await toggleRelay(relayName, deviceName);
      Alert.alert('Success', result.message);
    } catch (error) {
      Alert.alert('Error', 'Failed to control device');
    }
  }, [toggleRelay]);

  const handleToggleAll = useCallback(async (state: boolean) => {
    const promises = devices.map(device =>
      toggleRelay(device.key, device.name).catch(() => null)
    );
    await Promise.all(promises);
  }, [devices, toggleRelay]);

  const handleEmergencyOff = useCallback(async () => {
    await handleToggleAll(false);
  }, [handleToggleAll]);

  const handleSaveSchedule = useCallback(async (time: string, action: 'ON' | 'OFF') => {
    try {
      const result = await saveSchedule(time, action);
      Alert.alert('Success', result.message);
      return result;
    } catch (error) {
      Alert.alert('Error', 'Failed to save schedule');
      throw error;
    }
  }, [saveSchedule]);

  const handleDeleteSchedule = useCallback(async (id: string) => {
    try {
      const result = await deleteSchedule(id);
      Alert.alert('Success', result.message);
      return result;
    } catch (error) {
      Alert.alert('Error', 'Failed to delete schedule');
      throw error;
    }
  }, [deleteSchedule]);

  const handleUpdateSchedule = useCallback(async (id: string, time: string, action: 'ON' | 'OFF') => {
    try {
      const result = await updateSchedule(id, time, action);
      Alert.alert('Success', result.message);
      return result;
    } catch (error) {
      Alert.alert('Error', 'Failed to update schedule');
      throw error;
    }
  }, [updateSchedule]);

  const handleStartEditing = useCallback((schedule: any) => {
    setEditingId(schedule.id);
    setScheduleModalVisible(true);
  }, []);

  // Loading and error states
  if (relaysLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading devices...</Text>
      </SafeAreaView>
    );
  }

  if (relaysError) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Connection Error</Text>
        <Text style={styles.errorSubtext}>Please check your internet connection</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => Alert.alert('Retry', 'Please restart the app')}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

      {/* Connection Status */}
      <ConnectionStatus isConnected={isConnected} lastPing={lastPing} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏠 Smart Home</Text>
          <Text style={styles.subtitle}>Control your devices with magic! ✨</Text>
        </View>

        {/* Quick Actions */}
        <QuickActions
          relays={relays}
          onToggleAll={handleToggleAll}
          onEmergencyOff={handleEmergencyOff}
        />

        {/* Control Buttons */}
        <View style={styles.buttonsContainer}>
          {devices.map(device => (
            <RelayButton
              key={device.key}
              relayName={device.key}
              deviceName={device.name}
              icon={device.icon}
              color={device.color}
              isOn={relays[device.key]}
              isScheduleEnabled={scheduleEnabled[device.key]}
              onPress={() => handleToggleRelay(device.key, device.name)}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎉 Built with ESP32 & Firebase!
          </Text>
          <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
            <Text style={styles.testButtonText}>🔔 Test Notification</Text>
          </TouchableOpacity>
        </View>

        {/* Schedule Modal */}
        <ScheduleModal
          visible={scheduleModalVisible}
          onClose={() => {
            setScheduleModalVisible(false);
            setEditingId(null);
          }}
          schedules={schedules}
          onSave={handleSaveSchedule}
          onDelete={handleDeleteSchedule}
          onUpdate={handleUpdateSchedule}
          editingId={editingId}
          onStartEditing={handleStartEditing}
        />

        {/* Floating Schedule Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setScheduleModalVisible(true)}
          activeOpacity={0.9}
        >
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>Schedule</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  buttonsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default SmartHomeApp;