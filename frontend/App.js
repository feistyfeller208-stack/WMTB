import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import Dashboard from './components/Dashboard';
import MessagesTab from './components/MessagesTab';
import RulesTab from './components/RulesTab';

const Tab = createBottomTabNavigator();

// Backend URL - CHANGE THIS TO YOUR BACKEND URL
const BACKEND_URL = 'http://localhost:5000'; // Change when deployed

export default function App() {
  // For demo - in real app, use proper auth
  const [userId] = useState('demo-user-123');
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/balance/${userId}`);
      const data = await response.json();
      setBalance(data.balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/transactions/${userId}`);
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const addTransaction = async (text) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          text: text,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setBalance(data.balance);
        fetchTransactions(); // Refresh list
        return data.message;
      }
      return '❌ Error adding transaction';
    } catch (error) {
      console.error('Error:', error);
      return '❌ Network error';
    }
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Dashboard') {
              iconName = 'dashboard';
            } else if (route.name === 'Messages') {
              iconName = 'message';
            } else if (route.name === 'Rules') {
              iconName = 'settings';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Dashboard">
          {() => <Dashboard balance={balance} transactions={transactions} />}
        </Tab.Screen>
        <Tab.Screen name="Messages">
          {() => <MessagesTab 
            addTransaction={addTransaction} 
            transactions={transactions}
            userId={userId}
          />}
        </Tab.Screen>
        <Tab.Screen name="Rules" component={RulesTab} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
