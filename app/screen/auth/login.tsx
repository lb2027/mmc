import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const login = async () => {
    try {
      const response = await fetch('http://103.16.116.58:5050/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        Alert.alert('Login Failed', 'Username atau password salah.');
        return;
      }

      const data = await response.json();
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('username', username);

      const token = await AsyncStorage.getItem('token');
      const userResponse = await fetch('http://103.16.116.58:5050/selectuser', {
        method: 'GET',
        headers: { token, 'Content-Type': 'application/json' },
      });

      const users = await userResponse.json();
      const foundUser = users.find((u) => u.username === username);
      console.log("Found user:", foundUser);

      if (!foundUser) {
        Alert.alert('Login Failed', 'User tidak ditemukan.');
        return;
      }

      const { role, id } = foundUser;
      const staff_id = id; // 👈 store staff_id


      await AsyncStorage.setItem('role', role);
      if (staff_id !== undefined && staff_id !== null) {
        console.log('Storing staff_id:', staff_id); // ✅ now logs a real ID
        await AsyncStorage.setItem('staff_id', staff_id.toString());
      } else {
        console.warn('No staff_id found in user object');
      }

      if (role === 'admin') {
        router.replace('screen/admin/admindashboard');
      } else if (role === 'staff') {
        router.replace('screen/staff/attendancepage');
      } else {
        router.replace('screen/user/userpage');
      }
    } catch (err) {
      console.error('Login Error:', err);
      Alert.alert('Error', 'Terjadi kesalahan saat login.');
    }
  };

  if (!fontsLoaded) {
    return null; // or a spinner
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BINTANG{"\n"}JAYA</Text>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={login}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('./register')}>
          <Text style={styles.registerText}>New here? Register now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3AA36',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  button: {
    backgroundColor: '#363636',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  registerText: {
    color: '#000',
    textAlign: 'center',
    marginTop: 15,
    textDecorationLine: 'underline',
    fontFamily: 'Poppins_400Regular',
  },
});