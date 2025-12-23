import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { AccentColor, EqualizerPreset } from '@/types/music';
import { ACCENT_COLORS } from '@/constants/theme';

const SETTINGS_STORAGE_KEY = '@echopulse_settings';

interface Settings {
  accentColorIndex: number;
  equalizerPreset: EqualizerPreset;
}

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [accentColorIndex, setAccentColorIndex] = useState<number>(0);
  const [equalizerPreset, setEqualizerPreset] =
    useState<EqualizerPreset>('normal');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // ✅ Session-only premium unlock
  const [isPremiumUnlocked, setIsPremiumUnlocked] =
    useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings: Settings = JSON.parse(stored);
        setAccentColorIndex(settings.accentColorIndex);
        setEqualizerPreset(settings.equalizerPreset);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveSettings = async (settings: Settings) => {
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const setAccentColor = (index: number) => {
    setAccentColorIndex(index);
    saveSettings({ accentColorIndex: index, equalizerPreset });
  };

  const setEqualizer = (preset: EqualizerPreset) => {
    setEqualizerPreset(preset);
    saveSettings({ accentColorIndex, equalizerPreset: preset });
  };

  const unlockPremiumForSession = () => {
    setIsPremiumUnlocked(true);
  };

  const accentColor: AccentColor = ACCENT_COLORS[accentColorIndex];

  return {
    accentColor,
    accentColorIndex,
    setAccentColor,

    equalizerPreset,
    setEqualizer,

    // premium
    isPremiumUnlocked,
    unlockPremiumForSession,

    isLoaded,
  };
});

