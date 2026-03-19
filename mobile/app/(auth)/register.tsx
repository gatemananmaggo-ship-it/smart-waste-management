import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Lock, Mail, Globe, MapPin } from 'lucide-react-native';
import { useAuth, API_BASE_URL } from '../../context/AuthContext';
import axios from 'axios';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    area_access: 'Worker'
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    const { username, email, password } = formData;
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, formData);
      Alert.alert('Success', 'Account created! Please login.', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') }
      ]);
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Registration failed.';
      Alert.alert('Error', message);
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the urban waste management team</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <User size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#94a3b8"
              value={formData.username}
              onChangeText={(text) => setFormData({...formData, username: text})}
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
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
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
            />
          </View>

          {/* Location fields removed as workers join via Hub ID */}

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => router.back()}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLinkHighlight}>Login</Text>
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
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 8,
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
  row: {
    flexDirection: 'row',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#38bdf8',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 40,
  },
  loginText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: '#38bdf8',
    fontWeight: '600',
  },
});
