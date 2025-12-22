import { AccentColor } from '@/types/music';

export const COLORS = {
  background: '#000000',
  surface: '#121212',
  surfaceLight: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: '#2A2A2A',
};

export const ACCENT_COLORS: AccentColor[] = [
  {
    name: 'Purple',
    primary: '#8B5CF6',
    gradient: ['#8B5CF6', '#6D28D9'],
  },
  {
    name: 'Blue',
    primary: '#3B82F6',
    gradient: ['#3B82F6', '#1D4ED8'],
  },
  {
    name: 'Green',
    primary: '#10B981',
    gradient: ['#10B981', '#059669'],
  },
  {
    name: 'Pink',
    primary: '#EC4899',
    gradient: ['#EC4899', '#DB2777'],
  },
  {
    name: 'Orange',
    primary: '#F97316',
    gradient: ['#F97316', '#EA580C'],
  },
  {
    name: 'Red',
    primary: '#EF4444',
    gradient: ['#EF4444', '#DC2626'],
  },
  {
    name: 'Cyan',
    primary: '#06B6D4',
    gradient: ['#06B6D4', '#0891B2'],
  },
];

export const MINI_PLAYER_HEIGHT = 72;