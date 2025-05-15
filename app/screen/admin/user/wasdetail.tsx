// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TextInput,
//   Alert,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   SafeAreaView,
//   ScrollView,
// } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import DatePicker from 'react-native-date-picker';


// export default function UserDetail() {
//   const { user } = useLocalSearchParams();
//   const router = useRouter();
//   const [showRoleDropdown, setShowRoleDropdown] = useState(false);
//   const userData = typeof user === 'string' ? JSON.parse(user) : user;
//   const [modalVisible, setModalVisible] = useState(false);
//   const [form, setForm] = useState({
//     Username: userData.username,
//     Password: userData.password,
//     Role: userData.role,
//   });
//   const [salaries, setSalaries] = useState([]);
//   const [addModalVisible, setAddModalVisible] = useState(false);
//   const [newSalary, setNewSalary] = useState({
//     bulan_gaji: '',
//     gaji_perbulan: '',
//     tanggal_transfer: '',
//     keterangan: '',
//   });
//   const [showMonthPicker, setShowMonthPicker] = useState(false);
//   const [showTransferDatePicker, setShowTransferDatePicker] = useState(false);

//   // Helper to format date
//   const formatDate = (date) => date.toISOString().split('T')[0];

//   const [isMonthPickerVisible, setMonthPickerVisible] = useState(false);
//   const [isTransferPickerVisible, setTransferPickerVisible] = useState(false);
//   const [open, setOpen] = useState(false);
//   useEffect(() => {
//     const fetchSalaries = async () => {
//       console.log('Fetching salary data...');
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (!token) {
//           console.warn('No token found in AsyncStorage.');
//           return;
//         }

//         const response = await fetch('http://103.16.116.58:5050/getgaji', {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             token,
//           },
//         });

//         const data = await response.json();
//         console.log('Raw salary data:', data);

//         const filtered = data
//           .filter((item) => item.staff_id === userData.id)
//           .sort((a, b) => new Date(b.bulan_gaji).getTime() - new Date(a.bulan_gaji).getTime());

//         console.log(`Filtered salaries for user ID ${userData.id}:`, filtered);
//         if (filtered.length === 0) {
//           console.warn(`No salary records found for user ID ${userData.id}.`);
//         }

//         setSalaries(filtered);
//       } catch (err) {
//         console.error('Failed to fetch salaries:', err);
//       }
//     };

//     fetchSalaries();
//   }, []);


//   const handleUpdate = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const response = await fetch('http://103.16.116.58:5050/updateuser', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           token: token ?? '',
//         },
//         body: JSON.stringify({
//           id: userData.id,
//           Username: form.Username,
//           Password: form.Password,
//           Role: form.Role,
//         }),
//       });

//       const text = await response.text();
//       if (text) console.log("Update response:", text);

//       Alert.alert('Success', 'User updated.');
//       setModalVisible(false);
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to update user.');
//     }
//   };

//   const handleDelete = async () => {
//     Alert.alert('Confirm Delete', 'Are you sure you want to delete this user?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             const token = await AsyncStorage.getItem('token');
//             const response = await fetch('http://103.16.116.58:5050/deleteuser', {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json',
//                 token: token ?? '',
//               },
//               body: JSON.stringify({ id: userData.id }),
//             });

//             const text = await response.text();
//             if (text) console.log('Delete response:', text);

//             Alert.alert('Deleted', 'User deleted.');
//             router.back();
//           } catch (err) {
//             console.error(err);
//             Alert.alert('Error', 'Failed to delete user.');
//           }
//         },
//       },
//     ]);
//   };
 
//   const handleAddSalary = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       const response = await fetch('http://103.16.116.58:5050/addgaji', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           token: token ?? '',
//         },
//         body: JSON.stringify({
//           staff_id: userData.id,
//           ...newSalary,
//           gaji_perbulan: parseInt(newSalary.gaji_perbulan, 10),
//         }),
//       });

//       const text = await response.text();
//       if (text) console.log('Add Salary Response:', text);

//       Alert.alert('Success', 'Salary added.');
//       setAddModalVisible(false);
//       setNewSalary({ bulan_gaji: '', gaji_perbulan: '', tanggal_transfer: '', keterangan: '' });

//       // Refetch salary data
//       const updated = await fetch('http://103.16.116.58:5050/getgaji', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           token,
//         },
//       });
//       const updatedData = await updated.json();
//       const filtered = updatedData
//         .filter((item) => item.staff_id === userData.id)
//         .sort((a, b) => new Date(b.bulan_gaji).getTime() - new Date(a.bulan_gaji).getTime());
//       setSalaries(filtered);
//     } catch (err) {
//       console.error(err);
//       Alert.alert('Error', 'Failed to add salary.');
//     }
//   };
  

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6f9' }}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={styles.card}>
//           <Text style={styles.header}>User Detail</Text>
//           <View style={styles.infoRow}>
//             <Text style={styles.label}>Username</Text>
//             <Text style={styles.value}>{userData.username}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Text style={styles.label}>Password</Text>
//             <Text style={styles.value}>{userData.password}</Text>
//           </View>
//           <View style={styles.infoRow}>
//             <Text style={styles.label}>Role</Text>
//             <Text style={styles.value}>{userData.role}</Text>
//           </View>
//         </View>
//         <View style={styles.bottomButtons}>
//           <TouchableOpacity style={styles.editBtn} onPress={() => setModalVisible(true)}>
//             <Text style={styles.btnText}>Edit</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
//             <Text style={styles.btnText}>Delete</Text>
//           </TouchableOpacity>
//         </View>

//         {salaries.length > 0 ? (
//           <View style={styles.card}>
//             <Text style={styles.header}>Salary History</Text>
//             {salaries.map((salary) => (
//               <View key={salary.id} style={styles.salaryItem}>
//                 <Text style={styles.salaryText}>Month: {new Date(salary.bulan_gaji).toLocaleDateString()}</Text>
//                 <Text style={styles.salaryText}>Amount: Rp {salary.gaji_perbulan.toLocaleString()}</Text>
//                 <Text style={styles.salaryText}>Transfer Date: {new Date(salary.tanggal_transfer).toLocaleDateString()}</Text>
//                 <Text style={styles.salaryText}>Note: {salary.keterangan}</Text>
//                 <View style={styles.divider} />
//               </View>
//             ))}
//           </View>
//         ) : (
//           <View style={styles.card}>
//             <Text style={styles.header}>Salary History</Text>
//             <Text style={styles.salaryText}>No salary records found.</Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* Modal */}
//       <Modal visible={modalVisible} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Update User</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Username"
//               value={form.Username}
//               onChangeText={(val) => setForm({ ...form, Username: val })}
//             />
//             <TextInput
//               style={styles.input}
//               placeholder="Password"
//               secureTextEntry
//               value={form.Password}
//               onChangeText={(val) => setForm({ ...form, Password: val })}
//             />
//             <View style={styles.dropdownContainer}>
//               <TouchableOpacity
//                 style={styles.dropdownButton}
//                 onPress={() => setShowRoleDropdown(!showRoleDropdown)}
//               >
//                 <Text style={styles.dropdownButtonText}>
//                   {form.Role || 'Select Role'}
//                 </Text>
//               </TouchableOpacity>
//               {showRoleDropdown && (
//                 <View style={styles.dropdownOptions}>
//                   {['admin', 'staff'].map((roleOption) => (
//                     <TouchableOpacity
//                       key={roleOption}
//                       style={styles.dropdownOption}
//                       onPress={() => {
//                         setForm({ ...form, Role: roleOption });
//                         setShowRoleDropdown(false);
//                       }}
//                     >
//                       <Text style={styles.dropdownOptionText}>{roleOption}</Text>
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               )}
//             </View>

