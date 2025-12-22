import createContextHook from '@nkzw/create-context-hook';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { Track, RepeatMode } from '@/types/music';
import { useMusicLibrary } from './MusicLibraryContext';

export const [MusicPlayerProvider, useMusicPlayer] = createContextHook(() => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  
  const soundRef = useRef<Audio.Sound | null>(null);
  const { addToRecentlyPlayed } = useMusicLibrary();

  useEffect(() => {
    setupAudio();
    return () => {
      cleanup();
    };
  }, []);

  const setupAudio = async () => {
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }
    } catch (error) {
      console.error('Audio setup error:', error);
    }
  };

  const cleanup = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    }
  };

  const replay = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(0);
      await soundRef.current.playAsync();
    }
  }, []);

  const play = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
    }
  }, []);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
    }
  }, []);

  const playNext = useCallback(async () => {
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    const nextTrack = queue[nextIndex];
    setCurrentIndex(nextIndex);
    
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const statusCallback = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        setIsPlaying(status.isPlaying);
        setPosition(status.positionMillis || 0);
        setDuration(status.durationMillis || 0);
      };

      const { sound } = await Audio.Sound.createAsync(
        { uri: nextTrack.uri },
        { shouldPlay: true },
        statusCallback
      );

      soundRef.current = sound;
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
      addToRecentlyPlayed(nextTrack);
    } catch (error) {
      console.error('Playback error:', error);
    }
  }, [currentIndex, queue, repeatMode, addToRecentlyPlayed]);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      replay();
    } else if (repeatMode === 'all') {
      playNext();
    } else if (currentIndex < queue.length - 1) {
      playNext();
    } else {
      pause();
    }
  }, [repeatMode, currentIndex, queue.length, replay, playNext, pause]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      return;
    }

    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis || 0);
    setDuration(status.durationMillis || 0);

    if (status.didJustFinish && !status.isLooping) {
      handleTrackEnd();
    }
  }, [handleTrackEnd]);

  const playTrack = async (track: Track, newQueue?: Track[], index?: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setCurrentTrack(track);
      setIsPlaying(true);

      if (newQueue) {
        setQueue(newQueue);
        setCurrentIndex(index || 0);
      }

      addToRecentlyPlayed(track);
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const seekTo = async (positionMillis: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(positionMillis);
    }
  };

  const togglePlayPause = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  const playPrevious = async () => {
    if (queue.length === 0) return;

    if (position > 3000) {
      await seekTo(0);
      return;
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    setCurrentIndex(prevIndex);
    await playTrack(queue[prevIndex]);
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const playQueue = async (tracks: Track[], startIndex: number = 0) => {
    if (tracks.length === 0) return;

    const playQueue = shuffle ? shuffleArray([...tracks]) : tracks;
    await playTrack(playQueue[startIndex], playQueue, startIndex);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return {
    currentTrack,
    isPlaying,
    position,
    duration,
    queue,
    currentIndex,
    shuffle,
    repeatMode,
    playTrack,
    play,
    pause,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    toggleShuffle,
    cycleRepeatMode,
    playQueue,
  };
});