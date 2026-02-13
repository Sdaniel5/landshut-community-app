import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NeonGlassCard from './NeonGlassCard';
import { useTheme } from '../contexts/ThemeContext';

export default function BlitzerFeedItem({ report, onVote, onPress }) {
  const { theme } = useTheme();

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

  // Enable pulse animation for reports less than 30 seconds old
  const isNew = () => {
    const now = new Date();
    const created = new Date(report.created_at);
    const diffSeconds = (now - created) / 1000;
    return diffSeconds < 30;
  };

  const icon = report.type === 'blitzer' ? 'camera' : 'shield';
  const neonColor = report.type === 'blitzer'
    ? theme.neon.blitzer.primary
    : theme.neon.zivilstreife.primary;

  const sourceBadge = report.source === 'whatsapp' ? 'WhatsApp' : 'Manuell';
  const sourceBadgeColor = report.source === 'whatsapp' ? '#25D366' : '#2196F3';

  return (
    <NeonGlassCard
      type={report.type}
      glowIntensity={0.5}
      animated={isNew()}
      animationDuration={2000}
      style={styles.cardContainer}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.cardContent}
      >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: `${neonColor}20` } // 20% opacity
          ]}
        >
          <Ionicons name={icon} size={24} color={neonColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.street, { color: theme.colors.text }]}>
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
          style={[styles.description, { color: theme.colors.textSecondary }]}
          numberOfLines={2}
        >
          {report.description}
        </Text>
      )}

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.voteButton,
            { backgroundColor: `${neonColor}20` }
          ]}
          onPress={() => onVote(report.id)}
        >
          <Ionicons name="thumbs-up-outline" size={18} color={neonColor} />
          <Text style={[styles.voteText, { color: neonColor }]}>
            {report.votes}/15 Votes
          </Text>
        </TouchableOpacity>
      </View>
      </TouchableOpacity>
    </NeonGlassCard>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 15,
    marginVertical: 8,
  },
  cardContent: {
    padding: 15,
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
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  voteText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
