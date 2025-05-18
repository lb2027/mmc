import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('role');

    if (token && role) {
      if (role === 'admin') {
        console.log('Routing to admin');
        router.replace('/screen/admin/adminpage');
      } else if (role === 'staff') {
        console.log('Routing to staff attendancepage');
        router.replace('/screen/staff/attendancepage');
      } else {
        console.log('Routing to user page');
        router.replace('/screen/user/userpage');
      }
    } else {
      console.log('No token or role, routing to splash');
      router.replace('/screen/init/splash');
    }
    };

    checkAuth();
  }, []);

  return null;
}
