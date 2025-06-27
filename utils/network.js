import * as Network from 'expo-network';

export const isOffline = async () => {
  try {
    const networkState = await Network.getNetworkStateAsync();
    return !networkState.isConnected;
  } catch (error) {
    console.error('Network check failed:', error);
    return true; // assume offline on error
  }
};
