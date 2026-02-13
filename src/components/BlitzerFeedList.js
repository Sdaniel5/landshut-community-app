import React from 'react';
import { View, FlatList, Text, StyleSheet, RefreshControl } from 'react-native';
import BlitzerFeedItem from './BlitzerFeedItem';

export default function BlitzerFeedList({ 
  reports, 
  onVote, 
  onItemPress, 
  onRefresh, 
  refreshing,
  isDark 
}) {
  if (reports.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: isDark ? '#AAA' : '#666' }]}>
          Aktuell keine Blitzer-Meldungen 📸
        </Text>
        <Text style={[styles.emptySubtext, { color: isDark ? '#777' : '#999' }]}>
          Sei der Erste und melde einen Blitzer!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reports}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <BlitzerFeedItem
          report={item}
          onVote={onVote}
          onPress={() => onItemPress(item)}
          isDark={isDark}
        />
      )}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2196F3"
          colors={['#2196F3']}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
