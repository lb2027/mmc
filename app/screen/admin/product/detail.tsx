import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Modal,
  TextInput, Alert, TouchableOpacity, SafeAreaView, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign } from '@expo/vector-icons';

export default function ProductDetail() {
  const { produk } = useLocalSearchParams();
  const data = JSON.parse(produk as string);
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  const [nama, setNama] = useState(data.nama);
  const [stok, setStok] = useState(String(data.stok));
  const [harga, setHarga] = useState(String(data.harga));
  const [hargaBeli, setHargaBeli] = useState(String(data.harga_beli));
  const [foto, setFoto] = useState(data.foto);
  const [supplier, setSupplier] = useState(data.supplier);

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

      if (response.ok) {
        Alert.alert('Sukses', 'Produk berhasil diupdate.');
        setModalVisible(false);
        router.back();
      } else {
        Alert.alert('Gagal', 'Terjadi kesalahan saat mengupdate produk.');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Gagal mengirim permintaan.');
    }
  };

  const deleteProduk = async () => {
    Alert.alert('Konfirmasi', 'Hapus produk ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch('http://103.16.116.58:5050/deleteproduk', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                token: token ?? '',
              },
              body: JSON.stringify({ produk_id: data.produk_id }),
            });

            if (response.ok) {
              Alert.alert('Sukses', 'Produk dihapus.');
              router.back();
            } else {
              Alert.alert('Gagal', 'Gagal menghapus produk.');
            }
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Gagal mengirim permintaan.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Detail Produk</Text>

        {data.foto ? (
          <Image
            source={{ uri: data.foto }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : null}

        <View style={styles.infoBox}>
          {[
            ['ID Produk', data.produk_id],
            ['Nama', data.nama],
            ['Stok', data.stok],
            ['Harga Jual', `Rp${data.harga}`],
            ['Harga Beli', `Rp${data.harga_beli}`],
            ['Foto', data.foto],
            ['Supplier', data.supplier],
          ].map(([label, value]) => (
            <View style={styles.row} key={label}>
              <Text style={styles.label}>{label}:</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <AntDesign name="edit" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, { backgroundColor: '#e74c3c' }]} onPress={deleteProduk}>
          <AntDesign name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Update Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Produk</Text>

            <TextInput style={styles.input} placeholder="Nama" value={nama} onChangeText={setNama} />
            <TextInput style={styles.input} placeholder="Stok" value={stok} onChangeText={setStok} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Harga Jual" value={harga} onChangeText={setHarga} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Harga Beli" value={hargaBeli} onChangeText={setHargaBeli} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Foto (link)" value={foto} onChangeText={setFoto} />
            <TextInput style={styles.input} placeholder="Supplier" value={supplier} onChangeText={setSupplier} />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonTextCancel}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={updateProduk}>
                <Text style={styles.modalButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
  },
  row: {
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    flexDirection: 'column',
    gap: 15,
  },
  fab: {
    backgroundColor: '#3498db',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonCancel: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalButtonTextCancel: {
    color: 'gray',
    fontWeight: 'bold',
  },
});
