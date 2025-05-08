import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Dimensions, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const screenWidth = Dimensions.get('window').width;

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://103.16.116.58:5050/selecttransaksi', {
        headers: {
          token: token ?? '',
        },
      });
      const data = await response.json();
      setTransactions(data.reverse()); // Show latest first
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const date = new Date(item.tanggal).toLocaleString();
    return (
      <View style={{
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 6,
        elevation: 2
      }}>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 16 }}>{item.nama_produk}</Text>
        <Text style={{ fontFamily: 'Poppins_400Regular' }}>Price: Rp{item.harga}</Text>
        <Text style={{ fontFamily: 'Poppins_400Regular' }}>Qty: {item.jumlah_terjual}</Text>
        <Text style={{ fontFamily: 'Poppins_400Regular' }}>Total: Rp{item.total_harga}</Text>
        <Text style={{ fontFamily: 'Poppins_400Regular', color: 'gray' }}>{date}</Text>
      </View>
    );
  };

  if (!fontsLoaded) return null;

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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={{
          fontSize: 20,
          color: 'white',
          fontFamily: 'Poppins_700Bold'
        }}>
          Transaction History
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* History List */}
      {loading ? (
        <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.transaksi_id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </View>
  );
}
