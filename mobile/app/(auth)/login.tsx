import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Lock, Mail, ArrowRight } from 'lucide-react-native';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import axios from 'axios';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username,
        password,
      });

      const { token, user } = response.data;
      await login(token, user);
      // Navigation will be handled by the root _layout based on auth state
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <ArrowRight color="white" size={32} />
            </View>
          </View>
          <Text style={styles.title}>EcoSmart Worker</Text>
          <Text style={styles.subtitle}>Enter your credentials to access the hub</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#94a3b8"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerLink}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerLinkHighlight}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c101d',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#38bdf8',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  registerLinkHighlight: {
    color: '#38bdf8',
    fontWeight: '600',
  },
});
