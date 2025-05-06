import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, Dimensions, Alert, Modal, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const screenWidth = Dimensions.get('window').width;

export default function PageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false); // new state
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: '',
  });

  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://103.16.116.58:5050/selectuser', {
        headers: { token: token ?? '' },
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'username', 'role']);
      Alert.alert('Logged Out', 'You have been logged out.');
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Logout failed.');
    }
  };

  const handleCreateUser = async () => {
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

      if (response.ok) {
        const result = await response.text();
        if (!result || JSON.parse(result)) {
          Alert.alert('Success', 'User successfully added!');
          setShowModal(false);
          setNewUser({ username: '', password: '', role: '' });
          fetchUsers();
        } else {
          Alert.alert('Failed', 'There was an error while adding the user.');
        }
      } else {
        Alert.alert('Failed', 'There was an error while adding the user.');
      }
    } catch (error) {
      console.error('Create error:', error);
      Alert.alert('Failed', 'There was an error while adding the user.');
    }
  };

  const UserCard = ({ item }: { item: any }) => {
    const [showPassword, setShowPassword] = useState(false);
    const cardColor = item.role === 'admin' ? '#ffe0b2' : '#f0f0f0';

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: 'screen/admin/user/detail',
            params: { user: JSON.stringify(item) },
          })
        }
        style={{
          backgroundColor: cardColor,
          borderRadius: 10,
          padding: 10,
          marginVertical: 5,
          width: '100%',
        }}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 16 }}>
            {item.username}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              fontStyle: 'italic',
              fontSize: 12,
              color: '#444',
            }}
          >
            {item.role}
          </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 5,
        }}>
          <Text style={{ flex: 1 }}>
            {showPassword ? item.password : '•'.repeat(item.password?.length || 8)}
          </Text>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={{ flex: 1, width: screenWidth, paddingHorizontal: 10 }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 10,
        backgroundColor: '#F3AA36',
        paddingHorizontal: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
      }}>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 24, color: 'white' }}>Users</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{
              backgroundColor: 'white',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8
            }}>
            <Text style={{ color: '#F3AA36', fontFamily: 'Poppins_700Bold' }}>+ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          numColumns={1}
          keyExtractor={(item, index) => item.user_id?.toString() ?? index.toString()}
          renderItem={({ item }) => <UserCard item={item} />}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 60 }}
        />
      )}

      {/* Modal */}
      <Modal visible={showModal} animationType="fade" transparent>
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <View style={{
            width: '85%', backgroundColor: 'white',
            borderRadius: 16, padding: 20, elevation: 5
          }}>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>
              Add a new User
            </Text>

            <TextInput
              placeholder="Username"
              value={newUser.username}
              onChangeText={(text) => setNewUser({ ...newUser, username: text })}
              style={{
                borderWidth: 1, borderColor: '#ccc',
                borderRadius: 8, padding: 10, marginBottom: 10
              }}
            />

            <TextInput
              placeholder="Password"
              secureTextEntry
              value={newUser.password}
              onChangeText={(text) => setNewUser({ ...newUser, password: text })}
              style={{
                borderWidth: 1, borderColor: '#ccc',
                borderRadius: 8, padding: 10, marginBottom: 10
              }}
            />

            {/* Role Dropdown */}
            <TouchableOpacity
              onPress={() => setShowRoleDropdown(!showRoleDropdown)}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
                justifyContent: 'center'
              }}
            >
              <Text style={{ color: newUser.role ? 'black' : '#aaa' }}>
                {newUser.role || 'Select Role'}
              </Text>
            </TouchableOpacity>

            {showRoleDropdown && (
              <View style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                marginBottom: 10,
                backgroundColor: 'white'
              }}>
                {['admin', 'staff'].map((roleOption) => (
                  <TouchableOpacity
                    key={roleOption}
                    onPress={() => {
                      setNewUser({ ...newUser, role: roleOption });
                      setShowRoleDropdown(false);
                    }}
                    style={{ padding: 10 }}
                  >
                    <Text style={{ fontFamily: 'Poppins_400Regular' }}>{roleOption}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Pressable
                onPress={handleCreateUser}
                style={{
                  backgroundColor: '#F3AA36',
                  padding: 10,
                  borderRadius: 8,
                  flex: 1,
                  marginRight: 10,
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontFamily: 'Poppins_700Bold', color: 'white', fontWeight: 'bold' }}>Add</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowModal(false)}
                style={{
                  backgroundColor: '#ccc',
                  padding: 10,
                  borderRadius: 8,
                  flex: 1,
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontFamily: 'Poppins_700Bold', fontWeight: 'bold' }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
