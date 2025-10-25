import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { RelayState } from '@/lib/firebase';

interface RelayButtonProps {
  relayName: keyof RelayState;
  deviceName: string;
  icon: string;
  color: string;
  isOn: boolean;
  isScheduleEnabled: boolean;
  onPress: () => void;
}

export function RelayButton({
  relayName,
  deviceName,
  icon,
  color,
  isOn,
  isScheduleEnabled,
  onPress
}: RelayButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isOn ? color : '#374151' }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 8 }}>
        <Text style={styles.icon}>{icon}</Text>
        {isScheduleEnabled && (
          <Text style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.8)' }}>⏰</Text>
        )}
      </View>
      <Text style={styles.deviceName}>{deviceName}</Text>
      <Text style={styles.status}>
        {isOn ? 'ON' : 'OFF'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
});