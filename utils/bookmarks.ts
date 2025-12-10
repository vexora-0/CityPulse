import AsyncStorage from '@react-native-async-storage/async-storage';

export type NewsArticle = {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt?: string;
  source?: string;
};

const STORAGE_KEY = '@citypulse_bookmarks';

export async function getBookmarks(): Promise<NewsArticle[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NewsArticle[]) : [];
  } catch (error) {
    console.warn('Failed to load bookmarks', error);
    return [];
  }
}

export async function saveBookmarks(items: NewsArticle[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Failed to save bookmarks', error);
  }
}

export async function toggleBookmark(article: NewsArticle): Promise<NewsArticle[]> {
  const existing = await getBookmarks();
  const exists = existing.some((item) => item.url === article.url);
  const updated = exists ? existing.filter((item) => item.url !== article.url) : [article, ...existing];
  await saveBookmarks(updated);
  return updated;
}

export function isBookmarked(list: NewsArticle[], article: NewsArticle) {
  return list.some((item) => item.url === article.url);
}

