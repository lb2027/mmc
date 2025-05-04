import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, Button, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function StaffPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [jumlah, setJumlah] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://103.16.116.58:5050/selectproduk', {
        headers: { token: token ?? '' },
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    setSelectedProduct(item);
    setJumlah('');
  };

  const handleCheckout = async () => {
    if (!selectedProduct || !jumlah) {
      Alert.alert('Peringatan', 'Pilih produk dan isi jumlah terlebih dahulu.');
      return;
    }

    const jumlahTerjual = parseInt(jumlah);
    if (isNaN(jumlahTerjual) || jumlahTerjual <= 0) {
      Alert.alert('Peringatan', 'Jumlah harus angka positif.');
      return;
    }

    const stokBaru = selectedProduct.stok - jumlahTerjual;
    if (stokBaru < 0) {
      Alert.alert('Gagal', 'Stok tidak cukup.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      // Update stok
      await fetch('http://103.16.116.58:5050/updateproduk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify({
          produk_id: selectedProduct.produk_id,
          nama: selectedProduct.nama,
          stok: stokBaru,
          harga: selectedProduct.harga,
          harga_beli: selectedProduct.harga_beli,
          foto: selectedProduct.foto,
          supplier: selectedProduct.supplier,
        }),
      });
    

      // Buat transaksi
      const totalHarga = selectedProduct.harga * jumlahTerjual;
      await fetch('http://103.16.116.58:5050/addtransaksi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify({
          nama_produk: selectedProduct.nama,
          harga: selectedProduct.harga,
          jumlah_terjual: jumlahTerjual,
          total_harga: totalHarga,
          tanggal: new Date().toISOString(),
        }),
      });

      Alert.alert('Sukses', 'Transaksi berhasil.');
      setSelectedProduct(null);
      setJumlah('');
      // Tunggu sebentar sebelum ambil ulang data
      setTimeout(() => {
        fetchProducts();
      }, 500);
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat checkout.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'username', 'role']);
      Alert.alert('Logged Out', 'You have been logged out.');
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Logout failed.');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item)}
      style={{
        padding: 10,
        marginVertical: 5,
        backgroundColor: selectedProduct?.produk_id === item.produk_id ? '#d0f0c0' : '#f0f0f0',
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <Image
        source={{ uri: `http://103.16.116.58:5050/uploads/${item.foto}` }}
        style={{ width: 60, height: 60, borderRadius: 8 }}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: 'bold' }}>{item.nama}</Text>
        <Text>Harga: Rp{item.harga}</Text>
        <Text>Stok: {item.stok}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Kasir</Text>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.produk_id?.toString()}
          renderItem={renderItem}
        />
      )}

      {selectedProduct && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 3 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
            Produk dipilih: {selectedProduct.nama}
          </Text>
          <TextInput
            placeholder="Jumlah yang dibeli"
            value={jumlah}
            keyboardType="numeric"
            onChangeText={setJumlah}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <Button title="Checkout" onPress={handleCheckout} />
        </View>
      )}
    </View>
  );
}
