/*
 * 📱 Super Simple Smart Home Controller
 * Perfect for Grade 6 Students!
 * 
 * This app has 4 beautiful buttons that control your relays
 * Uses Firebase to talk to your ESP32
 */

import type { DataSnapshot } from 'firebase/database';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, push, ref, remove, set } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

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
      showToast(`${deviceName} turned ${newState ? 'ON' : 'OFF'}`, 'success');
    } catch (error) {
      showToast('Failed to control device', 'error');
      console.error(error);
    }
  };

  // Scheduling modal state
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [scheduleRelay, setScheduleRelay] = useState<keyof RelayState>('relay1');
  const [scheduleTime, setScheduleTime] = useState('18:30');
  const [scheduleAction, setScheduleAction] = useState<'ON' | 'OFF'>('ON');
  const [schedules, setSchedules] = useState<Array<{ id: string; relay: string; time: string; action: string; createdAt?: number }>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'list'>('add');
  const { scheduleId } = useLocalSearchParams();
  const router = useRouter();

  const openScheduleModal = () => setScheduleModalVisible(true);
  const closeScheduleModal = () => setScheduleModalVisible(false);

  const saveSchedule = async () => {
    // very small validation for HH:MM
    if (!/^\d{1,2}:\d{2}$/.test(scheduleTime)) {
      showToast('Enter time in HH:MM format (e.g. 07:30)', 'error');
      return;
    }

    try {
      const schedulesRef = ref(database, 'schedules');
      if (editingId) {
        await set(ref(database, `schedules/${editingId}`), {
          relay: scheduleRelay,
          time: scheduleTime,
          action: scheduleAction,
          createdAt: Date.now(),
        });
        showToast('Schedule updated', 'success');
        setEditingId(null);
      } else {
        const newRef = push(schedulesRef);
        await set(newRef, {
          relay: scheduleRelay,
          time: scheduleTime,
          action: scheduleAction,
          createdAt: Date.now(),
        });
        showToast(`Will turn ${scheduleRelay} ${scheduleAction} at ${scheduleTime}`, 'success');
      }
      // Reset + close
      setScheduleTime('18:30');
      setScheduleAction('ON');
      setScheduleRelay('relay1');
      closeScheduleModal();
    } catch (err) {
      console.error(err);
      showToast('Failed to save schedule', 'error');
    }
  };

  // Load schedules and subscribe
  useEffect(() => {
    const schedulesRef = ref(database, 'schedules');
    const unsub = onValue(schedulesRef, (snapshot: DataSnapshot) => {
      const val = snapshot.val();
      if (!val) {
        setSchedules([]);
        return;
      }
      const items = Object.entries(val).map(([id, data]) => ({ id, ...(data as any) }));
      // Sort by createdAt desc
      items.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setSchedules(items as any);
    });
    return () => unsub();
  }, []);

  // If navigated with ?scheduleId=..., load it and open modal for editing
  useEffect(() => {
    if (!scheduleId) return;
    const id = Array.isArray(scheduleId) ? scheduleId[0] : scheduleId;
    // Load single schedule
    const scheduleRef = ref(database, `schedules/${id}`);
    onValue(scheduleRef, (snap: DataSnapshot) => {
      const val = snap.val();
      if (val) {
        setEditingId(id);
        setScheduleRelay(val.relay as keyof RelayState);
        setScheduleTime(val.time || '18:30');
        setScheduleAction(val.action || 'ON');
        setModalMode('add');
        openScheduleModal();
      }
    }, { onlyOnce: true } as any);

    // clear the param so the modal won't reopen on back/navigation
    try {
      router.replace('/components/SmartHome');
    } catch (e) {
      // ignore
    }
  }, [scheduleId]);

  const deleteSchedule = async (id: string) => {
    try {
      await remove(ref(database, `schedules/${id}`));
      showToast('Schedule deleted', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete schedule', 'error');
    }
  };

  const startEditingSchedule = (item: { id: string; relay: string; time: string; action: string }) => {
    setEditingId(item.id);
    setScheduleRelay(item.relay as keyof RelayState);
    setScheduleTime(item.time);
    setScheduleAction(item.action as 'ON' | 'OFF');
    setModalMode('add');
  };

  // Toast implementation
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');
  const toastAnim = React.useRef(new Animated.Value(0)).current;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    toastAnim.setValue(0);
    Animated.timing(toastAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.timing(toastAnim, { toValue: 0, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => setToastVisible(false));
      }, 2200);
    });
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
        {/* Scheduling Modal */}
        <Modal visible={scheduleModalVisible} animationType="slide" transparent>
          <View style={modalStyles.centeredView}>
            <View style={modalStyles.modalView}>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={modalStyles.modalTitle}>{modalMode === 'add' ? 'Add Schedule' : 'Schedules'}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable onPress={() => setModalMode('add')} style={[modalStyles.smallToggle, modalMode === 'add' && modalStyles.smallToggleActive]}>
                    <Text style={{ fontWeight: '700' }}>Add</Text>
                  </Pressable>
                  <Pressable onPress={() => setModalMode('list')} style={[modalStyles.smallToggle, modalMode === 'list' && modalStyles.smallToggleActive]}>
                    <Text style={{ fontWeight: '700' }}>View</Text>
                  </Pressable>
                </View>
              </View>

              {modalMode === 'add' ? (
                <>
                  <View style={{ width: '100%', marginBottom: 8 }}>
                    <Text style={{ marginBottom: 4 }}>Device</Text>
                    <View style={modalStyles.row}>
                      <Pressable style={[modalStyles.pill, scheduleRelay === 'relay1' && modalStyles.pillActive]} onPress={() => setScheduleRelay('relay1')}>
                        <Text>Living Room</Text>
                      </Pressable>
                      <Pressable style={[modalStyles.pill, scheduleRelay === 'relay2' && modalStyles.pillActive]} onPress={() => setScheduleRelay('relay2')}>
                        <Text>Bedroom</Text>
                      </Pressable>
                      <Pressable style={[modalStyles.pill, scheduleRelay === 'relay3' && modalStyles.pillActive]} onPress={() => setScheduleRelay('relay3')}>
                        <Text>Kitchen</Text>
                      </Pressable>
                      <Pressable style={[modalStyles.pill, scheduleRelay === 'relay4' && modalStyles.pillActive]} onPress={() => setScheduleRelay('relay4')}>
                        <Text>Garden</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={{ width: '100%', marginBottom: 8 }}>
                    <Text style={{ marginBottom: 4 }}>Time (HH:MM)</Text>
                    <TextInput style={modalStyles.input} value={scheduleTime} onChangeText={setScheduleTime} keyboardType="numeric" />
                  </View>

                  <View style={{ width: '100%', marginBottom: 12 }}>
                    <Text style={{ marginBottom: 4 }}>Action</Text>
                    <View style={modalStyles.row}>
                      <Pressable style={[modalStyles.pill, scheduleAction === 'ON' && modalStyles.pillActive]} onPress={() => setScheduleAction('ON')}>
                        <Text>ON</Text>
                      </Pressable>
                      <Pressable style={[modalStyles.pill, scheduleAction === 'OFF' && modalStyles.pillActive]} onPress={() => setScheduleAction('OFF')}>
                        <Text>OFF</Text>
                      </Pressable>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={modalStyles.modalButton} onPress={saveSchedule}>
                      <Text style={{ color: 'white', fontWeight: '700' }}>{editingId ? 'Update' : 'Save'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[modalStyles.modalButton, { backgroundColor: '#ddd' }]} onPress={() => { closeScheduleModal(); setEditingId(null); }}>
                      <Text style={{ fontWeight: '700' }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={{ width: '100%', maxHeight: 320 }}>
                  {schedules.length === 0 ? (
                    <Text style={{ color: '#6b7280', textAlign: 'center', paddingVertical: 24 }}>No schedules yet. Tap Add to create one.</Text>
                  ) : (
                    <ScrollView>
                      {schedules.map(item => (
                        <View key={item.id} style={modalStyles.modalListItem}>
                          <View>
                            <Text style={{ fontWeight: '700' }}>{item.time} — {item.relay}</Text>
                            <Text style={{ color: '#6b7280' }}>{item.action}</Text>
                          </View>
                          <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={modalStyles.actionButton} onPress={() => startEditingSchedule(item as any)}>
                              <Text style={{ color: '#fff', fontWeight: '700' }}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[modalStyles.actionButton, { backgroundColor: '#ef4444', marginLeft: 8 }]} onPress={() => deleteSchedule(item.id)}>
                              <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  )}

                  <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity style={[modalStyles.modalButton, { backgroundColor: '#ddd' }]} onPress={closeScheduleModal}>
                      <Text style={{ fontWeight: '700' }}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Floating Schedule Button (FAB) */}
        <TouchableOpacity style={styles.fab} onPress={openScheduleModal} activeOpacity={0.9}>
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>Schedule</Text>
        </TouchableOpacity>
        {/* Toast */}
        {toastVisible && (
          <Animated.View
            pointerEvents="none"
            style={[
              toastStyles.toast,
              {
                opacity: toastAnim,
                transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                backgroundColor: toastType === 'success' ? '#16a34a' : toastType === 'error' ? '#ef4444' : '#374151',
              },
            ]}>
            <Text style={{ color: 'white', fontWeight: '600' }}>{toastMessage}</Text>
          </Animated.View>
        )}
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

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalView: {
    width: '92%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#f3f4f6', borderRadius: 999 },
  pillActive: { backgroundColor: '#d1fae5' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, width: '100%' },
  modalButton: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, marginRight: 8 },
  smallToggle: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#f3f4f6', borderRadius: 8 },
  smallToggleActive: { backgroundColor: '#c7ddff' },
  modalListItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#eef2ff' },
  actionButton: { backgroundColor: '#2563eb', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
});

const toastStyles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    elevation: 8,
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