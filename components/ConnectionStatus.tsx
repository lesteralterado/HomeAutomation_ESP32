import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastPing: number;
}

export function ConnectionStatus({ isConnected, lastPing }: ConnectionStatusProps) {
  const getStatusColor = () => {
    if (isConnected) return '#10B981'; // green
    return '#EF4444'; // red
  };

  const getStatusText = () => {
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getLastSeenText = () => {
    if (isConnected) return 'Live';
    const seconds = Math.floor((Date.now() - lastPing) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.statusText}>
        {getStatusText()} • {getLastSeenText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});