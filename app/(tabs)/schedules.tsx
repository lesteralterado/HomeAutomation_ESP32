import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Firebase config must match the one used in SmartHome
const firebaseConfig = {
  apiKey: "AIzaSyAYVPxNpPxKOS2G0H9bLQCi2V1mDfm95Zs",
  authDomain: "home-automation-esp-d7d8c.firebaseapp.com",
  databaseURL: "https://home-automation-esp-d7d8c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "home-automation-esp-d7d8c",
  storageBucket: "home-automation-esp-d7d8c.firebasestorage.app",
  messagingSenderId: "900577873605",
  appId: "1:900577873605:web:0969e0a0d35b5fbdacaaac"
};

// initialize a separate app instance (safe if multiple initializations occur)
let firebaseApp: any;
try {
  firebaseApp = initializeApp(firebaseConfig);
} catch (e) {
  // ignore if already initialized elsewhere
}
const database = getDatabase(firebaseApp);

export default function SchedulesScreen() {
  const colorScheme = useColorScheme();
  const [schedules, setSchedules] = useState<Array<{ id: string; relay: string; time: string; action: string; createdAt?: number }>>([]);
  const router = useRouter();

  useEffect(() => {
    const schedulesRef = ref(database, 'schedules');
    const unsub = onValue(schedulesRef, snapshot => {
      const val = snapshot.val();
      if (!val) {
        setSchedules([]);
        return;
      }
      const items = Object.entries(val).map(([id, data]) => ({ id, ...(data as any) }));
      items.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      setSchedules(items as any);
    });
    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }] }>
      <Text style={styles.title}>Scheduled Actions</Text>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {schedules.length === 0 ? (
          <Text style={styles.empty}>No schedules yet.</Text>
        ) : (
          schedules.map(s => (
            <View key={s.id} style={styles.item}>
              <View style={styles.itemLeft}>
                <IconSymbol size={24} name="clock" color="#6b7280" />
                <View>
                  <Text style={styles.itemTitle}>{s.time} — ALL Relays</Text>
                  <Text style={styles.itemSubtitle}>{s.action} • {s.createdAt ? new Date(s.createdAt).toLocaleString() : '—'}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.delete} onPress={() => router.push({ pathname: '/components/SmartHome', params: { scheduleId: s.id } }) }>
                <Text style={{ color: 'white', fontWeight: '700' }}>Manage</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: '800', padding: 16 },
  empty: { color: '#6b7280', padding: 16 },
  item: { backgroundColor: 'white', borderRadius: 10, padding: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTitle: { fontWeight: '800' },
  itemSubtitle: { color: '#6b7280' },
  delete: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 }
});