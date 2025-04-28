import { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const response = await fetch('http://103.16.116.58:5050/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        Alert.alert('Login Failed', 'Username atau password salah.');
        return;
      }

      const data = await response.json();
      console.log('Login success, token:', data.token);

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('username', username);

      const token = await AsyncStorage.getItem('token');

      const userResponse = await fetch('http://103.16.116.58:5050/selectuser', {
        method: 'GET',
        headers: {
          'token': token,        
          'Content-Type': 'application/json',
        },
      });

      const users = await userResponse.json();
      console.log('Selectuser parsed response:', users);

      const foundUser = users.find((u) => u.username === username);

      if (!foundUser) {
        Alert.alert('Login Failed', 'User tidak ditemukan.');
        return;
      }

      const role = foundUser.role;
      console.log('User role:', role);

      await AsyncStorage.setItem('role', role);

      if (role === 'admin') {
        router.replace('screen/admin/adminpage');
      } else if (role === 'staff') {
        router.replace('screen/staff/staffpage');
      } else {
        router.replace('screen/user/userpage');
      }
    } catch (err) {
      console.error('Login Error:', err);
      Alert.alert('Error', 'Terjadi kesalahan saat login.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Login</Text>

      <Text>Username</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
        value={username}
        onChangeText={setUsername}
      />

      <Text>Password</Text>
      <TextInput
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Login" onPress={login} />

      <Text style={styles.link} onPress={() => router.push('/register')}>
        Don't have an account? Create one
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  link: { marginTop: 20, textAlign: 'center', color: 'blue' },
});