//             <View style={styles.modalButtons}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
//                 <Text style={styles.btnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
//                 <Text style={styles.btnText}>Update</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//       <Modal visible={addModalVisible} animationType="slide" transparent>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>Add Salary</Text>
//             <TouchableOpacity onPress={() => setShowMonthPicker(true)} style={styles.input}>
//               <Text style={{ color: newSalary.bulan_gaji ? '#000' : '#aaa' }}>
//                 {newSalary.bulan_gaji || 'Select Month (e.g. 2025-05-01)'}
//               </Text>
//             </TouchableOpacity>
//             {showMonthPicker && (
//               <DateTimePicker
//                 value={newSalary.bulan_gaji ? new Date(newSalary.bulan_gaji) : new Date()}
//                 mode="date"
//                 display="calendar"
//                 onChange={(event, selectedDate) => {
//                   setShowMonthPicker(false);
//                   if (selectedDate) {
//                     setNewSalary({ ...newSalary, bulan_gaji: selectedDate.toISOString().split('T')[0] });
//                   }
//                 }}
//               />
//             )}
//             <TextInput
//               style={styles.input}
//               placeholder="Amount (e.g. 1500000)"
//               keyboardType="numeric"
//               value={newSalary.gaji_perbulan}
//               onChangeText={(val) => setNewSalary({ ...newSalary, gaji_perbulan: val })}
//             />
//             <TouchableOpacity onPress={() => setShowTransferDatePicker(true)} style={styles.input}>
//               <Text style={{ color: newSalary.tanggal_transfer ? '#000' : '#aaa' }}>
//                 {newSalary.tanggal_transfer || 'Select Transfer Date (e.g. 2025-05-02)'}
//               </Text>
//             </TouchableOpacity>
//             {showTransferDatePicker && (
//               <DateTimePicker
//                 value={newSalary.tanggal_transfer ? new Date(newSalary.tanggal_transfer) : new Date()}
//                 mode="date"
//                 display="calendar"
//                 onChange={(event, selectedDate) => {
//                   setShowTransferDatePicker(false);
//                   if (selectedDate) {
//                     setNewSalary({ ...newSalary, tanggal_transfer: selectedDate.toISOString().split('T')[0] });
//                   }
//                 }}
//               />
//             )}
//             <TextInput
//               style={styles.input}
//               placeholder="Notes"
//               value={newSalary.keterangan}
//               onChangeText={(val) => setNewSalary({ ...newSalary, keterangan: val })}
//             />
//             <View style={styles.modalButtons}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalVisible(false)}>
//                 <Text style={styles.btnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.saveBtn} onPress={handleAddSalary}>
//                 <Text style={styles.btnText}>Add</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <TouchableOpacity
//         style={styles.fab}
//         onPress={() => setAddModalVisible(true)}
//       >
//         <Text style={styles.fabText}>+</Text>
//       </TouchableOpacity>

