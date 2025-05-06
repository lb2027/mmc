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
          router.replace('/screen/admin/adminpage');
        } else if (role === 'staff') {
          router.replace('/screen/staff/staffpage');
        } else {
          router.replace('/screen/user/userpage');
        }
        
      } else {
        router.replace('/screen/init/splash'); // Redirect to splash screen if not authenticated
        //router.replace('/screen/form/form');
      }
    };

    checkAuth();
  }, []);

  return null;
}
