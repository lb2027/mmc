import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';

const RegisterScreen = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    nama: '',
    no_hp: '',
    alamat: '',
    email: '',
    tanggal_lahir: '',
  });

  const handleChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const formatDate = (dateStr: string) => {
    // Just a placeholder to make sure date is YYYY-MM-DD
    return dateStr;
  };

  const handleRegister = async () => {
    try {
      console.log('🔐 Logging in as mdr...');
      const loginRes = await fetch('http://103.16.116.58:5050/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'mdr', password: 'mdr' }),
      });

      const loginData = await loginRes.json();
      const token = loginData.token;
      console.log('✅ Login success. Token:', token);

      console.log('📤 Sending adduser request...');
      const userRes = await fetch('http://103.16.116.58:5050/adduser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          role: 'admin',
        }),
      });

      const userResult = await userRes.json();
      console.log('User add response:', userResult);

      if (userRes.ok) {
        console.log('📥 Fetching all users to find new user ID...');
        const selectUserRes = await fetch('http://103.16.116.58:5050/selectuser', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            token,
          },
        });
        const users = await selectUserRes.json();

        const newUser = users.find((u: any) => u.username === form.username);
        if (!newUser) {
          Alert.alert('Error', 'New user not found after creation.');
          return;
        }
        const user_id = newUser.id;
        console.log('Found new user ID:', user_id);

        console.log('📤 Sending addstaff request...');
        const staffRes = await fetch('http://103.16.116.58:5050/addstaff', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token,
          },
          body: JSON.stringify({
            nama: form.nama,
            id: user_id,
            user_id,
            no_hp: form.no_hp,
            alamat: form.alamat,
            email: form.email,
            status_kerja: 'staff',
            tanggal_lahir: formatDate(form.tanggal_lahir),
          }),
        });

        const staffData = await staffRes.json();
        console.log('Staff add response:', staffData);
        Alert.alert('Success', 'User & staff successfully registered!');
        // Reset form if needed
        setForm({
          username: '',
          password: '',
          nama: '',
          no_hp: '',
          alamat: '',
          email: '',
          tanggal_lahir: '',
        });
      } else {
        Alert.alert('Failed', 'Failed to add user.');
      }
    } catch (err) {
      console.error('❌ Register error:', err);
      Alert.alert('Error', 'Something went wrong during registration.');
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Register New Staff</Text> */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={form.username}
          onChangeText={(text) => handleChange('username', text)}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={form.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={form.nama}
          onChangeText={(text) => handleChange('nama', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={form.no_hp}
          onChangeText={(text) => handleChange('no_hp', text)}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={form.alamat}
          onChangeText={(text) => handleChange('alamat', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          value={form.tanggal_lahir}
          onChangeText={(text) => handleChange('tanggal_lahir', text)}
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
});

export default RegisterScreen;
