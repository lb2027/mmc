// app/splash.tsx
import { useEffect, useRef } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

export default function SplashScreen() {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(-300)).current;

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

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
          router.replace('/screen/admin/admindashboard');
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
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // or a loading indicator
  }

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
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
});
