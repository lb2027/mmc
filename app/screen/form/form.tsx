import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

export default function FormScreen() {
  const titleRef = useRef<string>('');
  const descriptionRef = useRef<string>('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const handleTitleChange = (text: string) => {
    setTitle(text);
    titleRef.current = text;
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    descriptionRef.current = text;
  };

  useEffect(() => {
    console.log('Title:', titleRef.current);
    console.log('Description:', descriptionRef.current);
  }, [title, description]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color="#F3AA36" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header Preview */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Preview</Text>
        <Text style={styles.previewText}>Title: {titleRef.current}</Text>
        <Text style={styles.previewText}>Description: {descriptionRef.current}</Text>
      </View>

      {/* Input Form */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter title"
          value={title}
          onChangeText={handleTitleChange}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Enter description"
          value={description}
          onChangeText={handleDescriptionChange}
          multiline
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F3AA36',
    paddingVertical: 30,
    paddingHorizontal: 20, // gap left and right
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: 'white',
    marginBottom: 10,
  },
  previewText: {
    fontFamily: 'Poppins_400Regular',
    color: 'white',
    fontSize: 16,
  },
  formContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  label: {
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    marginTop: 20,
  },
  input: {
    fontFamily: 'Poppins_400Regular',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
});
