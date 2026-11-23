import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  FlatList,
  SafeAreaView
} from 'react-native';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [products, setProducts] = useState([
    { id: '1', title: 'PocketSim Cloud Suite', price: '$29/mo' },
    { id: '2', title: 'Virtual GPU Instance', price: '$79/mo' },
    { id: '3', title: 'Autonomous AI Swarm Worker', price: '$99/mo' }
  ]);

  const handleLogin = () => {
    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true);
    }, 400);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authBox}>
          <Text style={styles.authTitle} testID="login-screen-title">Sign In to Dashboard</Text>
          <Text style={styles.authSubtitle}>PocketSim Multi-screen Auth Flow</Text>

          {errorMessage ? (
            <View style={styles.errorAlert} testID="error-alert">
              <Text style={styles.errorAlertText}>{errorMessage}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            placeholder="Work Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            testID="email-input"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            testID="password-input"
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={styles.submitButton}
            testID="login-submit-btn"
            disabled={isLoading}
            onPress={handleLogin}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Continue</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} testID="dashboard-title">Dashboard</Text>
        <Pressable style={styles.logoutButton} testID="logout-btn" onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Active Cloud Workloads</Text>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCard} testID={`product-${item.id}`}>
            <Text style={styles.productTitle}>{item.title}</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    padding: 20
  },
  authBox: {
    marginTop: 60,
    backgroundColor: '#181B21',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#30363D'
  },
  authTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6
  },
  authSubtitle: {
    fontSize: 13,
    color: '#8B949E',
    marginBottom: 20
  },
  input: {
    height: 46,
    backgroundColor: '#21262D',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 8,
    paddingHorizontal: 14,
    color: '#FFF',
    marginBottom: 14
  },
  submitButton: {
    height: 46,
    backgroundColor: '#388BFD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15
  },
  errorAlert: {
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderWidth: 1,
    borderColor: '#F85149',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14
  },
  errorAlertText: {
    color: '#F85149',
    fontSize: 13
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF'
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#21262D',
    borderRadius: 6
  },
  logoutButtonText: {
    color: '#8B949E',
    fontSize: 12
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B949E',
    textTransform: 'uppercase',
    marginBottom: 12
  },
  productCard: {
    backgroundColor: '#181B21',
    borderWidth: 1,
    borderColor: '#30363D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500'
  },
  productPrice: {
    color: '#3FB950',
    fontWeight: 'bold',
    fontSize: 14
  }
});
