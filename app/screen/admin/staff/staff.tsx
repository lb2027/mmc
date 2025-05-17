import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import {
  View, Text, FlatList, ActivityIndicator, Dimensions,
  Alert, TouchableOpacity, TextInput, Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const screenWidth = Dimensions.get('window').width;

interface Staff {
  id: number;
  nama: string;
  no_hp: string;
  alamat: string;
  email: string;
  status_kerja: string;
  user_id: number;
  tanggal_lahir: string;
}

export default function StaffPage() {
  const router = useRouter();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = 'http://103.16.116.58:5050';

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useFocusEffect(
    useCallback(() => {
      fetchStaff();
    }, [])
  );


  const fetchStaff = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        router.replace('/');
        return;
      }

      const response = await fetch('${baseUrl}/staff', {
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch staff data.');

      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      setStaffList(list);
      setFilteredStaff(list);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch staff data.');
      console.error(error);
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

  const handleSearchToggle = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchText('');
      setFilteredStaff(staffList);
      Keyboard.dismiss();
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    const filtered = staffList.filter((staff) =>
      staff.nama.toLowerCase().includes(text.toLowerCase()) ||
      staff.email.toLowerCase().includes(text.toLowerCase()) ||
      staff.no_hp.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredStaff(filtered);
  };

  const renderCard = ({ item }: { item: Staff }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: 'screen/admin/staff/detail',
          params: { staff: JSON.stringify(item) },
        })
      }
      style={{
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 10,
        width: screenWidth - 20,
        alignSelf: 'center',
        elevation: 2,
      }}
    >
      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 16 }}>{item.nama}</Text>
      <Text style={{ fontFamily: 'Poppins_400Regular' }}>Email: {item.email}</Text>
      <Text style={{ fontFamily: 'Poppins_400Regular' }}>No HP: {item.no_hp}</Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={{ flex: 1, width: screenWidth, paddingHorizontal: 10 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingBottom: 10,
          backgroundColor: '#F3AA36',
          paddingHorizontal: 15,
          borderBottomLeftRadius: 15,
          borderBottomRightRadius: 15,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            color: 'white',
            fontFamily: 'Poppins_700Bold',
          }}
        >
          Staff
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleSearchToggle}
            style={{ marginRight: 20 }}
            accessibilityLabel="Search staff"
          >
            <Ionicons name={searchVisible ? 'close' : 'search'} size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={logout} accessibilityLabel="Logout">
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      {searchVisible && (
        <View
          style={{
            backgroundColor: '#fff',
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderColor: '#ddd',
          }}
        >
          <TextInput
            autoFocus
            placeholder="Search by name, email, or phone..."
            value={searchText}
            onChangeText={handleSearchChange}
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: 10,
              paddingHorizontal: 15,
              paddingVertical: 10,
              fontSize: 16,
              fontFamily: 'Poppins_400Regular',
            }}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredStaff}
          numColumns={1}
          key={1}
          keyExtractor={(item, index) => item?.id?.toString() ?? `staff-${index}`}
          renderItem={renderCard}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 60 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}
