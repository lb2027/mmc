import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InvoiceWebView() {
  const { transaction_id } = useLocalSearchParams();
  const [headers, setHeaders] = useState<{ [key: string]: string } | null>(null);

  const invoiceUrl = `http://103.16.116.58:5050/invoice/generate-html?transaction_id=${transaction_id}`;

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('token'); // adjust key if needed
      if (token) {
        setHeaders({
          token: token ? token : '',
          'Content-Type': 'application/json',
        });
      } else {
        console.warn('Token not found in AsyncStorage');
      }
    };

    fetchToken();
  }, []);

  if (!headers) {
    return <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: invoiceUrl, headers }}
        startInLoadingState
        renderLoading={() => <ActivityIndicator size="large" color="#F3AA36" style={{ marginTop: 20 }} />}
      />
    </View>
  );
}
