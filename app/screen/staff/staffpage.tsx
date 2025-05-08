import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, Image, Dimensions, Pressable
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const screenWidth = Dimensions.get('window').width;

export default function StaffPage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

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
    if (selectedProduct?.produk_id === item.produk_id) {
      // Deselect if already selected
      setSelectedProduct(null);
      setQuantity('');
    } else {
      // Select new product
      setSelectedProduct(item);
      setQuantity('');
    }
  };
  

  const handleCheckout = async () => {
    if (!selectedProduct || !quantity) {
      Alert.alert('Warning', 'Please select a product and enter a quantity.');
      return;
    }

    const soldQuantity = parseInt(quantity);
    if (isNaN(soldQuantity) || soldQuantity <= 0) {
      Alert.alert('Warning', 'Quantity must be a positive number.');
      return;
    }

    const newStock = selectedProduct.stok - soldQuantity;
    if (newStock < 0) {
      Alert.alert('Failed', 'Not enough stock.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');

      await fetch('http://103.16.116.58:5050/updateproduk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify({
          ...selectedProduct,
          stok: newStock,
        }),
      });

      const totalPrice = selectedProduct.harga * soldQuantity;
      await fetch('http://103.16.116.58:5050/addtransaksi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify({
          nama_produk: selectedProduct.nama,
          harga: selectedProduct.harga,
          jumlah_terjual: soldQuantity,
          total_harga: totalPrice,
          tanggal: new Date().toISOString(),
        }),
      });

      Alert.alert('Success', 'Checkout completed.');
      setSelectedProduct(null);
      setQuantity('');
      setTimeout(() => fetchProducts(), 500);
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Failed', 'An error occurred during checkout.');
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
        backgroundColor: selectedProduct?.produk_id === item.produk_id ? '#d4edda' : '#fff',
        borderRadius: 10,
        padding: 10,
        margin: 5,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
      }}
    >
      <Image
        source={{ uri: `http://103.16.116.58:5050/uploads/${item.foto}` }}
        style={{ width: 60, height: 60, borderRadius: 8, marginRight: 10 }}
        resizeMode="cover"
      />
      <View>
        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.nama}</Text>
        <Text style={{ fontFamily: 'Poppins_400Regular' }}>
          Price: Rp{item.harga}
        </Text>
        <Text>Stock: {item.stok}</Text>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={{
          fontSize: 24,
          color: 'white',
          fontFamily: 'Poppins_700Bold'
        }}>
          Cashier
        </Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <TouchableOpacity onPress={() => router.push({
            pathname: 'screen/staff/detail/history',
          })}>
            <Ionicons name="time-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>


      {/* Product List */}
      {loading ? (
        <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.produk_id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
        />
      )}

      {/* Selected Product & Checkout */}
      {selectedProduct && (
        <View style={{
          position: 'absolute',
          bottom: 0,
          width: screenWidth,
          backgroundColor: '#fff',
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 10,
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
            Selected product: {selectedProduct.nama}
          </Text>
          <TextInput
            placeholder="Quantity"
            value={quantity}
            keyboardType="numeric"
            onChangeText={setQuantity}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
            }}
          />
          <Pressable
            onPress={handleCheckout}
            style={{
              backgroundColor: '#F3AA36',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Checkout</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
