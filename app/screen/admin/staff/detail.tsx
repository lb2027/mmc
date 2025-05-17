import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import {
  View,
  Text,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function StaffDetail() {
  const { staff } = useLocalSearchParams();
  const initialStaffData = typeof staff === 'string' ? JSON.parse(staff) : staff;
  const [staffData, setStaffData] = useState(initialStaffData);

  if (!staffData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: Staff data not found.</Text>
      </View>
    );
  }
  const [salaries, setSalaries] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newSalary, setNewSalary] = useState({
    bulan_gaji: '',
    gaji_perbulan: '',
    tanggal_transfer: '',
    keterangan: '',
  });
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showTransferDatePicker, setShowTransferDatePicker] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editStaffData, setEditStaffData] = useState({ ...staffData });

useFocusEffect(
  useCallback(() => {
    const fetchSalaries = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://103.16.116.58:5050/getgaji', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token,
          },
        });

        const data = await response.json();
        const filtered = data
          .filter((item) => item.staff_id === staffData.id)
          .sort((a, b) => new Date(b.bulan_gaji).getTime() - new Date(a.bulan_gaji).getTime());

        setSalaries(filtered);
      } catch (err) {
        console.error('Failed to fetch salaries:', err);
      }
    };

    fetchSalaries();
  }, [staffData.id])
);


  const handleDeleteStaff = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this staff?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch('http://103.16.116.58:5050/deletestaff', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  token: token ?? '',
                },
                body: JSON.stringify({ id: staffData.id }),
              });

              const text = await response.text();
              console.log('Delete Response:', text);
              Alert.alert('Deleted', 'Staff has been deleted.');
              setEditModalVisible(false);
              // You might want to navigate back after deletion
              // For example: router.back(); (if using Expo Router)
            } catch (error) {
              console.error('Delete Error:', error);
              Alert.alert('Error', 'Failed to delete staff.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditStaff = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch('http://103.16.116.58:5050/updatestaff', {
      method: 'POST', // or 'PUT' depending on API
      headers: {
        'Content-Type': 'application/json',
        token: token ?? '',
      },
      body: JSON.stringify(editStaffData),
    });

    const result = await response.text();
    console.log('Update Response:', result);

  setStaffData(editStaffData); 
  Alert.alert('Success', 'Staff details updated.');
  setEditModalVisible(false);
  } catch (error) {
    console.error('Update Error:', error);
    Alert.alert('Error', 'Failed to update staff.');
  }
  };

  const handleAddSalary = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://103.16.116.58:5050/addgaji', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify({
          staff_id: staffData.id,
          ...newSalary,
          gaji_perbulan: parseInt(newSalary.gaji_perbulan, 10),
        }),
      });

      const text = await response.text();
      if (text) console.log('Add Salary Response:', text);

      Alert.alert('Success', 'Salary added.');
      setAddModalVisible(false);
      setNewSalary({ bulan_gaji: '', gaji_perbulan: '', tanggal_transfer: '', keterangan: '' });

      const updated = await fetch('http://103.16.116.58:5050/getgaji', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
      });
      const updatedData = await updated.json();
      const filtered = updatedData
        .filter((item) => item.staff_id === staffData.id)
        .sort((a, b) => new Date(b.bulan_gaji).getTime() - new Date(a.bulan_gaji).getTime());
      setSalaries(filtered);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to add salary.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f9' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.header}>Staff Detail</Text>
            <TouchableOpacity onPress={() => {
              setEditStaffData(staffData);
              setEditModalVisible(true);
            }}>
              <Ionicons name="pencil" size={24} color="#F3AA36" />
            </TouchableOpacity>

          </View>
          <Text style={styles.label}>ID: {staffData.id}</Text>
          <Text style={styles.label}>Name: {staffData.nama}</Text>
          <Text style={styles.label}>Phone: {staffData.no_hp}</Text>
          <Text style={styles.label}>Email: {staffData.email}</Text>
          <Text style={styles.label}>Address: {staffData.alamat}</Text>
          <Text style={styles.label}>Status: {staffData.status_kerja}</Text>
        </View>

        {salaries.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.header}>Salary History</Text>
            {salaries.map((salary) => (
              <View key={salary.id} style={styles.salaryItem}>
                <Text style={styles.salaryText}>Month: {new Date(salary.bulan_gaji).toLocaleDateString()}</Text>
                <Text style={styles.salaryText}>Amount: Rp {salary.gaji_perbulan.toLocaleString()}</Text>
                <Text style={styles.salaryText}>Transfer Date: {new Date(salary.tanggal_transfer).toLocaleDateString()}</Text>
                <Text style={styles.salaryText}>Note: {salary.keterangan}</Text>
                <View style={styles.divider} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.header}>Salary History</Text>
            <Text style={styles.salaryText}>No salary records found.</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Salary Modal */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Salary</Text>
            <TouchableOpacity onPress={() => setShowMonthPicker(true)} style={styles.input}>
              <Text style={{ color: newSalary.bulan_gaji ? '#000' : '#aaa' }}>
                {newSalary.bulan_gaji || 'Select Month (e.g. 2025-05-01)'}
              </Text>
            </TouchableOpacity>
            {showMonthPicker && (
              <DateTimePicker
                value={newSalary.bulan_gaji ? new Date(newSalary.bulan_gaji) : new Date()}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  setShowMonthPicker(false);
                  if (selectedDate) {
                    setNewSalary({ ...newSalary, bulan_gaji: selectedDate.toISOString().split('T')[0] });
                  }
                }}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Amount (e.g. 1500000)"
              keyboardType="numeric"
              value={newSalary.gaji_perbulan}
              onChangeText={(val) => setNewSalary({ ...newSalary, gaji_perbulan: val })}
            />
            <TouchableOpacity onPress={() => setShowTransferDatePicker(true)} style={styles.input}>
              <Text style={{ color: newSalary.tanggal_transfer ? '#000' : '#aaa' }}>
                {newSalary.tanggal_transfer || 'Select Transfer Date (e.g. 2025-05-02)'}
              </Text>
            </TouchableOpacity>
            {showTransferDatePicker && (
              <DateTimePicker
                value={newSalary.tanggal_transfer ? new Date(newSalary.tanggal_transfer) : new Date()}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  setShowTransferDatePicker(false);
                  if (selectedDate) {
                    setNewSalary({ ...newSalary, tanggal_transfer: selectedDate.toISOString().split('T')[0] });
                  }
                }}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Notes"
              value={newSalary.keterangan}
              onChangeText={(val) => setNewSalary({ ...newSalary, keterangan: val })}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddSalary}>
                <Text style={styles.btnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
      {/* Edit Staff Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Staff</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editStaffData.nama}
              onChangeText={(val) => setEditStaffData({ ...editStaffData, nama: val })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={editStaffData.no_hp}
              onChangeText={(val) => setEditStaffData({ ...editStaffData, no_hp: val })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editStaffData.email}
              onChangeText={(val) => setEditStaffData({ ...editStaffData, email: val })}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={editStaffData.alamat}
              onChangeText={(val) => setEditStaffData({ ...editStaffData, alamat: val })}
            />
            <TextInput
              style={styles.input}
              placeholder="Employment Status"
              value={editStaffData.status_kerja}
              onChangeText={(val) => setEditStaffData({ ...editStaffData, status_kerja: val })}
            />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth (YYYY-MM-DD)"
              value={editStaffData.tanggal_lahir}
              onChangeText={(val) =>
                setEditStaffData({ ...editStaffData, tanggal_lahir: val })
              }
            />
            <View style={[styles.modalButtons, { flexDirection: 'column', gap: 10 }]}>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleEditStaff}>
                  <Text style={styles.btnText}>Save</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteStaff}>
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
    header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#F3AA36',
    },

  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  salaryItem: {
    marginBottom: 15,
  },
  salaryText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
    saveBtn: {
    backgroundColor: '#F3AA36',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    },

  btnText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
    fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#F3AA36',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    },

  fabText: {
    fontSize: 24,
    color: '#fff',
  },
  deleteBtn: {
    backgroundColor: '#E53935',
    padding: 10,
    borderRadius: 8,
  },

});
