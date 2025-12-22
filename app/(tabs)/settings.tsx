import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, ChevronRight } from 'lucide-react-native';
import { useSettings } from '@/contexts/SettingsContext';
import { COLORS, ACCENT_COLORS, MINI_PLAYER_HEIGHT } from '@/constants/theme';
import { EqualizerPreset } from '@/types/music';
import MiniPlayer from '@/components/MiniPlayer';
import RewardedUnlockButton from '@/components/RewardedUnlockButton';
import BannerAdView from '@/components/BannerAdView';

export default function SettingsScreen() {
  const {
    accentColor,
    accentColorIndex,
    setAccentColor,
    equalizerPreset,
    setEqualizer,
    isPremiumUnlocked,
  } = useSettings();

  const router = useRouter();

  const equalizerPresets: { key: EqualizerPreset; label: string }[] = [
    { key: 'normal', label: 'Normal' },
    { key: 'bass', label: 'Bass Boost' },
    { key: 'pop', label: 'Pop' },
    { key: 'rock', label: 'Rock' },
    { key: 'jazz', label: 'Jazz' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Accent Color */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accent Color</Text>

          {!isPremiumUnlocked && <RewardedUnlockButton />}

          <View style={styles.colorGrid}>
            {ACCENT_COLORS.map((color, index) => (
              <TouchableOpacity
                key={color.name}
                style={[
                  styles.colorItem,
                  { backgroundColor: color.primary },
                  accentColorIndex === index &&
                    isPremiumUnlocked &&
                    styles.colorItemActive,
                  !isPremiumUnlocked && { opacity: 0.5 },
                ]}
                onPress={() => {
                  if (isPremiumUnlocked) {
                    setAccentColor(index);
                  }
                }}
                activeOpacity={isPremiumUnlocked ? 0.7 : 1}
              >
                {accentColorIndex === index && isPremiumUnlocked && (
                  <Check size={24} color={COLORS.background} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equalizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equalizer</Text>

          {!isPremiumUnlocked && <RewardedUnlockButton />}

          {equalizerPresets.map((preset) => (
            <TouchableOpacity
              key={preset.key}
              style={[
                styles.presetItem,
                equalizerPreset === preset.key &&
                  isPremiumUnlocked && {
                    backgroundColor: accentColor.primary + '20',
                    borderColor: accentColor.primary,
                  },
              ]}
              onPress={() => {
                if (isPremiumUnlocked) {
                  setEqualizer(preset.key);
                }
              }}
              activeOpacity={isPremiumUnlocked ? 0.7 : 1}
            >
              <Text
                style={[
                  styles.presetLabel,
                  equalizerPreset === preset.key &&
                    isPremiumUnlocked && {
                      color: accentColor.primary,
                    },
                  !isPremiumUnlocked && { opacity: 0.5 },
                ]}
              >
                {preset.label}
              </Text>

              {equalizerPreset === preset.key && isPremiumUnlocked && (
                <Check size={20} color={accentColor.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <TouchableOpacity
            style={styles.aboutButton}
            onPress={() => router.push('/about')}
          >
            <Text style={styles.aboutButtonText}>About</Text>
            <ChevronRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BannerAdView />
      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  scrollContent: {
    paddingBottom: MINI_PLAYER_HEIGHT + 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: 16,
    gap: 12,
  },
  colorItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  colorItemActive: {
    borderWidth: 3,
    borderColor: COLORS.text,
  },
  presetItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  aboutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  aboutButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
});
