import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  View, Text, Modal, TextInput, Alert, StyleSheet,
  TouchableOpacity, Dimensions, SafeAreaView, ScrollView, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ProductDetail() {
  const { produk } = useLocalSearchParams();
  const router = useRouter();
  const data = typeof produk === 'string' ? JSON.parse(produk) : produk;
  const [modalVisible, setModalVisible] = useState(false);
  const baseUrl = 'http://103.16.116.58:5050';
  function getFullImageUrl(foto) {
    if (!foto) return null;
    return foto.startsWith('http') ? foto : `${baseUrl}/images/${foto}`;
  }
  const imageUrl = getFullImageUrl(data.foto);
  const [form, setForm] = useState({
    nama: data.nama,
    stok: String(data.stok),
    harga: String(data.harga),
    hargaBeli: String(data.harga_beli),
    foto: imageUrl,
    supplier: data.supplier,
  });
  {console.log('Foto URL:', imageUrl)} {/* ✅ Debugging line */}
  {imageUrl ? (
    <Image
      source={{ uri: imageUrl }}
      style={styles.image}
      resizeMode="contain"
    />
  ) : null}


  const handleUpdate = async () => {
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
          nama: form.nama,
          stok: parseInt(form.stok),
          harga: parseFloat(form.harga),
          harga_beli: parseFloat(form.hargaBeli),
          foto: form.foto,
          supplier: form.supplier,
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

  const handleDelete = async () => {
    Alert.alert('Konfirmasi', 'Hapus produk ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f9' }}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Detail Produk</Text>
        {data.foto ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : null}
        <View style={styles.grid}>
          <View style={styles.cell}>
            <Text style={styles.label}>ID Produk</Text>
            <Text style={styles.value}>{data.produk_id}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>{data.nama}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Stok</Text>
            <Text style={styles.value}>{data.stok}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Harga Jual</Text>
            <Text style={styles.value}>Rp{data.harga}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Harga Beli</Text>
            <Text style={styles.value}>Rp{data.harga_beli}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.label}>Supplier</Text>
            <Text style={styles.value}>{data.supplier}</Text>
          </View>
        </View>
      </View>


        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.editBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.btnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.btnText}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Produk</Text>
            <TextInput style={styles.input} placeholder="Nama" value={form.nama} onChangeText={(val) => setForm({ ...form, nama: val })} />
            <TextInput style={styles.input} placeholder="Stok" value={form.stok} keyboardType="numeric" onChangeText={(val) => setForm({ ...form, stok: val })} />
            <TextInput style={styles.input} placeholder="Harga Jual" value={form.harga} keyboardType="numeric" onChangeText={(val) => setForm({ ...form, harga: val })} />
            <TextInput style={styles.input} placeholder="Harga Beli" value={form.hargaBeli} keyboardType="numeric" onChangeText={(val) => setForm({ ...form, hargaBeli: val })} />
            <TextInput style={styles.input} placeholder="Foto (URL)" value={form.foto} onChangeText={(val) => setForm({ ...form, foto: val })} />
            <TextInput style={styles.input} placeholder="Supplier" value={form.supplier} onChangeText={(val) => setForm({ ...form, supplier: val })} />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
                <Text style={styles.btnText}>Update</Text>
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
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8, 
    borderWidth: 2,
    borderColor: '#ccc',
    marginBottom: 20,
    alignSelf: 'center',
  },
  infoRow: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  editBtn: {
    backgroundColor: '#F3AA36',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  deleteBtn: {
    backgroundColor: '#F3AA36',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2c3e50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#F3AA36',
    padding: 12,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cell: {
    width: '48%',
    marginBottom: 15,
  },
  
});
