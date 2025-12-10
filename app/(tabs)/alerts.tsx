import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type AlertItem = {
  id: string;
  title: string;
  description: string;
  level: 'High' | 'Medium' | 'Info';
};

const ALERTS: AlertItem[] = [
  {
    id: '1',
    title: 'Heavy rain warning',
    description: 'Avoid low-lying roads between 6pm-10pm. Metro running at reduced speed.',
    level: 'High',
  },
  {
    id: '2',
    title: 'Traffic congestion',
    description: 'Major jam near Central Square due to repair work. Use Ring Road detour.',
    level: 'Medium',
  },
  {
    id: '3',
    title: 'Community drive',
    description: 'Blood donation camp at City Hospital this Saturday, 9am-2pm.',
    level: 'Info',
  },
  {
    id: '4',
    title: 'Water supply update',
    description: 'Maintenance in Sector 12 tonight. Storage advised, supply back by 6am.',
    level: 'Medium',
  },
];

const levelColors: Record<AlertItem['level'], string> = {
  High: '#fee2e2',
  Medium: '#fef9c3',
  Info: '#e0f2fe',
};

export default function AlertsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Emergency alerts</Text>
      <FlatList
        data={ALERTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: levelColors[item.level] }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.badge}>{item.level}</Text>
            </View>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 12,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#0ea5e9',
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  cardDescription: {
    color: '#334155',
    fontSize: 14,
  },
});

