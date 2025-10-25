import { useEffect, useState, useCallback } from 'react';
import { ref, onValue, set, push, remove, get } from 'firebase/database';
import { database, RelayState, Schedule } from '@/lib/firebase';

// Custom hook for relay state management
export function useRelays() {
  const [relays, setRelays] = useState<RelayState>({
    relay1: false,
    relay2: false,
    relay3: false,
    relay4: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial relay states
  useEffect(() => {
    const relaysRef = ref(database, 'relays');
    const unsubscribe = onValue(relaysRef, (snapshot) => {
      try {
        const data = snapshot.val() as Partial<RelayState> | null;
        if (data) {
          setRelays(prev => ({ ...prev, ...data }));
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load relay states');
        setLoading(false);
      }
    }, (error) => {
      setError('Connection error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Toggle relay with optimistic updates
  const toggleRelay = useCallback(async (relayName: keyof RelayState, deviceName: string) => {
    try {
      const newState = !relays[relayName];

      // Optimistic update
      setRelays(prev => ({ ...prev, [relayName]: newState }));

      // Update Firebase
      await set(ref(database, `relays/${relayName}`), newState);

      // Update schedule enabled state
      await set(ref(database, `scheduleEnabled/${relayName}`), newState);

      return { success: true, message: `${deviceName} turned ${newState ? 'ON' : 'OFF'}` };
    } catch (error) {
      // Revert optimistic update on error
      setRelays(prev => ({ ...prev, [relayName]: !relays[relayName] }));
      throw new Error('Failed to control device');
    }
  }, [relays]);

  return { relays, loading, error, toggleRelay };
}

// Custom hook for schedule management
export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const schedulesRef = ref(database, 'schedules');
    const unsubscribe = onValue(schedulesRef, (snapshot) => {
      try {
        const val = snapshot.val();
        if (!val) {
          setSchedules([]);
        } else {
          const items = Object.entries(val).map(([id, data]) => ({
            id,
            ...(data as Omit<Schedule, 'id'>)
          }));
          items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setSchedules(items);
        }
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load schedules');
        setLoading(false);
      }
    }, (error) => {
      setError('Connection error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const saveSchedule = useCallback(async (time: string, action: 'ON' | 'OFF') => {
    try {
      const schedulesRef = ref(database, 'schedules');
      const newRef = push(schedulesRef);
      await set(newRef, {
        relay: 'ALL',
        time,
        action,
        createdAt: Date.now(),
      });
      return { success: true, message: `Will turn ALL relays ${action} at ${time}` };
    } catch (error) {
      throw new Error('Failed to save schedule');
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      await remove(ref(database, `schedules/${id}`));
      return { success: true, message: 'Schedule deleted' };
    } catch (error) {
      throw new Error('Failed to delete schedule');
    }
  }, []);

  const updateSchedule = useCallback(async (id: string, time: string, action: 'ON' | 'OFF') => {
    try {
      await set(ref(database, `schedules/${id}`), {
        relay: 'ALL',
        time,
        action,
        createdAt: Date.now(),
      });
      return { success: true, message: 'Schedule updated' };
    } catch (error) {
      throw new Error('Failed to update schedule');
    }
  }, []);

  return { schedules, loading, error, saveSchedule, deleteSchedule, updateSchedule };
}

// Custom hook for schedule enabled states
export function useScheduleEnabled() {
  const [scheduleEnabled, setScheduleEnabled] = useState<RelayState>({
    relay1: false,
    relay2: false,
    relay3: false,
    relay4: false,
  });

  useEffect(() => {
    const scheduleEnabledRef = ref(database, 'scheduleEnabled');
    const unsubscribe = onValue(scheduleEnabledRef, (snapshot) => {
      const data = snapshot.val() as Partial<RelayState> | null;
      if (data) {
        setScheduleEnabled(prev => ({ ...prev, ...data }));
      }
    });

    return () => unsubscribe();
  }, []);

  return scheduleEnabled;
}

// Custom hook for connection status
export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [lastPing, setLastPing] = useState(Date.now());

  useEffect(() => {
    const connectedRef = ref(database, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val() === true;
      setIsConnected(connected);
      if (connected) {
        setLastPing(Date.now());
      }
    });

    return () => unsubscribe();
  }, []);

  return { isConnected, lastPing };
}