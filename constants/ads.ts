import { Platform } from 'react-native';

export const BANNER_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-3624419100732579/3226677918',
  ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
})!;

export const REWARDED_AD_UNIT_ID = Platform.select({
  android: 'ca-app-pub-3624419100732579/9217371196',
  ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
})!;
