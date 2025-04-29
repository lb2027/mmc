import React from 'react';
import { View, Text, Button, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

export default function PageA() {
  const router = useRouter();

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'username', 'role']);
      Alert.alert('Logged Out', 'You have been logged out.');
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Logout failed.');
    }
  };

  return (
    <View style={{ width: screenWidth, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 32, marginBottom: 20 }}>Page A</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
