import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RulesTab = () => {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Low Balance Alert',
      description: 'Alert when balance below TZS 50,000',
      isActive: true,
      icon: 'warning',
    },
    {
      id: 2,
      name: 'Auto-Categorize M-Pesa',
      description: 'Parse M-Pesa SMS automatically',
      isActive: true,
      icon: 'sms',
    },
    {
      id: 3,
      name: 'Weekly Spending Report',
      description: 'Send report every Sunday',
      isActive: false,
      icon: 'assessment',
    },
    {
      id: 4,
      name: 'Save 10% of Income',
      description: 'Auto-save to virtual envelope',
      isActive: true,
      icon: 'savings',
    },
    {
      id: 5,
      name: 'Food Budget Limit',
      description: 'Alert when food spending > TZS 100,000/month',
      isActive: true,
      icon: 'restaurant',
    },
  ]);

  const toggleRule = (id) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="settings" size={30} color="#007AFF" />
        <Text style={styles.headerTitle}>Automation Rules</Text>
        <Text style={styles.headerSubtitle}>Set how WMTB should manage your money</Text>
      </View>

      {rules.map(rule => (
        <View key={rule.id} style={styles.ruleCard}>
          <View style={styles.ruleHeader}>
            <Icon name={rule.icon} size={24} color="#007AFF" style={styles.ruleIcon} />
            <View style={styles.ruleInfo}>
              <Text style={styles.ruleName}>{rule.name}</Text>
              <Text style={styles.ruleDescription}>{rule.description}</Text>
            </View>
            <Switch
              value={rule.isActive}
              onValueChange={() => toggleRule(rule.id)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={rule.isActive ? '#007AFF' : '#f4f3f4'}
            />
          </View>
          {rule.isActive && (
            <View style={styles.ruleActive}>
              <Icon name="check-circle" size={16} color="#34C759" />
              <Text style={styles.ruleActiveText}>Active</Text>
            </View>
          )}
        </View>
      ))}

      <View style={styles.addRuleCard}>
        <Icon name="add-circle" size={24} color="#007AFF" />
        <Text style={styles.addRuleText}>Add Custom Rule</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How Rules Work</Text>
        <Text style={styles.infoText}>
          • Rules run automatically in the background{'\n'}
          • You'll get notifications when rules trigger{'\n'}
          • No real money is moved without your confirmation{'\n'}
          • All rules can be turned off anytime
        </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  ruleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleIcon: {
    marginRight: 12,
  },
  ruleInfo: {
    flex: 1,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#666',
  },
  ruleActive: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  ruleActiveText: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 5,
    fontWeight: '500',
  },
  addRuleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addRuleText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#e8f4ff',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default RulesTab;
