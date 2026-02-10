import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MessagesTab = ({ addTransaction, transactions, userId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const flatListRef = useRef(null);

  // Convert transactions to message format
  useEffect(() => {
    const formattedMessages = transactions.map(tx => ({
      id: tx.id,
      text: tx.raw_text || tx.description,
      isUser: true,
      timestamp: new Date(tx.created_at).toLocaleTimeString('en-TZ', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      response: `✅ ${tx.category}: TZS ${tx.amount.toLocaleString()}`
    }));
    
    // Add system responses
    const allMessages = [];
    formattedMessages.forEach(tx => {
      allMessages.push({
        id: `${tx.id}-user`,
        text: tx.text,
        isUser: true,
        timestamp: tx.timestamp,
      });
      allMessages.push({
        id: `${tx.id}-system`,
        text: tx.response,
        isUser: false,
        timestamp: tx.timestamp,
      });
    });
    
    setMessages(allMessages.reverse());
  }, [transactions]);

  const handleSend = async () => {
    if (!message.trim() || isProcessing) return;
    
    const userMessage = message.trim();
    setMessage('');
    
    // Add user message immediately
    const userMsg = {
      id: `user-${Date.now()}`,
      text: userMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('en-TZ', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    };
    
    setMessages(prev => [userMsg, ...prev]);
    setIsProcessing(true);
    
    try {
      // Send to backend
      const response = await addTransaction(userMessage);
      
      // Add system response
      const systemMsg = {
        id: `system-${Date.now()}`,
        text: response,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-TZ', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      };
      
      setMessages(prev => [systemMsg, ...prev]);
    } catch (error) {
      const errorMsg = {
        id: `error-${Date.now()}`,
        text: '❌ Error processing transaction',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('en-TZ', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      };
      setMessages(prev => [errorMsg, ...prev]);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.isUser ? styles.userBubble : styles.systemBubble
    ]}>
      <Text style={[
        styles.messageText,
        item.isUser ? styles.userText : styles.systemText
      ]}>
        {item.text}
      </Text>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WMTB Ledger</Text>
        <Text style={styles.headerSubtitle}>Type transactions like texting</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted={true}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="lunch 15000, mpesa received 50000..."
          placeholderTextColor="#999"
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!isProcessing}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!message.trim() || isProcessing) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim() || isProcessing}
        >
          <Icon 
            name={isProcessing ? "hourglass-empty" : "send"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Examples:</Text>
        <View style={styles.exampleRow}>
          <TouchableOpacity 
            style={styles.exampleButton}
            onPress={() => setMessage('lunch 15000')}
          >
            <Text style={styles.exampleText}>lunch 15000</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.exampleButton}
            onPress={() => setMessage('mpesa received 50000 from john')}
          >
            <Text style={styles.exampleText}>mpesa income</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.exampleButton}
            onPress={() => setMessage('fuel 80000')}
          >
            <Text style={styles.exampleText}>fuel 80000</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  messagesList: {
    padding: 15,
    paddingBottom: 80,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  systemBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#fff',
  },
  systemText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  helpContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 15,
  },
  helpTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exampleButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
  },
  exampleText: {
    fontSize: 12,
    color: '#007AFF',
  },
});

export default MessagesTab;
