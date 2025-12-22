export interface Track {
  id: string;
  uri: string;
  filename: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  albumId?: string;
  artistId?: string;
  folder?: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  tracks: Track[];
  artworkUri?: string;
}

export interface Artist {
  id: string;
  name: string;
  tracks: Track[];
}

export interface Folder {
  name: string;
  tracks: Track[];
}

export type RepeatMode = 'off' | 'one' | 'all';

export type EqualizerPreset = 'normal' | 'bass' | 'pop' | 'rock' | 'jazz';

export type AccentColor = {
  name: string;
  primary: string;
  gradient: string[];
};