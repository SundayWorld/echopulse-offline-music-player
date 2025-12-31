import createContextHook from '@nkzw/create-context-hook';
import * as MediaLibrary from 'expo-media-library';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Album, Artist, Folder } from '@/types/music';

const FAVORITES_STORAGE_KEY = '@echopulse_favorites';
const RECENT_STORAGE_KEY = '@echopulse_recent';
const LAST_TAB_STORAGE_KEY = '@echopulse_last_tab';

const PAGE_SIZE = 200;

export const [MusicLibraryProvider, useMusicLibrary] = createContextHook(() => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [lastSelectedTab, setLastSelectedTab] = useState('songs');

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cursorRef = useRef<string | null>(null);
  const scanningRef = useRef(false);

  /* ---------------- helpers ---------------- */

  const extractTitle = (filename: string) =>
    filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

  const extractFolder = (uri: string) =>
    uri.split('/').slice(-2, -1)[0] || 'Root';

  const mapAssets = (assets: MediaLibrary.Asset[]): Track[] =>
    assets.map(a => ({
      id: a.id,
      uri: a.uri,
      filename: a.filename,
      title: extractTitle(a.filename),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: a.duration,
      folder: extractFolder(a.uri),
    }));

  const organizeLibrary = useCallback((all: Track[]) => {
    const albumMap = new Map<string, Track[]>();
    const artistMap = new Map<string, Track[]>();
    const folderMap = new Map<string, Track[]>();

    all.forEach(t => {
      albumMap.set(t.album, [...(albumMap.get(t.album) || []), t]);
      artistMap.set(t.artist, [...(artistMap.get(t.artist) || []), t]);
      if (t.folder) {
        folderMap.set(t.folder, [...(folderMap.get(t.folder) || []), t]);
      }
    });

    setAlbums(
      [...albumMap.entries()].map(([name, tracks]) => ({
        id: name,
        name,
        artist: tracks[0]?.artist ?? 'Unknown',
        tracks,
      }))
    );

    setArtists(
      [...artistMap.entries()].map(([name, tracks]) => ({
        id: name,
        name,
        tracks,
      }))
    );

    setFolders(
      [...folderMap.entries()].map(([name, tracks]) => ({
        name,
        tracks,
      }))
    );
  }, []);

  /* ---------------- PERMISSION (ANDROID 10+ SAFE) ---------------- */

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      setHasPermission(true);
      return true;
    }

    const { status } = await MediaLibrary.requestPermissionsAsync();
    const granted = status === 'granted';

    setHasPermission(granted);
    return granted;
  }, []);

  /* ---------------- INITIAL SCAN ---------------- */

  const scanLibrary = useCallback(async () => {
    if (scanningRef.current || !hasPermission) return;

    try {
      scanningRef.current = true;
      setIsLoading(true);

      const res = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: PAGE_SIZE,
      });

      const mapped = mapAssets(res.assets);
      setTracks(mapped);
      organizeLibrary(mapped);

      cursorRef.current = res.endCursor ?? null;
      setHasMoreTracks(res.hasNextPage);
    } catch (e) {
      console.error('Scan error', e);
    } finally {
      setIsLoading(false);
      scanningRef.current = false;
    }
  }, [hasPermission, organizeLibrary]);

  /* ---------------- LOAD MORE ---------------- */

  const loadMoreTracks = useCallback(async () => {
    if (!hasPermission || !hasMoreTracks || isLoadingMore || !cursorRef.current)
      return;

    try {
      setIsLoadingMore(true);

      const res = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: PAGE_SIZE,
        after: cursorRef.current,
      });

      const mapped = mapAssets(res.assets);

      setTracks(prev => {
        const merged = [...prev, ...mapped];
        organizeLibrary(merged);
        return merged;
      });

      cursorRef.current = res.endCursor ?? null;
      setHasMoreTracks(res.hasNextPage);
    } catch (e) {
      console.error('Load more error', e);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasPermission, hasMoreTracks, isLoadingMore, organizeLibrary]);

  /* ---------------- REFRESH ---------------- */

  const refreshLibrary = useCallback(async () => {
    if (!hasPermission) return;

    setIsRefreshing(true);
    cursorRef.current = null;
    setHasMoreTracks(true);
    await scanLibrary();
    setIsRefreshing(false);
  }, [hasPermission, scanLibrary]);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    (async () => {
      const fav = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (fav) setFavorites(new Set(JSON.parse(fav)));

      const recent = await AsyncStorage.getItem(RECENT_STORAGE_KEY);
      if (recent) setRecentlyPlayed(JSON.parse(recent));

      const tab = await AsyncStorage.getItem(LAST_TAB_STORAGE_KEY);
      if (tab) setLastSelectedTab(tab);

      const granted = await requestPermissions();
      if (granted) {
        await scanLibrary();
      } else {
        setIsLoading(false);
      }
    })();
  }, [requestPermissions, scanLibrary]);

  return {
    tracks,
    albums,
    artists,
    folders,
    recentlyPlayed,
    lastSelectedTab,

    isLoading,
    isLoadingMore,
    isRefreshing,
    hasPermission,
    hasMoreTracks,

    loadMoreTracks,
    refreshLibrary,
  };
});


