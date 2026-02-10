import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const Dashboard = ({ balance, transactions }) => {
  // Calculate days until broke (simple: balance / avg daily spend)
  const calculateDaysUntilBroke = () => {
    if (transactions.length < 7) return 'Not enough data';
    
    const lastWeek = transactions.slice(0, 7);
    const totalSpent = lastWeek.reduce((sum, tx) => {
      return tx.type === 'expense' ? sum + tx.amount : sum;
    }, 0);
    
    const avgDailySpend = totalSpent / 7;
    if (avgDailySpend <= 0) return '∞';
    
    const days = balance / avgDailySpend;
    return Math.floor(days);
  };

  // Prepare chart data (last 7 days)
  const prepareChartData = () => {
    const last7Days = Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('en-TZ', { weekday: 'short' });
    }).reverse();

    const amounts = Array(7).fill(0);
    transactions.forEach(tx => {
      const txDate = new Date(tx.created_at);
      const daysAgo = Math.floor((new Date() - txDate) / (1000 * 60 * 60 * 24));
      if (daysAgo >= 0 && daysAgo < 7) {
        amounts[6 - daysAgo] += tx.type === 'income' ? tx.amount : -tx.amount;
      }
    });

    return {
      labels: last7Days,
      datasets: [{
        data: amounts,
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
      }]
    };
  };

  const chartData = prepareChartData();
  const daysUntilBroke = calculateDaysUntilBroke();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>TZS {balance.toLocaleString()}</Text>
        <Text style={styles.daysUntilBroke}>
          ⏳ Days until broke: {daysUntilBroke}
        </Text>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>7-Day Cash Flow</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#007AFF',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.recentCard}>
        <Text style={styles.recentTitle}>Recent Transactions</Text>
        {transactions.slice(0, 5).map((tx, index) => (
          <View key={index} style={styles.transactionItem}>
            <View>
              <Text style={styles.transactionDesc}>{tx.description}</Text>
              <Text style={styles.transactionCategory}>{tx.category}</Text>
            </View>
            <Text style={[
              styles.transactionAmount,
              tx.type === 'income' ? styles.income : styles.expense
            ]}>
              {tx.type === 'income' ? '+' : '-'}TZS {tx.amount.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  daysUntilBroke: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  chart: {
    borderRadius: 16,
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionDesc: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  income: {
    color: '#34C759',
  },
  expense: {
    color: '#FF3B30',
  },
});

export default Dashboard;
