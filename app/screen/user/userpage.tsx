import { View, Text, Button, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserPage() {
  const router = useRouter();

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('role');
  
      Alert.alert('Logout Successful', 'You have been logged out.');
  
      router.replace('/'); // ke '/' kalau login di index
      // atau
      // router.replace('/login'); // ke '/login' kalau pindah loginpage
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };
  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>User Page</Text>

      <Button
        title="Logout"
        onPress={() =>
          Alert.alert(
            'Confirm Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: logout }
            ]
          )
        }
      />

    </View>
  );
}
