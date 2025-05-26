import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 360;

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
  const [showDatePicker, setShowDatePicker] = useState(false);

    const handleRegister = async () => {
    try {
      console.log('🔐 Logging in as rayhan...');
      const loginRes = await fetch('http://103.16.116.58:5050/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'rayhan', password: '12345678' }),
      });

      const loginData = await loginRes.json();
      const token = loginData.token;
      if (!token) {
        Alert.alert('Login Failed', 'Could not retrieve token.');
        return;
      }

      console.log('✅ Login success. Token:', token);

      // Step 1: Add user
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
          role: 'staff',
        }),
      });

      const userResult = await userRes.json();
      console.log('User add response:', userResult);

      if (!userRes.ok) {
        Alert.alert('Failed', userResult.message || 'Failed to add user.');
        return;
      }

      // Step 2: Find user ID by username
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
        Alert.alert('Error', 'Newly created user not found.');
        return;
      }

      const user_id = newUser.id;
      console.log('✅ Found new user ID:', user_id);

      // Step 3: Add staff using correct user_id
      console.log('📤 Sending addstaff request...');
      const staffRes = await fetch('http://103.16.116.58:5050/addstaff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token,
        },
        body: JSON.stringify({
          nama: form.nama,
          id: user_id,           // used as staff.id
          user_id: user_id,      // linked to user table
          no_hp: form.no_hp,
          alamat: form.alamat,
          email: form.email,
          status_kerja: 'staff',
          tanggal_lahir: formatDate(form.tanggal_lahir),
        }),
      });

      const staffData = await staffRes.json();
      console.log('Staff add response:', staffData);

      if (!staffRes.ok) {
        Alert.alert('Error', 'Failed to register staff.');
        return;
      }

      Alert.alert('Success', 'User & staff successfully registered!', [
        {
          text: 'OK',
          onPress: () => router.replace('./login'),
        },
      ]);

      setForm({
        username: '',
        password: '',
        nama: '',
        no_hp: '',
        alamat: '',
        email: '',
        tanggal_lahir: '',
      });

    } catch (err) {
      console.error('❌ Register error:', err);
      Alert.alert('Error', 'Something went wrong during registration.');
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ backgroundColor: '#F3AA36' }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' ,paddingBottom: 40,paddingTop: 40,paddingHorizontal: 6}}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.formContainer}>
              <Text style={styles.title}>BINTANG{"\n"}JAYA</Text>
              {/* Your input fields */}
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
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: form.tanggal_lahir ? '#000' : '#888',
                  }}
                >
                  {form.tanggal_lahir || 'Select Date of Birth'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('./login')}>
                <Text style={styles.loginText}>Already have account?</Text>
              </TouchableOpacity>
            </View>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={
                form.tanggal_lahir ? new Date(form.tanggal_lahir) : new Date()
              }
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  const isoDate = selectedDate.toISOString().split('T')[0];
                  handleChange('tanggal_lahir', isoDate);
                }
              }}
            />
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );

};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3AA36',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: isSmallDevice ? 24 : 32,
    fontFamily: 'Poppins_700Bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: isSmallDevice ? 15 : 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  input: {
    backgroundColor: '#F0F0F0',
    padding: isSmallDevice ? 12 : 15,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: 'Poppins_400Regular',
  },
  button: {
    backgroundColor: '#363636',
    paddingVertical: isSmallDevice ? 12 : 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: isSmallDevice ? 14 : 16,
    fontFamily: 'Poppins_700Bold',
  },
  loginText: {
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
    fontSize: isSmallDevice ? 13 : 14,
    fontFamily: 'Poppins_400Regular',
  },
});

export default RegisterScreen;