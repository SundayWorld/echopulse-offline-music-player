import createContextHook from '@nkzw/create-context-hook';
import * as MediaLibrary from 'expo-media-library';
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Track, Album, Artist, Folder } from '@/types/music';

const FAVORITES_STORAGE_KEY = '@echopulse_favorites';
const RECENT_STORAGE_KEY = '@echopulse_recent';
const LAST_TAB_STORAGE_KEY = '@echopulse_last_tab';

export const [MusicLibraryProvider, useMusicLibrary] = createContextHook(() => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [lastSelectedTab, setLastSelectedTab] = useState<string>('songs');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const extractTitle = (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  };

  const extractFolder = (uri: string): string => {
    const parts = uri.split('/');
    return parts[parts.length - 2] || 'Root';
  };

  const organizeLibrary = useCallback((allTracks: Track[]) => {
    const albumMap = new Map<string, Track[]>();
    const artistMap = new Map<string, Track[]>();
    const folderMap = new Map<string, Track[]>();

    allTracks.forEach((track) => {
      if (!albumMap.has(track.album)) {
        albumMap.set(track.album, []);
      }
      albumMap.get(track.album)!.push(track);

      if (!artistMap.has(track.artist)) {
        artistMap.set(track.artist, []);
      }
      artistMap.get(track.artist)!.push(track);

      if (track.folder) {
        if (!folderMap.has(track.folder)) {
          folderMap.set(track.folder, []);
        }
        folderMap.get(track.folder)!.push(track);
      }
    });

    const albumList: Album[] = Array.from(albumMap.entries()).map(([name, tracks]) => ({
      id: name,
      name,
      artist: tracks[0].artist,
      tracks,
    }));

    const artistList: Artist[] = Array.from(artistMap.entries()).map(([name, tracks]) => ({
      id: name,
      name,
      tracks,
    }));

    const folderList: Folder[] = Array.from(folderMap.entries()).map(([name, tracks]) => ({
      name,
      tracks,
    }));

    setAlbums(albumList);
    setArtists(artistList);
    setFolders(folderList);
  }, []);

  const scanLibrary = useCallback(async () => {
    try {
      setIsLoading(true);
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 1000,
      });

      const scannedTracks: Track[] = media.assets.map((asset) => ({
        id: asset.id,
        uri: asset.uri,
        filename: asset.filename,
        title: extractTitle(asset.filename),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: asset.duration,
        folder: extractFolder(asset.uri),
      }));

      setTracks(scannedTracks);
      organizeLibrary(scannedTracks);
    } catch (error) {
      console.error('Library scan error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [organizeLibrary]);

  const requestPermissions = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        await scanLibrary();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Permission error:', error);
      setHasPermission(false);
      setIsLoading(false);
    }
  }, [scanLibrary]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          setFavorites(new Set(JSON.parse(stored)));
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
      }
    };

    const loadRecentlyPlayed = async () => {
      try {
        const stored = await AsyncStorage.getItem(RECENT_STORAGE_KEY);
        if (stored) {
          setRecentlyPlayed(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load recently played:', error);
      }
    };

    const loadLastTab = async () => {
      try {
        const stored = await AsyncStorage.getItem(LAST_TAB_STORAGE_KEY);
        if (stored) {
          setLastSelectedTab(stored);
        }
      } catch (error) {
        console.error('Failed to load last tab:', error);
      }
    };

    const init = async () => {
      await loadFavorites();
      await loadRecentlyPlayed();
      await loadLastTab();
      await requestPermissions();
    };
    init();
  }, [requestPermissions]);

  const saveFavorites = async (newFavorites: Set<string>) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(newFavorites)));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  };

  const toggleFavorite = (trackId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(trackId)) {
      newFavorites.delete(trackId);
    } else {
      newFavorites.add(trackId);
    }
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorite = (trackId: string): boolean => {
    return favorites.has(trackId);
  };

  const getFavoriteTracks = (): Track[] => {
    return tracks.filter((track) => favorites.has(track.id));
  };

  const saveRecentlyPlayed = async (recent: Track[]) => {
    try {
      await AsyncStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error('Failed to save recently played:', error);
    }
  };

  const addToRecentlyPlayed = (track: Track) => {
    const filtered = recentlyPlayed.filter((t) => t.id !== track.id);
    const updated = [track, ...filtered].slice(0, 20);
    setRecentlyPlayed(updated);
    saveRecentlyPlayed(updated);
  };

  const saveLastTab = async (tab: string) => {
    try {
      await AsyncStorage.setItem(LAST_TAB_STORAGE_KEY, tab);
    } catch (error) {
      console.error('Failed to save last tab:', error);
    }
  };

  const updateLastTab = (tab: string) => {
    setLastSelectedTab(tab);
    saveLastTab(tab);
  };

  return {
    tracks,
    albums,
    artists,
    folders,
    favorites,
    recentlyPlayed,
    lastSelectedTab,
    isLoading,
    hasPermission,
    toggleFavorite,
    isFavorite,
    getFavoriteTracks,
    addToRecentlyPlayed,
    updateLastTab,
    requestPermissions,
    scanLibrary,
  };
});