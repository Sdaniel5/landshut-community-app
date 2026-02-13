import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FAQAccordion({ items, searchQuery = '' }) {
  const { theme } = useTheme();
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleItem = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (expandedItems.includes(index)) {
      setExpandedItems(expandedItems.filter(i => i !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  const highlightText = (text, query) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => (
      part.toLowerCase() === query.toLowerCase() ? (
        <Text key={index} style={{ backgroundColor: theme.colors.primary + '40', fontWeight: 'bold' }}>
          {part}
        </Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    ));
  };

  if (filteredItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={60} color={theme.colors.textTertiary} />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Keine FAQ-Einträge gefunden
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
          Versuche eine andere Suche
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {filteredItems.map((item, index) => {
        const isExpanded = expandedItems.includes(index);
        
        return (
          <View
            key={index}
            style={[
              styles.item,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.header}
              onPress={() => toggleItem(index)}
              activeOpacity={0.7}
            >
              <View style={styles.headerContent}>
                {item.icon && (
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={theme.colors.primary} 
                    style={styles.icon}
                  />
                )}
                <Text style={[styles.question, { color: theme.colors.text, flex: 1 }]}>
                  {highlightText(item.question, searchQuery)}
                </Text>
              </View>
              <Ionicons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            {isExpanded && (
              <View style={[styles.answerContainer, { borderTopColor: theme.colors.border }]}>
                <Text style={[styles.answer, { color: theme.colors.textSecondary }]}>
                  {highlightText(item.answer, searchQuery)}
                </Text>
                
                {item.tags && item.tags.length > 0 && (
                  <View style={styles.tagsContainer}>
                    {item.tags.map((tag, tagIndex) => (
                      <View
                        key={tagIndex}
                        style={[
                          styles.tag,
                          {
                            backgroundColor: theme.colors.primary + '20',
                            borderColor: theme.colors.primary + '40',
                          },
                        ]}
                      >
                        <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  item: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  icon: {
    marginRight: 12,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  answer: {
    fontSize: 15,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
