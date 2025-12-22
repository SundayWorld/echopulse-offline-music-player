import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  PanResponder,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react-native';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useSettings } from '@/contexts/SettingsContext';
import { COLORS, MINI_PLAYER_HEIGHT } from '@/constants/theme';

export default function MiniPlayer() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentTrack, isPlaying, togglePlayPause, playNext, playPrevious } =
    useMusicPlayer();
  const { accentColor } = useSettings();

  if (!currentTrack) {
    return null;
  }

  // 👉 ONLY ADDED FOR LEFT / RIGHT SWIPE
  const translateX = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      // LEFT / RIGHT only
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,

      onPanResponderMove: (_, g) => {
        translateX.setValue(g.dx);
      },

      onPanResponderRelease: (_, g) => {
        const dismiss = g.dx > 80 || g.dx < -80;

        if (dismiss) {
          Animated.timing(translateX, {
            toValue: g.dx,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            // slides away only — music continues
            translateX.setValue(0);
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  // 👉 END OF ADDED CODE

  const handleContainerPress = () => {
    router.push('/now-playing');
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          backgroundColor: COLORS.surface,
          paddingBottom: insets.bottom,
          transform: [{ translateX }],
        },
      ]}
    >
      <Pressable style={styles.infoSection} onPress={handleContainerPress}>
        <View
          style={[
            styles.artwork,
            { backgroundColor: accentColor.primary + '30' },
          ]}
        >
          <Text style={styles.artworkText}>
            {currentTrack.title.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>
      </Pressable>

      <View style={styles.controls}>
        <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
          <SkipBack size={24} color={COLORS.text} fill={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayPause}
          style={[styles.playButton, { backgroundColor: accentColor.primary }]}
        >
          {isPlaying ? (
            <Pause size={24} color={COLORS.background} fill={COLORS.background} />
          ) : (
            <Play size={24} color={COLORS.background} fill={COLORS.background} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} style={styles.controlButton}>
          <SkipForward size={24} color={COLORS.text} fill={COLORS.text} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MINI_PLAYER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  artworkText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 40,
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
