import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, useNavigation } from 'expo-router';

export default function ArticleScreen() {
  const params = useLocalSearchParams<{ url?: string; title?: string }>();
  const navigation = useNavigation();

  useEffect(() => {
    if (params?.title) {
      navigation.setOptions({ title: String(params.title) });
    }
  }, [navigation, params?.title]);

  if (!params.url || Array.isArray(params.url)) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>No article URL provided.</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: params.url }}
      startInLoadingState
      renderLoading={() => (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fallbackText: {
    color: '#0f172a',
    fontSize: 16,
    textAlign: 'center',
  },
});

