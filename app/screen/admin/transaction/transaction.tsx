import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Dimensions,
  Alert, TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const screenWidth = Dimensions.get('window').width;

interface Transaksi {
  transaksi_id: number;
  nama_produk: string;
  harga: number;
  jumlah_terjual: number;
  total_harga: number;
  tanggal: string;
}

export default function PageC() {
  const router = useRouter();
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const baseUrl = 'http://103.16.116.58:5050';
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        router.replace('/');
        return;
      }

      const response = await fetch('${baseUrl}/selecttransaksi', {
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch transaction data.');

      const data = await response.json();
      setTransaksi(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch transaction.');
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

  const renderCard = ({ item }: { item: Transaksi }) => (
    <View style={{
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 10,
      margin: 5,
      flex: 1,
      maxWidth: (screenWidth / 2) - 15,
    }}>
      <Text style={{ fontFamily: 'Poppins_700Bold' }}>ID: {item.transaksi_id}</Text>
      <Text style={{ fontFamily: 'Poppins_400Regular' }}>Produk: {item.nama_produk}</Text>
      <Text style={{ fontFamily: 'Poppins_400Regular' }}>Harga: Rp{item.harga.toLocaleString('id-ID')}</Text>
      <Text style={{ fontFamily: 'Poppins_400Regular' }}>Jumlah: {item.jumlah_terjual}</Text>
      <Text style={{ fontFamily: 'Poppins_700Bold' }}>Total: Rp{item.total_harga.toLocaleString('id-ID')}</Text>
      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#666' }}>
        {new Date(item.tanggal).toLocaleString('id-ID')}
      </Text>
    </View>
  );

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={{ flex: 1,width: screenWidth, paddingHorizontal: 10 }}>
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
        <Text style={{
          fontSize: 24,
          color: 'white',
          fontFamily: 'Poppins_700Bold'
        }}>
          Transaction
        </Text>
        <TouchableOpacity onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={transaksi}
          numColumns={2}
          keyExtractor={(item, index) => item?.transaksi_id?.toString() ?? `transaksi-${index}`}
          renderItem={renderCard}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 60 }}
        />
      )}
    </View>
  );
}
