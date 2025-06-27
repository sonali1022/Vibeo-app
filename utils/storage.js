import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_PREFIX = '@seeme_watch_progress:';

export const saveWatchProgress = async (videoId, position) => {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${videoId}`, position.toString());
  } catch (error) {
    console.log('Error saving progress', error);
  }
};

export const getWatchProgress = async (videoId) => {
  try {
    const value = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${videoId}`);
    return value ? parseInt(value, 10) : 0;
  } catch (error) {
    console.log('Error retrieving progress', error);
    return 0;
  }
};
