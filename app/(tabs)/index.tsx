import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NewsArticle, getBookmarks, isBookmarked, toggleBookmark } from '@/utils/bookmarks';

const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;
const CITIES = ['New Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune'];
const MOCK_ARTICLES: NewsArticle[] = [
  {
    title: 'City metro expands to new neighborhoods',
    description: 'Daily commute eases as the metro adds three new stops across the city.',
    url: 'https://newsapi.mock/city-metro',
    urlToImage:
      'https://images.unsplash.com/photo-1506617420156-8e4536971650?auto=format&fit=crop&w=1200&q=80',
    publishedAt: new Date().toISOString(),
    source: 'City Pulse',
  },
  {
    title: 'Green drive: Parks to get more trees this monsoon',
    description: 'The city council approves a plan to plant 50,000 saplings near public spaces.',
    url: 'https://newsapi.mock/green-drive',
    urlToImage:
      'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=1200&q=80',
    publishedAt: new Date().toISOString(),
    source: 'City Pulse',
  },
  {
    title: 'Night food streets to open this weekend',
    description: 'Vendors prepare to serve late-night diners in the new designated zones.',
    url: 'https://newsapi.mock/food-street',
    urlToImage:
      'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80',
    publishedAt: new Date().toISOString(),
    source: 'City Pulse',
  },
];

const cardColors = ['#e0f2fe', '#f1f5f9', '#fef9c3'];

const formatDate = (value?: string) => {
  if (!value) return 'Just now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  return parsed.toLocaleString();
};

export default function NewsScreen() {
  const router = useRouter();
  const [city, setCity] = useState<string>(CITIES[0]);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    fetchNews();
  }, [city, fetchNews]);

  const loadBookmarks = useCallback(async () => {
    const saved = await getBookmarks();
    setBookmarks(saved);
  }, []);

  const fetchNews = useCallback(
    async (isRefresh = false) => {
      setError('');
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        let incoming: NewsArticle[] = [];
        if (NEWS_API_KEY) {
          const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
              q: city,
              language: 'en',
              sortBy: 'publishedAt',
              pageSize: 20,
              apiKey: NEWS_API_KEY,
            },
          });

          incoming =
            response.data?.articles?.map((item: any) => ({
              title: item.title ?? 'Untitled',
              description: item.description ?? 'No description available.',
              url: item.url,
              urlToImage: item.urlToImage,
              publishedAt: item.publishedAt,
              source: item.source?.name,
            })) || [];
        } else {
          incoming = MOCK_ARTICLES;
          setError('Using fallback data. Add EXPO_PUBLIC_NEWS_API_KEY for live news.');
        }

        const cleaned = incoming.filter((article) => !!article.url);
        setArticles(cleaned.length ? cleaned : MOCK_ARTICLES);
      } catch {
        setError('Could not fetch latest news. Showing fallback list.');
        setArticles(MOCK_ARTICLES);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [city],
  );

  const handleBookmark = useCallback(async (article: NewsArticle) => {
    const updated = await toggleBookmark(article);
    setBookmarks(updated);
  }, []);

  const openArticle = useCallback(
    (article: NewsArticle) => {
      if (!article.url) return;
      router.push({ pathname: '/article', params: { url: article.url, title: article.title } });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: NewsArticle; index: number }) => {
      const bookmarked = isBookmarked(bookmarks, item);
      return (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: cardColors[index % cardColors.length] }]}
          activeOpacity={0.9}
          onPress={() => openArticle(item)}>
          {item.urlToImage ? <Image source={{ uri: item.urlToImage }} style={styles.cardImage} /> : null}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardSource}>{item.source ?? city} · {formatDate(item.publishedAt)}</Text>
            <Text style={styles.cardDescription} numberOfLines={3}>
              {item.description}
            </Text>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleBookmark(item);
                }}
                style={[styles.tag, bookmarked ? styles.tagActive : undefined]}>
                <Text style={bookmarked ? styles.tagTextActive : styles.tagText}>
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.readHint}>Tap card to read</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [bookmarks, city, handleBookmark, openArticle],
  );

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>City Pulse</Text>
          <Text style={styles.title}>Smart city news & alerts</Text>
        </View>
        <TouchableOpacity style={styles.cityButton} onPress={() => setShowCityPicker(true)}>
          <Text style={styles.cityButtonLabel}>{city}</Text>
          <Text style={styles.cityButtonHint}>Change city</Text>
        </TouchableOpacity>
      </View>
    ),
    [city],
  );

  return (
    <SafeAreaView style={styles.container}>
      {header}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {loading && !refreshing ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loaderText}>Loading news for {city}...</Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.url}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchNews(true)} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No articles yet</Text>
              <Text style={styles.emptyText}>Pull down to refresh or pick another city.</Text>
            </View>
          }
          contentContainerStyle={articles.length ? styles.list : styles.emptyContainer}
        />
      )}

      <Modal visible={showCityPicker} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose your city</Text>
            {CITIES.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.modalOption, option === city && styles.modalOptionActive]}
                onPress={() => {
                  setCity(option);
                  setShowCityPicker(false);
                }}>
                <Text style={[styles.modalOptionText, option === city && styles.modalOptionTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowCityPicker(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  cityButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cityButtonLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  cityButtonHint: {
    color: '#e0f2fe',
    fontSize: 12,
  },
  errorText: {
    marginHorizontal: 16,
    marginBottom: 4,
    color: '#ea580c',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loaderText: {
    color: '#0f172a',
  },
  list: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 14,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSource: {
    fontSize: 12,
    color: '#475569',
  },
  cardDescription: {
    fontSize: 14,
    color: '#334155',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  tagActive: {
    backgroundColor: '#0ea5e9',
  },
  tagText: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  tagTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  readHint: {
    fontSize: 12,
    color: '#475569',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyText: {
    color: '#475569',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  modalOption: {
    paddingVertical: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  modalOptionActive: {
    backgroundColor: '#e0f2fe',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#0f172a',
  },
  modalOptionTextActive: {
    fontWeight: '700',
  },
  modalClose: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  modalCloseText: {
    color: '#0ea5e9',
    fontWeight: '700',
  },
});
