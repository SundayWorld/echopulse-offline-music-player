import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { COLORS } from '@/constants/theme';
import { useSettings } from '@/contexts/SettingsContext';
import { rewardedAd, loadRewardedAd } from '@/lib/rewardedAd';
import { RewardedAdEventType } from 'react-native-google-mobile-ads';

export default function RewardedUnlockButton() {
  const { unlockPremiumForSession } = useSettings();

  useEffect(() => {
    loadRewardedAd();

    const unsubscribe = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        unlockPremiumForSession();
      }
    );

    return unsubscribe;
  }, []);

  const showAd = async () => {
    try {
      await rewardedAd.show();
    } catch {
      Alert.alert('Ad not ready', 'Please try again in a moment.');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={showAd}>
      <Text style={styles.text}>Unlock with Ad</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  text: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

