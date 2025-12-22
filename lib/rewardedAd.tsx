import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'; // your real ID later

export const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

export const loadRewardedAd = () => {
  rewardedAd.load();
};
