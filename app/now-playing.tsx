import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
} from 'lucide-react-native';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { useSettings } from '@/contexts/SettingsContext';
import { COLORS } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function NowPlayingScreen() {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    shuffle,
    repeatMode,
    toggleShuffle,
    cycleRepeatMode,
  } = useMusicPlayer();
  const { isFavorite, toggleFavorite } = useMusicLibrary();
  const { accentColor } = useSettings();

  const [seeking, setSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const favoriteScale = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!seeking) {
      Animated.timing(progressAnim, {
        toValue: duration > 0 ? position / duration : 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [position, duration, seeking, progressAnim]);

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronDown size={32} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No track playing</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeekStart = () => {
    setSeeking(true);
    setSeekPosition(position);
  };

  const handleSeekMove = (progress: number) => {
    setSeekPosition(progress * duration);
  };

  const handleSeekEnd = async () => {
    await seekTo(seekPosition);
    setSeeking(false);
  };

  const isFav = isFavorite(currentTrack.id);

  const handleToggleFavorite = () => {
    toggleFavorite(currentTrack.id);
    Animated.sequence([
      Animated.timing(favoriteScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(favoriteScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') {
      return <Repeat1 size={28} color={accentColor.primary} />;
    }
    return <Repeat size={28} color={repeatMode === 'all' ? accentColor.primary : COLORS.textSecondary} />;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[accentColor.gradient[0] + '40', COLORS.background]}
        style={StyleSheet.absoluteFill}
        locations={[0, 0.5]}
      />
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
            <ChevronDown size={32} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Now Playing</Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.artworkContainer}>
          <View style={[styles.artwork, { backgroundColor: accentColor.primary + '30' }]}>
            <Text style={styles.artworkPlaceholder}>
              {currentTrack.title.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <Pressable
            style={styles.progressBarContainer}
            onPressIn={(e) => {
              handleSeekStart();
              const progress = e.nativeEvent.locationX / (width - 48);
              handleSeekMove(progress);
            }}
            onResponderMove={(e) => {
              if (seeking) {
                const progress = e.nativeEvent.locationX / (width - 48);
                handleSeekMove(Math.max(0, Math.min(1, progress)));
              }
            }}
            onPressOut={handleSeekEnd}
          >
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: accentColor.primary,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </Pressable>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(seeking ? seekPosition : position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity onPress={toggleShuffle} style={styles.secondaryButton}>
            <Shuffle size={28} color={shuffle ? accentColor.primary : COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
            <SkipBack size={36} color={COLORS.text} fill={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            style={[styles.playButton, { backgroundColor: accentColor.primary }]}
          >
            {isPlaying ? (
              <Pause size={40} color={COLORS.background} fill={COLORS.background} />
            ) : (
              <Play size={40} color={COLORS.background} fill={COLORS.background} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} style={styles.controlButton}>
            <SkipForward size={36} color={COLORS.text} fill={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={cycleRepeatMode} style={styles.secondaryButton}>
            {getRepeatIcon()}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomControls}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={styles.favoriteButton}
          >
            <Animated.View style={{ transform: [{ scale: favoriteScale }] }}>
              <Heart
                size={28}
                color={isFav ? accentColor.primary : COLORS.textSecondary}
                fill={isFav ? accentColor.primary : 'transparent'}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 32,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  artworkContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginVertical: 40,
  },
  artwork: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  artworkPlaceholder: {
    fontSize: 120,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    opacity: 0.6,
  },
  infoContainer: {
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  artist: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textAlign: 'center' as const,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  controlsContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 20,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  controlButton: {
    width: 50,
    height: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  secondaryButton: {
    width: 50,
    height: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  bottomControls: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  favoriteButton: {
    width: 50,
    height: 50,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
});