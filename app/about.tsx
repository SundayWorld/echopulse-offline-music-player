import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Music, Database, Shield, Heart } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { COLORS } from '@/constants/theme';

export default function AboutScreen() {
  const { accentColor } = useSettings();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'About',
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoSection}>
          <View style={[styles.logoCircle, { backgroundColor: accentColor.primary + '20' }]}>
            <Music size={48} color={accentColor.primary} />
          </View>
          <Text style={styles.appName}>EchoPulse – Offline Music Player</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.description}>
            A premium offline music player designed for users who want complete control over their music library.
            {'\n\n'}
            Enjoy your music collection without any internet connection, ads on player screens, or data collection.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: accentColor.primary + '20' }]}>
              <Database size={24} color={accentColor.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Local Storage Only</Text>
              <Text style={styles.featureDescription}>
                All your music files, playlists, and settings are stored locally on your device. No cloud sync, no external servers.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: accentColor.primary + '20' }]}>
              <Shield size={24} color={accentColor.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Privacy First</Text>
              <Text style={styles.featureDescription}>
                Zero data collection. Zero analytics. Zero tracking. Your music listening habits stay private on your device.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: accentColor.primary + '20' }]}>
              <Music size={24} color={accentColor.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Fully Offline</Text>
              <Text style={styles.featureDescription}>
                No internet required. Play your music anytime, anywhere without using data or requiring connectivity.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: accentColor.primary + '20' }]}>
              <Heart size={24} color={accentColor.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Made with Care</Text>
              <Text style={styles.featureDescription}>
                Built with attention to detail, smooth animations, and a beautiful dark AMOLED design for the best user experience.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 EchoPulse – Offline Music Player
          </Text>
          <Text style={styles.footerText}>
            All rights reserved
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  logoSection: {
    alignItems: 'center' as const,
    paddingVertical: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    textAlign: 'center' as const,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  descriptionCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 24,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center' as const,
  },
  featuresSection: {
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row' as const,
    marginBottom: 24,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingTop: 16,
    alignItems: 'center' as const,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});