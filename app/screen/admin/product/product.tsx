import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  ActivityIndicator, Dimensions, Alert, Modal, TextInput, Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const screenWidth = Dimensions.get('window').width;

export default function PageB() {
  const [imageError, setImageError] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    nama: '', stok: '', harga: '', harga_beli: '', foto: '', supplier: ''
  });

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
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/'); // Adjust this to your login route
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

      if (response.ok) {
        const data = await response.text();
        if (!data || JSON.parse(data)) {
          Alert.alert('Success', 'Product successfully added!!');
          setShowModal(false);
          fetchProducts();
        } else {
          Alert.alert('Failed', 'There was an error while adding the product.');
        }
      } else {
        Alert.alert('Failed', 'There was an error while adding the product.');
      }
    } catch (error) {
      console.error('Create error:', error);
      Alert.alert('Failed', 'There was an error while adding the product.');
    }
  };

  const renderCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: 'screen/admin/product/detail',
        params: { produk: JSON.stringify(item) },
      })}
      style={{
        backgroundColor: '#ffe0b2',
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
        onError={() => setImageError(true)}  // Handle image error
      />
    ) : (
      <View style={{
        height: 100, backgroundColor: '#ccc',
        justifyContent: 'center', alignItems: 'center', marginBottom: 5
      }}>
        <Text>No Image</Text>
      </View>
    )}

      <Text style={{ fontFamily: 'Poppins_700Bold' }}>{item.nama}</Text>
      <Text style={{ fontFamily: 'Poppins_400Regular' }}>Stok: {item.stok}</Text>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 50 }} />;
  }

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
          Products
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            style={{
              backgroundColor: 'white',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8
            }}>
            <Text style={{ color: '#F3AA36', fontFamily: 'Poppins_700Bold' }}>+ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item, index) => item.produk_id?.toString() ?? index.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 60 }}
        />
      )}

      {/* Modal */}
      <Modal visible={showModal} animationType="fade" transparent>
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center', alignItems: 'center'
        }}>
          <View style={{
            width: '85%', backgroundColor: 'white',
            borderRadius: 16, padding: 20, elevation: 5
          }}>
            <Text style={{ fontSize: 18, fontFamily: 'Poppins_700Bold', marginBottom: 15 }}>
              Add a new Product
            </Text>
            {['Product Name', 'Stock', 'Price', 'Purchase price', 'Image UR', 'Supplier'].map((placeholder, i) => (
              <TextInput
                key={i}
                placeholder={placeholder}
                keyboardType={i >= 1 && i <= 3 ? 'numeric' : 'default'}
                value={(Object.values(newProduct) as string[])[i]}
                onChangeText={(text) => setNewProduct({ ...newProduct, [Object.keys(newProduct)[i]]: text })}
                style={{
                  borderWidth: 1, borderColor: '#ccc',
                  borderRadius: 8, padding: 10, marginBottom: 10,
                  fontFamily: 'Poppins_400Regular'
                }}
              />
            ))}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Pressable
                onPress={handleCreateProduct}
                style={{
                  backgroundColor: '#F3AA36',
                  padding: 10,
                  borderRadius: 8,
                  flex: 1,
                  marginRight: 10,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: 'white', fontFamily: 'Poppins_700Bold' }}>Add</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowModal(false)}
                style={{
                  backgroundColor: '#ccc',
                  padding: 10,
                  borderRadius: 8,
                  flex: 1,
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontFamily: 'Poppins_700Bold' }}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
