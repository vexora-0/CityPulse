# City Pulse – Smart City News & Alerts App

A React Native app for city-based news, bookmarks, and emergency alerts.

## Features

- 📍 City selection (New Delhi, Mumbai, Bengaluru, etc.)
- 📰 News feed with pull-to-refresh
- 🔖 Bookmark articles (saved with AsyncStorage)
- 🚨 Emergency alerts (color-coded)
- 🌐 WebView for reading full articles

## Setup

```bash
npm install
npx expo start
```

## API Key (Optional)

For live news, add `EXPO_PUBLIC_NEWS_API_KEY` to your environment. The app works with mock data if no key is provided.

## Tech Stack

- Expo Router
- React Navigation
- Axios
- AsyncStorage
- React Native WebView
