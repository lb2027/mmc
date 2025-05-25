import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, Image, Dimensions, Pressable, Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const screenWidth = Dimensions.get('window').width;

export default function StaffPage() {
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null); // from soldproduk
  const [products, setProducts] = useState([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showAllModal, setShowAllModal] = useState(false);
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/');
  };

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

  const filteredProducts = products.filter((product: any) =>
    product.nama.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleSelectProduct = (item: any) => {
    const alreadySelected = selectedItems.some((p) => p.produk_id === item.produk_id);
    if (alreadySelected) {
      setSelectedItems(selectedItems.filter((p) => p.produk_id !== item.produk_id));
      const newQuantities = { ...quantities };
      delete newQuantities[item.produk_id];
      setQuantities(newQuantities);
    } else {
      setSelectedItems([...selectedItems, item]);
      // Set default quantity to "1" if not already set
      if (!quantities[item.produk_id]) {
        setQuantities((prev) => ({ ...prev, [item.produk_id]: '1' }));
      }
    }
  };


  const handleQuantityChange = (produkId: string, qty: string) => {
    setQuantities({ ...quantities, [produkId]: qty });
  };

  const submitInvoice = async () => {
  const token = await AsyncStorage.getItem('token');
  const username = await AsyncStorage.getItem('username');

  try {
    const res = await fetch('http://103.16.116.58:5050/invoice/auto-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: token ?? '',
      },
      body: JSON.stringify({
        transaction_id: transactionId,
        customer_name: customerName,
        customer_phone: customerPhone,
        cashier_name: username,
        auto_print: false,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Invoice error:', text);
      //Alert.alert('Failed', 'Invoice generation failed.');
    } else {
      //Alert.alert('Success', 'Invoice generated.');
      setInvoiceModalVisible(false);
      setCustomerName('');
      setCustomerPhone('');
      const invoiceId = transactionId;
      setTransactionId(null);
      router.push({
        pathname: '/screen/staff/invoicewebview',
        params: { transaction_id: invoiceId },
      });
    }
  } catch (err) {
    console.error('Submit invoice error:', err);
    Alert.alert('Error', 'Failed to submit invoice.');
  }
};


  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('Warning', 'Please select at least one product.');
      return;
    }

    const soldItems = [];

    for (const item of selectedItems) {
      const qtyStr = quantities[item.produk_id];
      const qty = parseInt(qtyStr);

      if (!qtyStr || isNaN(qty) || qty <= 0) {
        Alert.alert('Warning', `Quantity for ${item.nama} is invalid.`);
        return;
      }

      if (item.stok < qty) {
        Alert.alert('Warning', `Not enough stock for ${item.nama}.`);
        return;
      }

      soldItems.push({
        produk_id: item.produk_id,
        stok_keluar: qty,
      });
    }

    try {
      const token = await AsyncStorage.getItem('token');

      const res = await fetch('http://103.16.116.58:5050/soldproduk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify(soldItems),
      });

      const result = await res.json();

      // if (!res.ok) {
      //   console.error('SoldProduk error:', result);
      //   Alert.alert('Failed', result?.error || 'Failed to process sold items.');
      //   return;
      // }
      const newTransactionId = result?.transaction_id; // assume backend returns this
      setTransactionId(newTransactionId);
      setInvoiceModalVisible(true); // open modal for name/phone

      for (const item of selectedItems) {
        const qty = parseInt(quantities[item.produk_id]);
        const totalPrice = qty * item.harga;

        await fetch('http://103.16.116.58:5050/addtransaksi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            token: token ?? '',
          },
          body: JSON.stringify({
            nama_produk: item.nama,
            harga: item.harga,
            jumlah_terjual: qty,
            total_harga: totalPrice,
            tanggal: new Date().toISOString(),
          }),
        });
      }

      //Alert.alert('Success', 'All items checked out successfully!');
      setSelectedItems([]);
      setQuantities({});
      fetchProducts();
      setShowAllModal(false); // also close modal if open
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Failed', 'An error occurred during checkout.');
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedItems.some(p => p.produk_id === item.produk_id);
    return (
      <TouchableOpacity
        onPress={() => toggleSelectProduct(item)}
        style={{
          backgroundColor: isSelected ? '#d4edda' : '#fff',
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
          source={{ uri: `http://103.16.116.58:5050/images/${item.foto}` }}
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
  };

  return (
    <View style={{ flex: 1, width: screenWidth, paddingHorizontal: 10 }}>
      {/* Header */}
      <View style={{
        flexDirection: 'column',
        backgroundColor: '#F3AA36',
        paddingTop: 50,
        paddingBottom: 10,
        paddingHorizontal: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Text style={{
            fontSize: 24,
            color: 'white',
            fontFamily: 'Poppins_700Bold'
          }}>
            Cashier
          </Text>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity onPress={() => {
              setSearchVisible(!searchVisible);
              if (searchVisible) setSearchText('');
            }}>
              <Ionicons name="search-outline" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('screen/staff/detail/history')}>
              <Ionicons name="time-outline" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {searchVisible && (
          <TextInput
            placeholder="Search product name..."
            value={searchText}
            onChangeText={setSearchText}
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingHorizontal: 15,
              paddingVertical: 8,
              marginTop: 10,
              fontFamily: 'Poppins_400Regular',
            }}
          />
        )}
      </View>

      {/* Product List */}
      {loading ? (
        <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.produk_id?.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
        />
      )}

      {/* Bottom Checkout Panel */}
      {selectedItems.length === 1 ? (
        // Single item selected: show Checkout directly
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: 12,
          marginHorizontal: 12,
          marginVertical: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 12,
            marginBottom: 10,
            color: '#333',
          }}
        >
          {selectedItems[0].nama}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Pressable
            onPress={() => {
              const current = parseInt(quantities[selectedItems[0].produk_id]) || 1;
              if (current > 1) {
                handleQuantityChange(selectedItems[0].produk_id, String(current - 1));
              }
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#eee',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>−</Text>
          </Pressable>

          <TextInput
            value={quantities[selectedItems[0].produk_id] || '1'}
            onChangeText={(val) => handleQuantityChange(selectedItems[0].produk_id, val)}
            keyboardType="numeric"
            placeholder="Qty"
            style={{
              width: 200,
              height: 40,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              paddingHorizontal: 10,
              fontSize: 14,
              textAlign: 'center',
              marginHorizontal: 10,
            }}
          />

          <Pressable
            onPress={() => {
              const current = parseInt(quantities[selectedItems[0].produk_id]) || 1;
              handleQuantityChange(selectedItems[0].produk_id, String(current + 1));
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#eee',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>+</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleCheckout}
          style={{
            backgroundColor: '#F3AA36',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Checkout</Text>
        </Pressable>
      </View>



      ) : selectedItems.length > 1 ? (
        // More than one item: show "Open Cart"
      <TouchableOpacity
        onPress={() => setShowAllModal(true)}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#F3AA36',
          borderRadius: 30,
          padding: 16,
          elevation: 5,
        }}
      >
        <Ionicons name="cart-outline" size={28} color="#fff" />
        {selectedItems.length > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              backgroundColor: 'red',
              borderRadius: 10,
              width: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>{selectedItems.length}</Text>
          </View>
        )}
      </TouchableOpacity>

      ) : null}


      {/* Fullscreen Modal Overlay */}
      <Modal
        visible={showAllModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAllModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 15,
            padding: 20,
            maxHeight: '80%',
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Selected Items</Text>

          <FlatList
            data={selectedItems}
            keyExtractor={(item) => item.produk_id.toString()}
            renderItem={({ item }) => (
              <View style={{
                flexDirection: 'row',
                marginBottom: 15,
                alignItems: 'center',
              }}>
                <Image
                  source={{ uri: `http://103.16.116.58:5050/images/${item.foto}` }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 10,
                    marginRight: 15,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.nama}</Text>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 8,
                  }}>
                    <Pressable
                      onPress={() => {
                        const current = parseInt(quantities[item.produk_id]) || 0;
                        if (current > 0) {
                          handleQuantityChange(item.produk_id, String(current - 1));
                        }
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: '#ddd',
                        borderRadius: 6,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 6,
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>−</Text>
                    </Pressable>

                    <TextInput
                      placeholder="Qty"
                      value={quantities[item.produk_id] || ''}
                      keyboardType="numeric"
                      onChangeText={(val) => handleQuantityChange(item.produk_id, val)}
                      style={{
                        width: 100,
                        height: 36,
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 6,
                        padding: 5,
                        textAlign: 'center',
                        marginHorizontal: 2,
                      }}
                    />

                    <Pressable
                      onPress={() => {
                        const current = parseInt(quantities[item.produk_id]) || 0;
                        handleQuantityChange(item.produk_id, String(current + 1));
                      }}
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: '#ddd',
                        borderRadius: 6,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: 6,
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          />



            <Pressable
              onPress={handleCheckout}
              style={{
                backgroundColor: '#F3AA36',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Checkout</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowAllModal(false)}
              style={{
                marginTop: 10,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#888' }}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      {/* Invoice Modal */}
      <Modal visible={invoiceModalVisible} transparent={true} animationType="slide">
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              width: '90%',
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Customer Info</Text>
              <TextInput
                placeholder="Customer Name"
                value={customerName}
                onChangeText={setCustomerName}
                style={{
                  borderBottomWidth: 1,
                  marginBottom: 15,
                  padding: 8,
                }}
              />
              <TextInput
                placeholder="Customer Phone"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
                style={{
                  borderBottomWidth: 1,
                  marginBottom: 15,
                  padding: 8,
                }}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: '#F3AA36',
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={submitInvoice}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

    </View>
  );
}
