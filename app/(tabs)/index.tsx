import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);

  const {
    tracks,
    albums,
    artists,
    folders,
    recentlyPlayed,
    lastSelectedTab,
    updateLastTab,
    isLoading,
    hasPermission,
    loadMoreTracks,
    isLoadingMore,
    hasMore,
    scanLibrary,
  } = useMusicLibrary();

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

  const onRefresh = async () => {
    setRefreshing(true);
    await scanLibrary();
    setRefreshing(false);
  };

  const tabs = [
    { key: 'songs', label: 'Songs', icon: Music },
    { key: 'albums', label: 'Albums', icon: Disc },
    { key: 'artists', label: 'Artists', icon: Mic },
    { key: 'folders', label: 'Folders', icon: Folder },
  ];

  /* ---------- RENDER ITEMS ---------- */

  const renderTrackItem = ({ item, index }: { item: Track; index: number }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => playQueue(tracks, index)}
    >
      <View style={[styles.trackArtwork, { backgroundColor: accentColor.primary + '30' }]}>
        <Music size={18} color={COLORS.textSecondary} />
      </View>
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity style={styles.albumItem} onPress={() => playQueue(item.tracks, 0)}>
      <View style={[styles.albumArtwork, { backgroundColor: accentColor.primary + '30' }]}>
        <Text style={styles.albumArtworkText}>{item.name.charAt(0)}</Text>
      </View>
      <Text style={styles.albumName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.albumArtist} numberOfLines={1}>{item.artist}</Text>
    </TouchableOpacity>
  );

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity style={styles.artistItem} onPress={() => playQueue(item.tracks, 0)}>
      <View style={[styles.artistAvatar, { backgroundColor: accentColor.primary + '30' }]}>
        <Text style={styles.artistAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.artistTrackCount}>{item.tracks.length} songs</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFolderItem = ({ item }: { item: FolderType }) => (
    <TouchableOpacity style={styles.folderItem} onPress={() => playQueue(item.tracks, 0)}>
      <View style={[styles.folderIcon, { backgroundColor: accentColor.primary + '30' }]}>
        <Folder size={24} color={accentColor.primary} />
      </View>
      <View style={styles.folderInfo}>
        <Text style={styles.folderName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.folderTrackCount}>{item.tracks.length} songs</Text>
      </View>
    </TouchableOpacity>
  );

  /* ---------- CONTENT ---------- */

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={accentColor.primary} />
          <Text style={styles.loadingText}>Scanning music…</Text>
        </View>
      );
    }

    if (!hasPermission) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>Storage Permission Required</Text>
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
                    <Music size={18} color={COLORS.textSecondary} />
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={1}>{track.title}</Text>
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={accentColor.primary}
              />
            }
            onEndReached={() => {
              if (hasMore && !isLoadingMore) {
                loadMoreTracks();
              }
            }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              isLoadingMore ? (
                <ActivityIndicator style={{ marginVertical: 16 }} color={accentColor.primary} />
              ) : null
            }
            removeClippedSubviews
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={5}
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
              style={[styles.tab, isActive && { borderBottomColor: accentColor.primary }]}
              onPress={() => handleTabChange(tab.key)}
            >
              <Icon size={20} color={isActive ? accentColor.primary : COLORS.textSecondary} />
              <Text style={[styles.tabLabel, { color: isActive ? accentColor.primary : COLORS.textSecondary }]}>
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

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },

  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: { fontSize: 14, fontWeight: '600' },

  content: { flex: 1 },

  recentSection: { paddingVertical: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20 },

  recentItem: { width: 88, marginLeft: 16 },
  recentArtwork: {
    width: 88,
    height: 88,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  recentTitle: { fontSize: 12, color: COLORS.text },

  listContent: { paddingBottom: MINI_PLAYER_HEIGHT + 16 },
  gridContent: { paddingBottom: MINI_PLAYER_HEIGHT + 16 },

  trackItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12 },
  trackArtwork: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  trackInfo: { flex: 1 },
  trackTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  trackArtist: { fontSize: 13, color: COLORS.textSecondary },

  albumItem: { flex: 1, margin: 8 },
  albumArtwork: { aspectRatio: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  albumArtworkText: { fontSize: 40, opacity: 0.6 },
  albumName: { fontSize: 14, fontWeight: '600' },
  albumArtist: { fontSize: 12, color: COLORS.textSecondary },

  artistItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12 },
  artistAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  artistAvatarText: { fontSize: 20 },
  artistInfo: { flex: 1 },
  artistName: { fontSize: 16, fontWeight: '600' },
  artistTrackCount: { fontSize: 13, color: COLORS.textSecondary },

  folderItem: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12 },
  folderIcon: { width: 48, height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  folderInfo: { flex: 1 },
  folderName: { fontSize: 16, fontWeight: '600' },
  folderTrackCount: { fontSize: 13, color: COLORS.textSecondary },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: COLORS.textSecondary },
  emptyTitle: { fontSize: 18, color: COLORS.textSecondary },
});