//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     padding: 20,
//     paddingBottom: 100,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: '600',
//     marginBottom: 20,
//     color: '#2c3e50',
//     textAlign: 'center',
//   },
//   infoRow: {
//     marginBottom: 15,
//   },
//   label: {
//     fontSize: 14,
//     color: '#7f8c8d',
//     marginBottom: 5,
//   },
//   value: {
//     fontSize: 16,
//     color: '#34495e',
//     fontWeight: '500',
//   },
//   bottomButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 10,
//   },
//   editBtn: {
//     backgroundColor: '#F3AA36',
//     paddingVertical: 12,
//     paddingHorizontal: 32,
//     borderRadius: 10,
//     marginBottom: 25,
//   },
//   deleteBtn: {
//     backgroundColor: '#F3AA36',
//     paddingVertical: 12,
//     paddingHorizontal: 32,
//     borderRadius: 10,
//     marginBottom: 25,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: '#000000aa',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: '#000',
//     elevation: 8,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#2c3e50',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 12,
//     fontSize: 16,
//     backgroundColor: '#f9f9f9',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   cancelBtn: {
//     backgroundColor: '#f0f0f0',
//     padding: 12,
//     borderRadius: 10,
//     width: '48%',
//     alignItems: 'center',
//   },
//   saveBtn: {
//     backgroundColor: '#F3AA36',
//     padding: 12,
//     borderRadius: 10,
//     width: '48%',
//     alignItems: 'center',
//   },
//   btnText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   dropdownContainer: {
//     marginBottom: 12,
//   },
//   dropdownButton: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 12,
//     backgroundColor: '#f9f9f9',
//   },
//   dropdownButtonText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   dropdownOptions: {
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     marginTop: 4,
//     overflow: 'hidden',
//   },
//   dropdownOption: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   dropdownOptionText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   salaryItem: {
//     marginBottom: 12,
//   },
//   salaryText: {
//     fontSize: 14,
//     color: '#2c3e50',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#ccc',
//     marginTop: 8,
//   },
//   fab: {
//     position: 'absolute',
//     right: 20,
//     bottom: 30,
//     backgroundColor: '#F3AA36',
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 8,
//   },
//   fabText: {
//     fontSize: 32,
//     color: '#fff',
//     fontWeight: 'bold',
//   },

// });
