import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AttendanceData {
  id: number;
  jam_keluar: string | null;
  jam_masuk: string;
  keterangan: string;
  nama: string;
  staff_id: number;
  status: string;
  tanggal: string;
}

interface AttendanceCardProps {
  selectedStaffId: number;
}

const themeColor = '#F3AA36';

const AttendanceCard: React.FC<AttendanceCardProps> = ({ selectedStaffId }) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

const fetchAttendance = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await fetch('http://103.16.116.58:5050/getabsensi', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token: token ?? '',
      },
    });

    const text = await response.text();
    console.log('Response text:', text); // Log raw response

    // Try parsing JSON safely
    let data = [];
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e.message);
      return;
    }

    const filtered = data.filter((item: AttendanceData) => item.staff_id === selectedStaffId);
    setAttendanceData(filtered);
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAttendance();
  }, [selectedStaffId]);

    const renderRow = (label: string, value: string) => (
    <View style={styles.row}>
        <Text style={styles.leftText}>{label}</Text>
        <Text style={styles.rightText}>{value}</Text>
    </View>
    );
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr || timeStr.startsWith('0000')) return '-';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: AttendanceData }) => (
    <View style={styles.item}>
      <Text style={styles.date}>{formatDate(item.tanggal)}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Masuk: {formatTime(item.jam_masuk)}</Text>
      <Text>Keluar: {formatTime(item.jam_keluar)}</Text>
      <Text>Keterangan: {item.keterangan}</Text>
    </View>
  );

  return (
  <View style={styles.container}>
    <View style={styles.card}>
      <Text style={styles.title}>Attendance History</Text>

      {loading ? (
        <ActivityIndicator size="large" color={themeColor} />
      ) : attendanceData.length === 0 ? (
        <Text>No attendance records found.</Text>
      ) : (
        <>
          {renderRow('Date', formatDate(attendanceData[0].tanggal))}
          {renderRow('Status', attendanceData[0].status)}

          {attendanceData.length > 1 && (
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.showMoreText}>Show All</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>

      {/* Modal for showing all attendance data */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Attendance Records</Text>
            <ScrollView>
              {attendanceData.map((item) => (
                <View key={item.id} style={styles.item}>
                  <Text style={styles.date}>{formatDate(item.tanggal)}</Text>
                  <Text>Status: {item.status}</Text>
                  <Text>Masuk: {formatTime(item.jam_masuk)}</Text>
                  <Text>Keluar: {formatTime(item.jam_keluar)}</Text>
                  <Text>Keterangan: {item.keterangan}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    maxHeight: 200,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: themeColor,
  },
  item: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  date: {
    fontWeight: '600',
    marginBottom: 4,
  },
  showMoreText: {
    marginTop: 6,
    fontStyle: 'italic',
    color: themeColor,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: themeColor,
  },
  closeButton: {
    backgroundColor: themeColor,
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  leftText: {
    fontWeight: '600',
    color: themeColor,
  },
  rightText: {
    color: '#555',
    flexShrink: 1,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
});

export default AttendanceCard;
