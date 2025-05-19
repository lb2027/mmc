import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [staffId, setStaffId] = useState<number | null>(null);
  const [hasAttended, setHasAttended] = useState(false);
  const hasRedirected = useRef(false); // prevent multiple redirects

  const todayDate = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

const checkAttendance = async () => {
  try {
    const storedId = await AsyncStorage.getItem('staff_id'); // user id
    const token = await AsyncStorage.getItem('token');
    console.log('Stored User ID:', storedId);
    console.log('Token:', token);

    if (!storedId || !token) {
      Alert.alert('Error', 'Missing user ID or token.');
      return;
    }

    const userId = parseInt(storedId, 10);

    // 1. Fetch staff data
    const staffRes = await fetch('http://103.16.116.58:5050/staff', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    });

    const staffData = await staffRes.json();
    console.log('Staff data received:', staffData);

    // 2. Find staff entry where user_id === storedId
    const matchedStaff = staffData.find((staff: any) => staff.user_id === userId);

    if (!matchedStaff) {
      Alert.alert('Error', 'No matching staff data found for this user.');
      setLoading(false);
      return;
    }

    // 3. Set matched staffId
    setStaffId(matchedStaff.id);

    // 4. Fetch attendance data
    console.log(`Fetching attendance data for staff ID: ${matchedStaff.id} on ${todayDate}`);

    const res = await fetch('http://103.16.116.58:5050/getabsensi', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
    });

    const data = await res.json();
    console.log('Attendance data received:', data);

    const attended = data.some(
      (item: any) =>
        item.staff_id === matchedStaff.id && item.tanggal.startsWith(todayDate)
    );

    console.log('Already attended today:', attended);
    setHasAttended(attended);
    setLoading(false);
  } catch (error) {
    console.error('Attendance check error:', error);
    Alert.alert('Error', 'Failed to check attendance.');
    setLoading(false);
  }
};



const markAttendance = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (!staffId || !token) {
      Alert.alert('Error', 'Missing staff ID or token.');
      return;
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 8); // "HH:MM:SS"
    const todayDate = now.toISOString().split('T')[0];  // "YYYY-MM-DD"

    // Define min and max time boundaries
    const minTime = new Date(`${todayDate}T08:00:00`); // Earliest "on time"
    const maxTime = new Date(`${todayDate}T08:15:00`); // Latest "on time"

    let keterangan = '';

    if (now < minTime) {
      keterangan = 'User datang terlalu cepat';
    } else if (now >= minTime && now <= maxTime) {
      keterangan = 'User datang tepat waktu';
    } else {
      const lateMinutes = Math.ceil((now.getTime() - maxTime.getTime()) / 60000);
      keterangan = `User telat ${lateMinutes} menit`;
    }

    console.log(`Marking attendance for staff ID: ${staffId} at ${currentTime}, keterangan: ${keterangan}`);

    const res = await fetch('http://103.16.116.58:5050/addabsensi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: token,
      },
      body: JSON.stringify({
        staff_id: staffId,
        tanggal: todayDate,
        jam_masuk: currentTime,
        status: 'Hadir',
        keterangan: keterangan,
      }),
    });

    const responseText = await res.text();

    if (!res.ok) {
      console.error('Mark attendance error response:', responseText);
      throw new Error('Failed to add attendance');
    }

    console.log('Attendance marked successfully:', responseText);
    Alert.alert('Success', 'Attendance marked successfully.');
    setHasAttended(true);
  } catch (error) {
    console.error('Mark attendance error:', error);
    Alert.alert('Error', 'Failed to mark attendance.');
  }
};



  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'username', 'role', 'staff_id']);
      Alert.alert('Logout Successful', 'You have been logged out.');
      router.replace('/');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to logout.');
    }
  };

  useEffect(() => {
    checkAttendance();
  }, []);

  useEffect(() => {
    if (hasAttended && !hasRedirected.current) {
      hasRedirected.current = true;
      console.log('Redirecting to staff page...');
      router.replace('./staffpage');
    }
  }, [hasAttended]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: 'white', marginTop: 10 }}>Checking attendance...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Attendance Required</Text>
        <TouchableOpacity style={styles.button} onPress={markAttendance}>
          <Text style={styles.buttonText}>Mark Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3AA36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#363636',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#363636',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 10,
  },
  logoutText: {
    color: '#F00',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
