import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import MapHeaderCard from '../components/MapHeaderCard';
import BlitzerFeedList from '../components/BlitzerFeedList';
import { supabase } from '../lib/supabase';

export default function DashboardScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReports();
    
    // Subscribe to realtime updates
    const subscription = supabase
      .channel('reports-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reports'
        },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleVote = async (reportId) => {
    try {
      // Get current report
      const { data: report, error: fetchError } = await supabase
        .from('reports')
        .select('votes')
        .eq('id', reportId)
        .single();

      if (fetchError) throw fetchError;

      const newVotes = (report.votes || 0) + 1;

      // Update votes
      const { error: updateError } = await supabase
        .from('reports')
        .update({ votes: newVotes })
        .eq('id', reportId);

      if (updateError) throw updateError;

      // Auto-delete if >= 15 votes
      if (newVotes >= 15) {
        const { error: deleteError } = await supabase
          .from('reports')
          .delete()
          .eq('id', reportId);

        if (deleteError) throw deleteError;
      }

      fetchReports();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleExpandMap = () => {
    navigation.navigate('FullMap', { reports });
  };

  const handleItemPress = (report) => {
    // Navigate to map and center on report
    navigation.navigate('FullMap', { 
      reports,
      focusReportId: report.id 
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F5F5F5' }]}>
      <MapHeaderCard 
        reports={reports}
        onExpand={handleExpandMap}
        isDark={isDark}
      />
      
      <BlitzerFeedList
        reports={reports}
        onVote={handleVote}
        onItemPress={handleItemPress}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
