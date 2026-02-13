import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BlitzerFeedItem({ report, onVote, onPress, isDark }) {
  const timeAgo = (timestamp) => {
    const now = new Date();
    const created = new Date(timestamp);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `Vor ${diffMins} Min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Vor ${diffHours} Std`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  };

  const icon = report.type === 'blitzer' ? 'camera' : 'shield';
  const iconColor = report.type === 'blitzer' ? '#FF5252' : '#FFA726';
  const sourceBadge = report.source === 'whatsapp' ? 'WhatsApp' : 'Manuell';
  const sourceBadgeColor = report.source === 'whatsapp' ? '#25D366' : '#2196F3';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.street, { color: isDark ? '#FFF' : '#000' }]}>
            {report.street}
          </Text>
          <View style={styles.meta}>
            <Text style={styles.timeAgo}>{timeAgo(report.created_at)}</Text>
            <View style={[styles.sourceBadge, { backgroundColor: sourceBadgeColor }]}>
              <Text style={styles.sourceBadgeText}>{sourceBadge}</Text>
            </View>
          </View>
        </View>
      </View>

      {report.description && (
        <Text 
          style={[styles.description, { color: isDark ? '#AAA' : '#666' }]}
          numberOfLines={2}
        >
          {report.description}
        </Text>
      )}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.voteButton}
          onPress={() => onVote(report.id)}
        >
          <Ionicons name="thumbs-up-outline" size={18} color="#2196F3" />
          <Text style={styles.voteText}>{report.votes}/15 Votes</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  street: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
  },
  sourceBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sourceBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  voteText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
