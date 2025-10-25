import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { RelayState } from '@/lib/firebase';

interface QuickActionsProps {
  relays: RelayState;
  onToggleAll: (state: boolean) => Promise<void>;
  onEmergencyOff: () => Promise<void>;
}

export function QuickActions({ relays, onToggleAll, onEmergencyOff }: QuickActionsProps) {
  const allOn = Object.values(relays).every(state => state);
  const allOff = Object.values(relays).every(state => !state);

  const handleToggleAll = async (state: boolean) => {
    try {
      await onToggleAll(state);
    } catch (error) {
      Alert.alert('Error', 'Failed to control devices');
    }
  };

  const handleEmergencyOff = async () => {
    Alert.alert(
      'Emergency Shutdown',
      'Turn off all devices immediately?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Turn Off All',
          style: 'destructive',
          onPress: async () => {
            try {
              await onEmergencyOff();
              Alert.alert('Success', 'All devices turned off');
            } catch (error) {
              Alert.alert('Error', 'Failed to turn off devices');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={() => handleToggleAll(true)}
          disabled={allOn}
        >
          <Text style={styles.actionIcon}>🔆</Text>
          <Text style={styles.actionText}>All On</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#6B7280' }]}
          onPress={() => handleToggleAll(false)}
          disabled={allOff}
        >
          <Text style={styles.actionIcon}>🌙</Text>
          <Text style={styles.actionText}>All Off</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
          onPress={handleEmergencyOff}
        >
          <Text style={styles.actionIcon}>🚨</Text>
          <Text style={styles.actionText}>Emergency Off</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
          onPress={() => Alert.alert('Info', 'Device status monitoring coming soon!')}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Status</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});