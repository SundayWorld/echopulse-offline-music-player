import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Music } from 'lucide-react-native';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useSettings } from '@/contexts/SettingsContext';
import { COLORS, MINI_PLAYER_HEIGHT } from '@/constants/theme';
import { Track } from '@/types/music';
import MiniPlayer from '@/components/MiniPlayer';
import BannerAdView from '@/components/BannerAdView';

export default function FavoritesScreen() {
  const { getFavoriteTracks } = useMusicLibrary();
  const { playQueue } = useMusicPlayer();
  const { accentColor } = useSettings();

  const favoriteTracks = getFavoriteTracks();

  const renderTrackItem = ({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => playQueue(favoriteTracks, index)}
    >
      <View
        style={[
          styles.trackArtwork,
          { backgroundColor: accentColor.primary + '30' },
        ]}
      >
        <Music size={20} color={COLORS.textSecondary} />
      </View>

      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.trackArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>

      <Heart
        size={20}
        color={accentColor.primary}
        fill={accentColor.primary}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      {favoriteTracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptyText}>
            Tap the heart icon on any song to add it to your favorites
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoriteTracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center' as const,
  },
  listContent: {
    paddingBottom: MINI_PLAYER_HEIGHT + 16,
  },
  trackItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  trackArtwork: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

