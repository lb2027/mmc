import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Button,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';

const PreviewHeader = ({ title, description }: { title: string; description: string }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Preview</Text>
    <Text style={styles.previewText}>Title: {title}</Text>
    <Text style={styles.previewText}>Description: {description}</Text>
  </View>
);

export default function FormScreen() {
  const formRef = useRef<{[key:string]:HTMLInputElement|null}>({});

  const [form, setForm] = useState({ title: '', description: '', numbers:  ''});

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  const handleChange = useCallback((key: keyof typeof form, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };
      // formRef.current = updated;
      return updated;
    });
  }, []);

  const handleInput = ()=> {
    const total = parseInt(formRef.current['title']?.value) + parseInt(formRef.current['description']?.value);
    const updated = { ...form, 
      title: formRef.current['title']?.value,
      description: formRef.current['description']?.value,
      numbers: ''+total,
    };
    setForm(updated);
  }

  const handleSubmit = () => {
    if (!form.title.trim() || !form.description.trim()) {
      Alert.alert('Validation', 'Please fill in all fields.');
      return;
    }
    Alert.alert('Submitted', 'Form submitted successfully!');
    console.log('Submitted:', form);
  };

  useEffect(() => {
    if (__DEV__) {
      console.log('Form Updated:', formRef.current);
    }
  }, [form]);

  if (!fontsLoaded) {
    return (
      <ActivityIndicator
        size="large"
        color="#F3AA36"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );
  }

  const fields = [
    { key: 'title', label: 'Title', multiline: false },
    { key: 'description', label: 'Description', multiline: true },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <PreviewHeader title={form.title} description={form.numbers} />

      <ScrollView contentContainerStyle={styles.formContainer}>
        {fields.map(field => (
          <View key={field.key}>
            <Text style={styles.label}>{field.label}</Text>
            {/* <TextInput
              style={[styles.input, field.multiline && { height: 100 }]}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              value={form[field.key as keyof typeof form]}
              onChangeText={text => handleChange(field.key as keyof typeof form, text)}
              multiline={field.multiline}
            /> */}
            <input 
            placeholder={`Enter ${field.label}`}
            ref={(el)=>(formRef.current[field.key] = el)}
            />
          </View>
        ))}

        <View style={{ marginTop: 30 }}>
          <Button title="Save" onPress={handleInput} color="#F3AA36" />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F3AA36',
    paddingVertical: 30,
    paddingHorizontal: 20,
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
