// app/splash.tsx
import { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    // Animate text running from left to right
    Animated.timing(translateX, {
      toValue: 300,
      duration: 5000,
      useNativeDriver: true,
    }).start();

    // Delay 5s then redirect
    const timeout = setTimeout(async () => {
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
        router.replace('/screen/auth/login');
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, { transform: [{ translateX }] }]}>
        Bintang Jaya
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3AA36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
