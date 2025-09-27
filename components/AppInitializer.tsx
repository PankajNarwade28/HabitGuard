import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import DigitalWellbeingService from '@/services/DigitalWellbeingService';

const { width, height } = Dimensions.get('window');

interface AppInitializerProps {
  children?: React.ReactNode;
  onInitializationComplete: (hasPermission: boolean) => void;
}

export function AppInitializer({ children, onInitializationComplete }: AppInitializerProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationStep, setInitializationStep] = useState('Starting...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setInitializationStep('Welcome to HabitGuard! 🛡️');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setInitializationStep('Initializing Digital Wellbeing...');
      
      // Initialize the service
      const service = DigitalWellbeingService.getInstance();
      await service.initialize();
      
      // Check current permission status
      const permissionStatus = service.getPermissionStatus();
      
      // Always request permission to ensure we have access
      setInitializationStep('📊 Accessing your digital wellbeing data...');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setInitializationStep('🔐 Requesting screen time permissions...');
      
      // Force permission request every time to ensure access
      const granted = await service.requestPermission();
      
      if (granted) {
        setInitializationStep('✅ Permission granted! Processing your data...');
        // Process the data after permission is granted
        await service.initialize(); // Re-initialize to process data
        await new Promise(resolve => setTimeout(resolve, 1500));
        setInitializationStep('🎉 Your digital wellness dashboard is ready!');
        await new Promise(resolve => setTimeout(resolve, 1000));
        onInitializationComplete(granted);
      } else {
        setInitializationStep('⚠️ Using demo data without permissions');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onInitializationComplete(false);
      }
      
      setIsInitializing(false);
    } catch (error) {
      console.error('App initialization error:', error);
      setInitializationStep('⚠️ Ready to start with demo data');
      await new Promise(resolve => setTimeout(resolve, 1500));
      onInitializationComplete(false);
      setIsInitializing(false);
    }
  };

  if (!isInitializing) {
    return children ? <>{children}</> : null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <IconSymbol name="shield.lefthalf.filled" size={80} color="#87CEEB" />
        <ThemedText style={styles.appName}>HabitGuard</ThemedText>
        <ThemedText style={styles.tagline}>Your Digital Wellness Guardian</ThemedText>
      </View>
      
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <View style={styles.loadingFill} />
        </View>
        <ThemedText style={styles.loadingText}>{initializationStep}</ThemedText>
      </View>
      
      <View style={styles.featuresContainer}>
        <ThemedText style={styles.featuresTitle}>What we'll track for you:</ThemedText>
        <View style={styles.feature}>
          <IconSymbol name="clock.fill" size={20} color="#87CEEB" />
          <ThemedText style={styles.featureText}>Daily screen time</ThemedText>
        </View>
        <View style={styles.feature}>
          <IconSymbol name="apps.iphone" size={20} color="#87CEEB" />
          <ThemedText style={styles.featureText}>App usage patterns</ThemedText>
        </View>
        <View style={styles.feature}>
          <IconSymbol name="hand.tap.fill" size={20} color="#87CEEB" />
          <ThemedText style={styles.featureText}>Device pickups</ThemedText>
        </View>
        <View style={styles.feature}>
          <IconSymbol name="moon.stars.fill" size={20} color="#87CEEB" />
          <ThemedText style={styles.featureText}>Sleep recommendations</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A365D',
    marginTop: 16,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#87CEEB',
    borderRadius: 2,
    width: '100%',
    opacity: 0.8,
  },
  loadingText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '600',
  },
  featuresContainer: {
    width: '100%',
    maxWidth: 300,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A365D',
    marginBottom: 20,
    textAlign: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
    flex: 1,
  },
});