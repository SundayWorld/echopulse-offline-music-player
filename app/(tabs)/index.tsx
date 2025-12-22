import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Music, Disc, Mic, Folder } from 'lucide-react-native';
import { useMusicLibrary } from '@/contexts/MusicLibraryContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useSettings } from '@/contexts/SettingsContext';
import { COLORS, MINI_PLAYER_HEIGHT } from '@/constants/theme';
import { Track, Album, Artist, Folder as FolderType } from '@/types/music';
import MiniPlayer from '@/components/MiniPlayer';
import BannerAdView from '@/components/BannerAdView';


type TabType = 'songs' | 'albums' | 'artists' | 'folders';

export default function LibraryScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('songs');
  const { tracks, albums, artists, folders, isLoading, hasPermission, recentlyPlayed, lastSelectedTab, updateLastTab } = useMusicLibrary();
  const { playQueue } = useMusicPlayer();
  const { accentColor } = useSettings();

  useEffect(() => {
    if (lastSelectedTab) {
      setActiveTab(lastSelectedTab as TabType);
    }
  }, [lastSelectedTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    updateLastTab(tab);
  };

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: 'songs', label: 'Songs', icon: Music },
    { key: 'albums', label: 'Albums', icon: Disc },
    { key: 'artists', label: 'Artists', icon: Mic },
    { key: 'folders', label: 'Folders', icon: Folder },
  ];

  const renderTrackItem = ({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => playQueue(tracks, index)}
    >
      <View style={[styles.trackArtwork, { backgroundColor: accentColor.primary + '30' }]}>
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
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.albumItem}
      onPress={() => playQueue(item.tracks, 0)}
    >
      <View style={[styles.albumArtwork, { backgroundColor: accentColor.primary + '30' }]}>
        <Text style={styles.albumArtworkText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.albumName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.albumArtist} numberOfLines={1}>
        {item.artist}
      </Text>
      <Text style={styles.albumTrackCount}>
        {item.tracks.length} {item.tracks.length === 1 ? 'song' : 'songs'}
      </Text>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity
      style={styles.artistItem}
      onPress={() => playQueue(item.tracks, 0)}
    >
      <View style={[styles.artistAvatar, { backgroundColor: accentColor.primary + '30' }]}>
        <Text style={styles.artistAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.artistTrackCount}>
          {item.tracks.length} {item.tracks.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFolderItem = ({ item }: { item: FolderType }) => (
    <TouchableOpacity
      style={styles.folderItem}
      onPress={() => playQueue(item.tracks, 0)}
    >
      <View style={[styles.folderIcon, { backgroundColor: accentColor.primary + '30' }]}>
        <Folder size={28} color={accentColor.primary} />
      </View>
      <View style={styles.folderInfo}>
        <Text style={styles.folderName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.folderTrackCount}>
          {item.tracks.length} {item.tracks.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={accentColor.primary} />
          <Text style={styles.loadingText}>Scanning music library...</Text>
        </View>
      );
    }

    if (!hasPermission) {
      return (
        <View style={styles.centerContainer}>
          <Music size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Storage Permission Required</Text>
          <Text style={styles.emptyText}>
            Please grant storage permission to access your music files
          </Text>
        </View>
      );
    }

    if (tracks.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Music size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>No Music Found</Text>
          <Text style={styles.emptyText}>
            Add some music files to your device to get started
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        {recentlyPlayed.length > 0 && activeTab === 'songs' && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recently Played</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentlyPlayed.slice(0, 10).map((track, index) => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.recentItem}
                  onPress={() => playQueue(recentlyPlayed, index)}
                >
                  <View style={[styles.recentArtwork, { backgroundColor: accentColor.primary + '30' }]}>
                    <Music size={24} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.recentArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'songs' && (
          <FlatList
            data={tracks}
            renderItem={renderTrackItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}

        {activeTab === 'albums' && (
          <FlatList
            data={albums}
            renderItem={renderAlbumItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContent}
          />
        )}

        {activeTab === 'artists' && (
          <FlatList
            data={artists}
            renderItem={renderArtistItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}

        {activeTab === 'folders' && (
          <FlatList
            data={folders}
            renderItem={renderFolderItem}
            keyExtractor={(item) => item.name}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isActive && { borderBottomColor: accentColor.primary },
              ]}
              onPress={() => handleTabChange(tab.key)}
            >
              <Icon
                size={20}
                color={isActive ? accentColor.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? accentColor.primary : COLORS.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

    {renderContent()}

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
  tabBar: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
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
  recentSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  recentItem: {
    width: 120,
    marginLeft: 20,
  },
  recentArtwork: {
    width: 120,
    height: 120,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 8,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  recentArtist: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: MINI_PLAYER_HEIGHT + 16,
  },
  gridContent: {
    paddingHorizontal: 16,
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
  albumItem: {
    flex: 1,
    margin: 8,
    maxWidth: '50%',
  },
  albumArtwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 8,
  },
  albumArtworkText: {
    fontSize: 48,
    fontWeight: 'bold' as const,
    color: COLORS.text,
    opacity: 0.6,
  },
  albumName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  albumTrackCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  artistItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  artistAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  artistAvatarText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: COLORS.text,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  artistTrackCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  folderItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  folderIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 4,
  },
  folderTrackCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});