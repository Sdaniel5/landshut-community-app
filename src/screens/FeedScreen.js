import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { filterBadWords, containsBadWords } from '../lib/badwords';

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSession();
    loadMessages();
    subscribeToMessages();
  }, []);

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);

    if (!session) {
      // Auto sign-in anonymous user
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error) {
        setSession(data.session);
      }
    }
  }

  async function loadMessages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('community_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading messages:', error);
    } else {
      setMessages((data || []).reverse());
    }
    setLoading(false);
  }

  function subscribeToMessages() {
    const subscription = supabase
      .channel('messages_channel')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_messages' },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  async function handleSendMessage() {
    if (!newMessage.trim()) return;

    if (containsBadWords(newMessage)) {
      Alert.alert(
        'Unangemessene Sprache',
        'Ihre Nachricht enthält unangemessene Wörter. Bitte formulieren Sie höflich.'
      );
      return;
    }

    if (!session) {
      Alert.alert('Fehler', 'Sie müssen angemeldet sein, um Nachrichten zu senden.');
      return;
    }

    const filteredMessage = filterBadWords(newMessage);

    const { error } = await supabase
      .from('community_messages')
      .insert([
        {
          user_id: session.user.id,
          message: filteredMessage,
        },
      ]);

    if (error) {
      Alert.alert('Fehler', 'Nachricht konnte nicht gesendet werden.');
      console.error(error);
    } else {
      setNewMessage('');
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function formatUserId(userId) {
    if (!userId) return 'Anonym';
    return `User ${userId.substring(0, 6)}`;
  }

  function renderMessage({ item }) {
    const isOwnMessage = session && item.user_id === session.user.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && (
          <Text style={[styles.userName, { color: isDark ? '#AAA' : '#666' }]}>
            {formatUserId(item.user_id)}
          </Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage
              ? { backgroundColor: '#2196F3' }
              : { backgroundColor: isDark ? '#2A2A2A' : '#E0E0E0' },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isOwnMessage ? '#FFF' : isDark ? '#FFF' : '#000' },
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              { color: isOwnMessage ? '#E0E0E0' : isDark ? '#888' : '#666' },
            ]}
          >
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5' }]}>
        <TextInput
          style={[styles.input, { color: isDark ? '#FFF' : '#000' }]}
          placeholder="Nachricht schreiben..."
          placeholderTextColor={isDark ? '#888' : '#666'}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: newMessage.trim() ? '#2196F3' : '#888' },
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    padding: 10,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '75%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  userName: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 8,
  },
  messageBubble: {
    borderRadius: 15,
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});
