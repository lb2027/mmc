import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, Dimensions, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { StyleSheet } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupedMode, setGroupedMode] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchHistory();
  }, [groupedMode]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const endpoint = groupedMode ? 'displayhistory' : 'selecttransaksi';
      const response = await fetch(`http://103.16.116.58:5050/${endpoint}`, {
        headers: {
          token: token ?? '',
        },
      });
      const data = await response.json();

      if (groupedMode) {
        const grouped = data.reduce((acc: any, item: any) => {
          if (!acc[item.transaksi_id]) acc[item.transaksi_id] = [];
          acc[item.transaksi_id].push(item);
          return acc;
        }, {});
        const groupedArray = Object.entries(grouped).map(([id, items]: [string, any[]]) => ({
          transaksi_id: id,
          items: items || [],
          tanggal: items?.[0]?.tanggal_transaksi ?? '',
        }));
        setTransactions(groupedArray.reverse());
      } else {
        setTransactions(data.reverse());
      }
    } catch (error) {
      console.error('History fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSingleItem = ({ item }: { item: any }) => {
    const date = new Date(item.tanggal).toLocaleString();
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.nama_produk}</Text>
        <Text style={styles.text}>Price: Rp{item.harga}</Text>
        <Text style={styles.text}>Qty: {item.jumlah_terjual}</Text>
        <Text style={styles.text}>Total: Rp{item.total_harga}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    );
  };

  const renderGroupedItem = ({ item }: { item: any }) => {
    const date = new Date(item.tanggal).toLocaleString();
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Transaction ID: {item.transaksi_id}</Text>
        <Text style={styles.date}>{date}</Text>
        {Array.isArray(item.items) && item.items.map((subItem: any, idx: number) => (
          <View key={idx} style={{ marginTop: 8, marginLeft: 10 }}>
            <Text style={styles.text}>• {subItem.nama_produk}</Text>
            <Text style={styles.text}>  Buy: Rp{subItem.harga_beli} | Sell: Rp{subItem.harga_jual}</Text>
            <Text style={styles.text}>  Qty: {subItem.jumlah_terjual} | Total: Rp{subItem.total_harga}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, width: screenWidth, paddingHorizontal: 10 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity onPress={() => setGroupedMode(!groupedMode)}>
          <Ionicons name="filter" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* History List */}
      {loading ? (
        <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 20 }} />
      ) : groupedMode ? (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.transaksi_id.toString()}
          renderItem={renderGroupedItem}
          contentContainerStyle={{ padding: 10 }}
        />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.transaksi_id?.toString()}
          renderItem={renderSingleItem}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#F3AA36',
    paddingHorizontal: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Poppins_700Bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    elevation: 2,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  text: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  date: {
    fontFamily: 'Poppins_400Regular',
    color: 'gray',
    fontSize: 12,
    marginTop: 5,
  },

});
