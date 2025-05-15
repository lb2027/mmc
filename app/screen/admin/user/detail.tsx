// UserDetail.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function UserDetail() {
  const { user } = useLocalSearchParams();
  const router = useRouter();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
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
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch('http://103.16.116.58:5050/deleteuser', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                token: token ?? '',
              },
              body: JSON.stringify({ id: userData.id }),
            });

            const text = await response.text();
            if (text) console.log('Delete response:', text);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f9' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.header}>User Detail</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{userData.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Password</Text>
            <Text style={styles.value}>{userData.password}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{userData.role}</Text>
          </View>
        </View>

        {/* Buttons at Bottom */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.btnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update User</Text>
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
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
              >
                <Text style={styles.dropdownButtonText}>
                  {form.Role || 'Select Role'}
                </Text>
              </TouchableOpacity>

              {showRoleDropdown && (
                <View style={styles.dropdownOptions}>
                  {['admin', 'staff'].map((roleOption) => (
                    <TouchableOpacity
                      key={roleOption}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setForm({ ...form, Role: roleOption });
                        setShowRoleDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{roleOption}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>


            

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                <Text style={styles.btnText}>Update</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  editBtn: {
    backgroundColor: '#F3AA36',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  deleteBtn: {
    backgroundColor: '#F3AA36',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#F3AA36',
    padding: 12,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  
  dropdownOptions: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 4,
    overflow: 'hidden',
  },
  
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  
});