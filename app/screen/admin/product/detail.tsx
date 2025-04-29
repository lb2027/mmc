import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Button,
  Modal, TextInput, Alert, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

export default function ProductDetail() {
  const { produk } = useLocalSearchParams();
  const data = JSON.parse(produk as string);
  const router = useRouter();

  const [showButtons, setShowButtons] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [nama, setNama] = useState(data.nama);
  const [stok, setStok] = useState(String(data.stok));
  const [harga, setHarga] = useState(String(data.harga));
  const [hargaBeli, setHargaBeli] = useState(String(data.harga_beli));
  const [foto, setFoto] = useState(data.foto);
  const [supplier, setSupplier] = useState(data.supplier);

  const toggleModal = () => setModalVisible(!modalVisible);
  const toggleButtons = () => setShowButtons(!showButtons);

  const goBack = () => router.back();

  const updateProduk = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://103.16.116.58:5050/updateproduk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify({
          produk_id: data.produk_id,
          nama,
          stok: parseInt(stok),
          harga: parseFloat(harga),
          harga_beli: parseFloat(hargaBeli),
          foto,
          supplier,
        }),
      });
  
      // Check if the response is successful (status 200 or 204)
      if (response.status === 200 || response.status === 204) {
        Alert.alert('Sukses', 'Produk berhasil diupdate.');
        toggleModal();  // Close the update modal
        goBack();  // Go back to the previous screen
      } else {
        // Log any non-200 responses
        console.error('Update failed with status:', response.status);
        Alert.alert('Gagal', 'Terjadi kesalahan saat mengupdate produk.');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Gagal mengirim permintaan.');
    }
  };
  
  
  

  const deleteProduk = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://103.16.116.58:5050/deleteproduk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          token: token ?? '',
        },
        body: JSON.stringify({
          produk_id: data.produk_id,
        }),
      });

      const json = await response.json();
      console.log('Delete response:', json);

      if (response.ok) {
        Alert.alert('Sukses', 'Produk berhasil dihapus.');
        goBack();
      } else {
        Alert.alert('Gagal', json?.message ?? 'Gagal menghapus produk.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Gagal mengirim permintaan.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.backButton}>
          <Button title="Kembali" onPress={goBack} />
        </View>

        <Text style={styles.title}>Detail Produk</Text>
        <Text>ID: {data.produk_id}</Text>
        <Text>Nama: {data.nama}</Text>
        <Text>Stok: {data.stok}</Text>
        <Text>Harga Jual: {data.harga}</Text>
        <Text>Harga Beli: {data.harga_beli}</Text>
        <Text>Foto: {data.foto}</Text>
        <Text>Supplier: {data.supplier}</Text>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={toggleButtons}>
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      {showButtons && (
        <View style={styles.fabActions}>
          <Button title="Update" onPress={toggleModal} />
          <View style={{ marginTop: 10 }} />
          <Button title="Delete" color="red" onPress={deleteProduk} />
        </View>
      )}

      {/* Modal untuk Update */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContainer}>
          <Text style={styles.modalTitle}>Update Produk</Text>

          <TextInput placeholder="Nama" value={nama} onChangeText={setNama} style={styles.input} />
          <TextInput placeholder="Stok" value={stok} onChangeText={setStok} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Harga" value={harga} onChangeText={setHarga} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Harga Beli" value={hargaBeli} onChangeText={setHargaBeli} keyboardType="numeric" style={styles.input} />
          <TextInput placeholder="Foto (link)" value={foto} onChangeText={setFoto} style={styles.input} />
          <TextInput placeholder="Supplier" value={supplier} onChangeText={setSupplier} style={styles.input} />

          <Button title="Simpan" onPress={updateProduk} />
          <View style={{ marginTop: 10 }} />
          <Button title="Batal" color="gray" onPress={toggleModal} />
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 30,
    elevation: 5,
  },
  fabActions: {
    position: 'absolute',
    bottom: 100,
    right: 30,
  },
  modalContainer: {
    padding: 20,
    paddingTop: 60,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
});
