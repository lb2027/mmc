import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function UserDetail() {
  const { user } = useLocalSearchParams();
  const router = useRouter();

  const userData = typeof user === 'string' ? JSON.parse(user) : user;
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    Username: userData.username,
    Password: userData.password,
    Role: userData.role,
  });

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://103.16.116.58:5050/updateuser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify({
          id: userData.id,  // fixed from user_id
          Username: form.Username,
          Password: form.Password,
          Role: form.Role,
        }),
      });
  
      // Only try parsing if there's body
      const text = await response.text();
      if (text) {
        console.log("Update response:", text);
        // Optionally parse if it's JSON
        try {
          const json = JSON.parse(text);
          console.log("Parsed JSON:", json);
        } catch {
          // Not JSON — that's fine
        }
      }
  
      Alert.alert('Success', 'User updated.');
      setModalVisible(false);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update user.');
    }
  };
  

  const handleDelete = async () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch('http://103.16.116.58:5050/deleteuser', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                token: token ?? '',
              },
              body: JSON.stringify({ id: userData.id }), // Make sure this uses "id", not "user_id"
            });
  
            const text = await response.text();
            if (text) {
              console.log("Delete response:", text);
              try {
                const json = JSON.parse(text);
                console.log("Parsed JSON:", json);
              } catch {
                // Not JSON — safe to ignore
              }
            }
  
            Alert.alert('Deleted', 'User deleted.');
            router.back();
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to delete user.');
          }
        },
      },
    ]);
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 20 }}>
        <Text style={styles.label}>Username:</Text>
        <Text style={styles.value}>{userData.username}</Text>

        <Text style={styles.label}>Password:</Text>
        <Text style={styles.value}>{userData.password}</Text>

        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{userData.role}</Text>
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <AntDesign name="edit" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, { backgroundColor: '#e74c3c' }]} onPress={handleDelete}>
          <AntDesign name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Modal for update */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Update User</Text>

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={form.Username}
              onChangeText={(val) => setForm({ ...form, Username: val })}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={form.Password}
              onChangeText={(val) => setForm({ ...form, Password: val })}
            />
            <TextInput
              style={styles.input}
              placeholder="Role"
              value={form.Role}
              onChangeText={(val) => setForm({ ...form, Role: val })}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Update" onPress={handleUpdate} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    marginTop: 15,
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    flexDirection: 'column',
    gap: 15,
  },
  fab: {
    backgroundColor: '#3498db',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});
