import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '' });
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://103.16.116.58:5050/selectuser', {
        headers: { token: token ?? '' },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        Alert.alert('Error', 'Data pengguna tidak valid.');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      Alert.alert('Error', 'Gagal mengambil data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  const renderUser = ({ item }: { item: any }) => {
    const cardColor = item.role === 'admin' ? '#ffcccc' : '#ccffcc';

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: 'screen/admin/user/detail',
            params: { user: JSON.stringify(item) },
          })
        }
        style={{
          width: width - 20,
          alignSelf: 'center',
          padding: 15,
          marginVertical: 8,
          backgroundColor: cardColor,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.username}</Text>
        <Text>Role: {item.role}</Text>
      </TouchableOpacity>
    );
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'username', 'role']);
      Alert.alert('Logged Out', 'You have been logged out.');
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Logout failed.');
    }
  };

  const handleAddUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://103.16.116.58:5050/adduser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify(newUser),
      });
  
      const data = await response.json();
  
      // Log the full response to debug the structure
      console.log('Add User Response:', data);
  
      // Check for success status in the response
      if (data?.status === 'success') {
        Alert.alert('', 'User added successfully!');
        fetchUsers(); // Refresh user list after adding new user
        setModalVisible(false);
      } else {
        // If there's an issue in response even if the data is added, show the error
        Alert.alert('', data?.message || 'Failed to add user.');
      }
    } catch (error) {
      console.error('Add user error:', error);
      Alert.alert('Error', 'Failed to add user.');
    }
  };
  
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ width: width, paddingTop: 20 }}>
        <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 10 }}>
          Daftar Pengguna
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 20 }}
            data={users}
            keyExtractor={(item, index) => item.user_id?.toString() ?? index.toString()}
            renderItem={renderUser}
          />
        )}
      </View>

      {/* Floating Action Buttons */}
      <View style={{ position: 'absolute', bottom: 30, right: 20, flexDirection: 'column', gap: 15 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#3498db',
            borderRadius: 30,
            padding: 15,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 5,
          }}
          onPress={() => setModalVisible(true)}
        >
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: '#e74c3c',
            borderRadius: 30,
            padding: 15,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 5,
          }}
          onPress={handleLogout}
        >
          <AntDesign name="logout" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Add User Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000aa' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' }}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Add User</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}
              placeholder="Username"
              value={newUser.username}
              onChangeText={(text) => setNewUser({ ...newUser, username: text })}
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}
              placeholder="Password"
              secureTextEntry
              value={newUser.password}
              onChangeText={(text) => setNewUser({ ...newUser, password: text })}
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 }}
              placeholder="Role"
              value={newUser.role}
              onChangeText={(text) => setNewUser({ ...newUser, role: text })}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 10 }}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddUser} style={{ padding: 10 }}>
                <Text>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
