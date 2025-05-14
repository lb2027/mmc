import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'http://103.16.116.58:5050';
const screenWidth = Dimensions.get('window').width;

export default function AdminDashboard() {
  const [data, setData] = useState({
    history: [],
    daily: null,
    weekly: null,
    monthly: null,
    inventory: [],
  });
  const [loading, setLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const formatRupiah = (number: number) => {
    return 'Rp' + number.toLocaleString('id-ID');
  };

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const headers = {
        'token': token,
        'Content-Type': 'application/json',
      };

      const today = new Date();
      const startDate = today.toISOString().slice(0, 10);
      const endDate = today.toISOString().slice(0, 10);

      const endpoints = [
        { name: 'history', url: `${BASE_URL}/displayhistory` },
        { name: 'daily', url: `${BASE_URL}/dailysales` },
        { name: 'weekly', url: `${BASE_URL}/weeklysales?startDate=${startDate}&endDate=${endDate}` },
        { name: 'monthly', url: `${BASE_URL}/monthlysales` },
        { name: 'inventory', url: `${BASE_URL}/inventorystatus` },
      ];

      const responses = await Promise.all(endpoints.map(e => fetch(e.url, { headers })));

      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          const text = await responses[i].text();
          throw new Error(`Fetch failed at ${endpoints[i].name}: ${text}`);
        }
      }

      const [history, daily, weeklyRaw, monthly, inventory] = await Promise.all(
        responses.map(res => res.json())
      );

      const weekly = Array.isArray(weeklyRaw)
        ? {
            sales: weeklyRaw.map((entry: any) => ({
              date: entry.date,
              total: entry.sales,
            })),
          }
        : null;

      setData({
        history,
        daily,
        weekly,
        monthly,
        inventory: inventory.totalProducts,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    console.log('Daily:', data.daily);
    console.log('Weekly:', data.weekly);
    console.log('Monthly:', data.monthly);
  }, []);

  const weeklySalesTotal = data.weekly?.sales?.reduce(
    (sum: number, s: any) => sum + (s?.total || 0),
    0
  ) || 0;
  const chartData = {
    labels: ['Daily', 'Weekly', 'Monthly'],
    datasets: [
      {
        data: [
          data.daily?.totalSales || 0,
          weeklySalesTotal,
          data.monthly?.totalRevenue || 0,
        ],
      },
    ],
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F3AA36" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <TouchableOpacity
        onPress={() => router.push('/screen/admin/adminpage')}
        style={styles.iconButton}
      >
        <Ionicons name="settings-outline" size={24} color="#F3AA36" />
      </TouchableOpacity>
    </View>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={280}
          fromZero={true}
          withDots={true}
          withInnerLines={false}
          withHorizontalLabels={false}
          withVerticalLabels={true}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(243, 170, 54, ${opacity})`,
            labelColor: () => '#374151',
            propsForLabels: {
              fontSize: 14,
            },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#ffa726',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />

        {/* Overlay value labels manually
        <View
          style={{
            position: 'absolute',
            top: 50,
            left: 32,
            width: screenWidth - 32,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 8,
          }}
        >
          {chartData.datasets[0].data.map((val, idx) => (
            <Text key={idx} style={{ fontSize: 8, color: '#374151' }}>
              {(val / 1000).toFixed(1)}K
            </Text>
          ))}
        </View> */}
      </View>

      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Sales</Text>
          <Text style={styles.cardValue}>
            Rp {data.daily?.totalSales?.toLocaleString() || '-'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Sales</Text>
          <Text style={styles.cardValue}>
            Rp {weeklySalesTotal.toLocaleString()}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Revenue</Text>
          <Text style={styles.cardValue}>
            Rp {data.monthly?.totalRevenue?.toLocaleString() || '-'}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
      <Text style={styles.sectionTitle}>Transactions</Text>
      <TouchableOpacity
        onPress={() => setShowAllTransactions(prev => !prev)}
        style={styles.iconToggleButton}
      >
        <Ionicons
          name={showAllTransactions ? 'chevron-up-outline' : 'chevron-down-outline'}
          size={20}
          color="#F3AA36"
        />
      </TouchableOpacity>



      </View>
      {data.history.length > 0 ? (
        (showAllTransactions ? data.history : data.history.slice(0, 5)).map((item: any, index: number) => {
          const date = new Date(item.tanggal_transaksi);
          return (
            <View key={index} style={styles.transactionCard}>
              <Text style={styles.transactionTitle}>{item.nama_produk}</Text>
              <Text style={styles.transactionDetail}>
                {item.jumlah_terjual} pcs - Rp {item.total_harga.toLocaleString()}
              </Text>
              <Text style={styles.transactionDate}>
                {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          );
        })
      ) : (
        <Text style={styles.placeholder}>No transactions found.</Text>
      )}

      {/* <Text style={styles.inventoryText}>
        Total Products: {data.inventory || 0}
      </Text> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: '#F3AA36',
    marginTop: 10,
  },
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#F3AA36',
    textAlign: 'center',
  },
  cardRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#F3AA36',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 6,
  },
  sectionTitle: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '700',
    color: '#F3AA36',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  transactionCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400e',
  },
  transactionDetail: {
    fontSize: 14,
    color: '#78350f',
  },
  transactionDate: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 2,
    fontStyle: 'italic',
  },
  inventoryText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 12,
    fontWeight: '500',
  },
  placeholder: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 10,
    fontStyle: 'italic',
  },
  toggleButton: {
  backgroundColor: '#F3AA36',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  elevation: 2,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  iconToggleButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

});
