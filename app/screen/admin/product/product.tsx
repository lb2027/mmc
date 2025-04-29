import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  ActivityIndicator, Dimensions, Alert, Modal, TextInput, Button
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';  // For FAB icon

const screenWidth = Dimensions.get('window').width;

export default function PageB() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);  // Modal for creating new product
  const [newProduct, setNewProduct] = useState({
    nama: '',
    stok: '',
    harga: '',
    harga_beli: '',
    foto: '',
    supplier: ''
  });
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
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: 'screen/admin/product/detail', params: { produk: JSON.stringify(item) } })}
      style={{
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 10,
        margin: 5,
        flex: 1,
        maxWidth: (screenWidth / 2) - 15,
      }}
    >
      {item.foto ? (
        <Image
          source={{ uri: `http://103.16.116.58:5050/images/${item.foto}` }}
          style={{ height: 100, borderRadius: 8, marginBottom: 5 }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ height: 100, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
          <Text>No Image</Text>
        </View>
      )}
      <Text style={{ fontWeight: 'bold' }}>{item.nama}</Text>
      <Text>Stok: {item.stok}</Text>
    </TouchableOpacity>
  );

  const handleCreateProduct = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://103.16.116.58:5050/addproduk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify({
          nama: newProduct.nama,
          stok: parseInt(newProduct.stok),
          harga: parseFloat(newProduct.harga),
          harga_beli: parseFloat(newProduct.harga_beli),
          foto: newProduct.foto,
          supplier: newProduct.supplier,
        }),
      });
  
      // Check if the response body is empty
      if (response.ok) {
        const data = await response.text(); // Get the response body as text first
  
        if (data) {
          try {
            const jsonData = JSON.parse(data);  // Try parsing the data as JSON
            Alert.alert('Sukses', 'Produk berhasil ditambahkan!');
            setShowModal(false);  // Close the modal
            fetchProducts();  // Refresh the product list
          } catch (error) {
            console.error('Response is not valid JSON:', error);
            Alert.alert('Gagal', 'Terjadi kesalahan saat menambahkan produk.');
          }
        } else {
          // If the response body is empty, just consider it as success
          Alert.alert('Sukses', 'Produk berhasil ditambahkan!');
          setShowModal(false);  // Close the modal
          fetchProducts();  // Refresh the product list
        }
      } else {
        Alert.alert('Gagal', 'Terjadi kesalahan saat menambahkan produk.');
      }
    } catch (error) {
      console.error('Create error:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menambahkan produk.');
    }
  };
  

  return (
    <View style={{ width: screenWidth, padding: 10 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 10 }}>Produk</Text>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item, index) => item.produk_id?.toString() ?? index.toString()}
          renderItem={renderCard}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 50,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal for Creating Product */}
      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ width: 300, backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Tambah Produk Baru</Text>
            <TextInput
              placeholder="Nama Produk"
              value={newProduct.nama}
              onChangeText={(text) => setNewProduct({ ...newProduct, nama: text })}
              style={{ borderBottomWidth: 1, marginBottom: 10, padding: 5 }}
            />
            <TextInput
              placeholder="Stok"
              keyboardType="numeric"
              value={newProduct.stok}
              onChangeText={(text) => setNewProduct({ ...newProduct, stok: text })}
              style={{ borderBottomWidth: 1, marginBottom: 10, padding: 5 }}
            />
            <TextInput
              placeholder="Harga"
              keyboardType="numeric"
              value={newProduct.harga}
              onChangeText={(text) => setNewProduct({ ...newProduct, harga: text })}
              style={{ borderBottomWidth: 1, marginBottom: 10, padding: 5 }}
            />
            <TextInput
              placeholder="Harga Beli"
              keyboardType="numeric"
              value={newProduct.harga_beli}
              onChangeText={(text) => setNewProduct({ ...newProduct, harga_beli: text })}
              style={{ borderBottomWidth: 1, marginBottom: 10, padding: 5 }}
            />
            <TextInput
              placeholder="Foto URL"
              value={newProduct.foto}
              onChangeText={(text) => setNewProduct({ ...newProduct, foto: text })}
              style={{ borderBottomWidth: 1, marginBottom: 10, padding: 5 }}
            />
            <TextInput
              placeholder="Supplier"
              value={newProduct.supplier}
              onChangeText={(text) => setNewProduct({ ...newProduct, supplier: text })}
              style={{ borderBottomWidth: 1, marginBottom: 20, padding: 5 }}
            />
            <Button title="Tambah Produk" onPress={handleCreateProduct} />
            <Button title="Batal" onPress={() => setShowModal(false)} color="gray" />
          </View>
        </View>
      </Modal>
    </View>
  );
}
