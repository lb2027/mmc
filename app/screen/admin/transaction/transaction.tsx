import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, FlatList, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const fetchTransaksi = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        router.replace('/');
        return;
      }

      const response = await fetch('http://103.16.116.58:5050/selecttransaksi', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transaksi');
      }

      const data = await response.json();
      console.log('Fetched transaksi:', data);
      setTransaksi(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch transaksi.');
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

  useEffect(() => {
    fetchTransaksi();
  }, []);

  return (
    <View style={[styles.container, { width: screenWidth }]}>
      <Text style={styles.header}>Transaksi</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={transaksi}
          keyExtractor={(item, index) => item?.transaksi_id?.toString() ?? `transaksi-${index}`}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>ID: {item.transaksi_id}</Text>
              <Text>Produk: {item.nama_produk}</Text>
              <Text>Harga: Rp{item.harga.toLocaleString('id-ID')}</Text>
              <Text>Jumlah Terjual: {item.jumlah_terjual}</Text>
              <Text>Total: Rp{item.total_harga.toLocaleString('id-ID')}</Text>
              <Text>Tanggal: {new Date(item.tanggal).toLocaleString('id-ID')}</Text>
            </View>
          )}          
        />
      )}

      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={logout} color="#d9534f" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  logoutButton: {
    marginTop: 16,
  },
});
