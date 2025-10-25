import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StyleSheet
} from 'react-native';
import { Schedule } from '@/lib/firebase';

interface ScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  schedules: Schedule[];
  onSave: (time: string, action: 'ON' | 'OFF') => Promise<{ success: boolean; message: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; message: string }>;
  onUpdate: (id: string, time: string, action: 'ON' | 'OFF') => Promise<{ success: boolean; message: string }>;
  editingId?: string | null;
  onStartEditing?: (schedule: Schedule) => void;
}

export function ScheduleModal({
  visible,
  onClose,
  schedules,
  onSave,
  onDelete,
  onUpdate,
  editingId,
  onStartEditing
}: ScheduleModalProps) {
  const [modalMode, setModalMode] = useState<'add' | 'list'>('add');
  const [scheduleTime, setScheduleTime] = useState('18:30');
  const [scheduleAction, setScheduleAction] = useState<'ON' | 'OFF'>('ON');

  const handleSave = async () => {
    if (!/^\d{1,2}:\d{2}$/.test(scheduleTime)) {
      alert('Enter time in HH:MM format (e.g. 07:30)');
      return;
    }

    const parts = scheduleTime.split(':');
    const hh = parts[0].padStart(2, '0');
    const mm = parts[1];
    const normalizedTime = `${hh}:${mm}`;

    try {
      let result;
      if (editingId) {
        result = await onUpdate(editingId, normalizedTime, scheduleAction);
      } else {
        result = await onSave(normalizedTime, scheduleAction);
      }

      if (result.success) {
        alert(result.message);
        resetForm();
        onClose();
      }
    } catch (error) {
      alert('Failed to save schedule');
    }
  };

  const resetForm = () => {
    setScheduleTime('18:30');
    setScheduleAction('ON');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this schedule?')) {
      try {
        const result = await onDelete(id);
        if (result.success) {
          alert(result.message);
        }
      } catch (error) {
        alert('Failed to delete schedule');
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
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
                <Text style={{ marginBottom: 4, textAlign: 'center', fontSize: 16, fontWeight: '600' }}>Schedule ALL Relays</Text>
                <Text style={{ marginBottom: 12, textAlign: 'center', color: '#6b7280' }}>This schedule will control all devices at once</Text>
              </View>

              <View style={{ width: '100%', marginBottom: 8 }}>
                <Text style={{ marginBottom: 4 }}>Time (HH:MM)</Text>
                <TextInput
                  style={modalStyles.input}
                  value={scheduleTime}
                  onChangeText={setScheduleTime}
                  keyboardType="numeric"
                  placeholder="18:30"
                />
              </View>

              <View style={{ width: '100%', marginBottom: 12 }}>
                <Text style={{ marginBottom: 4 }}>Action</Text>
                <View style={modalStyles.row}>
                  <Pressable
                    style={[modalStyles.pill, scheduleAction === 'ON' && modalStyles.pillActive]}
                    onPress={() => setScheduleAction('ON')}
                  >
                    <Text>Turn ALL ON</Text>
                  </Pressable>
                  <Pressable
                    style={[modalStyles.pill, scheduleAction === 'OFF' && modalStyles.pillActive]}
                    onPress={() => setScheduleAction('OFF')}
                  >
                    <Text>Turn ALL OFF</Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={modalStyles.modalButton} onPress={handleSave}>
                  <Text style={{ color: 'white', fontWeight: '700' }}>{editingId ? 'Update' : 'Save'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[modalStyles.modalButton, { backgroundColor: '#ddd' }]} onPress={onClose}>
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
                        <Text style={{ fontWeight: '700' }}>{item.time} — ALL Relays</Text>
                        <Text style={{ color: '#6b7280' }}>{item.action}</Text>
                      </View>
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity
                          style={modalStyles.actionButton}
                          onPress={() => onStartEditing?.(item)}
                        >
                          <Text style={{ color: '#fff', fontWeight: '700' }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[modalStyles.actionButton, { backgroundColor: '#ef4444', marginLeft: 8 }]}
                          onPress={() => handleDelete(item.id)}
                        >
                          <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}

              <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity style={[modalStyles.modalButton, { backgroundColor: '#ddd' }]} onPress={onClose}>
                  <Text style={{ fontWeight: '700' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

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