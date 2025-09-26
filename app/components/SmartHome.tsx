/*
 * 📱 Super Simple Smart Home Controller
 * Perfect for Grade 6 Students!
 * 
 * This app has 4 beautiful buttons that control your relays
 * Uses Firebase to talk to your ESP32
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import type { DataSnapshot } from '@firebase/database';

type RelayState = {
  relay1: boolean;
  relay2: boolean;
  relay3: boolean;
  relay4: boolean;
};

// Your Firebase Config (Get this from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAYVPxNpPxKOS2G0H9bLQCi2V1mDfm95Zs",
  authDomain: "home-automation-esp-d7d8c.firebaseapp.com",
  databaseURL: "https://home-automation-esp-d7d8c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "home-automation-esp-d7d8c",
  storageBucket: "home-automation-esp-d7d8c.firebasestorage.app",
  messagingSenderId: "900577873605",
  appId: "1:900577873605:web:0969e0a0d35b5fbdacaaac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const SmartHomeApp = () => {
  // State to track if each relay is ON or OFF
  const [relays, setRelays] = useState<RelayState>({
    relay1: false,
    relay2: false,
    relay3: false,
    relay4: false,
  });

  // Load relay states when app starts
  useEffect(() => {
    loadRelayStates();
  }, []);

  // Function to load current relay states from Firebase
  const loadRelayStates = () => {
    const relaysRef = ref(database, 'relays');
    onValue(relaysRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val() as Partial<RelayState> | null;
      if (data) {
        setRelays(prev => ({ ...prev, ...data }));
      }
    });
  };

  // Function to toggle a relay ON/OFF
  const toggleRelay = async (relayName: keyof RelayState, deviceName: string) => {
    try {
      const newState = !relays[relayName];

      // Update Firebase
      await set(ref(database, `relays/${relayName}`), newState);

      // Show confirmation
      Alert.alert(
        '✅ Success!',
        `${deviceName} turned ${newState ? 'ON' : 'OFF'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to control device');
      console.error(error);
    }
  };

  // Beautiful button component
  const RelayButton = ({ relayName, deviceName, icon, color }: { relayName: keyof RelayState; deviceName: string; icon: string; color: string }) => {
    const isOn = relays[relayName];

    return (
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isOn ? color : '#374151' }
        ]}
        onPress={() => toggleRelay(relayName, deviceName)}
        activeOpacity={0.8}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.deviceName}>{deviceName}</Text>
        <Text style={styles.status}>
          {isOn ? 'ON' : 'OFF'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🏠 Smart Home</Text>
          <Text style={styles.subtitle}>Control your devices with magic! ✨</Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.buttonsContainer}>
          <RelayButton
            relayName="relay1"
            deviceName="Living Room Light"
            icon="💡"
            color="#F59E0B"
          />

          <RelayButton
            relayName="relay2"
            deviceName="Bedroom Fan"
            icon="🌪️"
            color="#10B981"
          />

          <RelayButton
            relayName="relay3"
            deviceName="Kitchen Light"
            icon="🍳"
            color="#3B82F6"
          />

          <RelayButton
            relayName="relay4"
            deviceName="Garden Pump"
            icon="🌱"
            color="#8B5CF6"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎉 Built with ESP32 & Firebase!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
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
  button: {
    borderRadius: 16,
    padding: 24,
    marginVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
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
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default SmartHomeApp;

/*
 * 📋 SETUP INSTRUCTIONS FOR STUDENTS:
 * 
 * 1. Install React Native CLI:
 *    npm install -g react-native-cli
 * 
 * 2. Create New Project:
 *    npx react-native init SmartHomeApp
 *    cd SmartHomeApp
 * 
 * 3. Install Firebase:
 *    npm install firebase
 * 
 * 4. Replace App.js with this code
 * 
 * 5. Update Firebase Config:
 *    - Go to Firebase Console
 *    - Project Settings > General
 *    - Copy your config and paste above
 * 
 * 6. Run the app:
 *    npx react-native run-android
 *    (or run-ios for iPhone)
 * 
 * 🎉 That's it! Your smart home app is ready!
 */