import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOAD_DIR = FileSystem.documentDirectory + 'videos/';
const DOWNLOAD_KEY = 'downloaded_videos';

export const downloadVideo = async (video) => {
  try {
    const fileUri = `${DOWNLOAD_DIR}${video.id}.mp4`;

    // Check if file already exists
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      return fileUri;
    }

    // Ensure download directory exists
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
    }

    // Download video
    const result = await FileSystem.downloadAsync(video.url, fileUri);
    const localPath = result.uri;

    // Save metadata in AsyncStorage
    const existing = await AsyncStorage.getItem(DOWNLOAD_KEY);
    const videoList = existing ? JSON.parse(existing) : [];

    const alreadyExists = videoList.some((v) => v.id === video.id);
    if (!alreadyExists) {
      videoList.push({
        id: video.id,
        title: video.title,
        localPath,
        thumbnail: video.thumbnail,
        duration: video.duration,
        durationMillis: video.durationMillis,
      });

      await AsyncStorage.setItem(DOWNLOAD_KEY, JSON.stringify(videoList));
    }

    return localPath;
  } catch (error) {
    console.error('Download error:', error);
    return null;
  }
};

export const isVideoDownloaded = async (videoId) => {
  const fileUri = `${DOWNLOAD_DIR}${videoId}.mp4`;
  const fileInfo = await FileSystem.getInfoAsync(fileUri);
  return fileInfo.exists ? fileUri : null;
};

export const removeDownloadedVideo = async (videoId) => {
  const fileUri = `${DOWNLOAD_DIR}${videoId}.mp4`;

  try {
    // Delete from file system
    await FileSystem.deleteAsync(fileUri, { idempotent: true });

    // Remove from AsyncStorage
    const json = await AsyncStorage.getItem(DOWNLOAD_KEY);
    const videoList = json ? JSON.parse(json) : [];

    const updatedList = videoList.filter((v) => v.id !== videoId);
    await AsyncStorage.setItem(DOWNLOAD_KEY, JSON.stringify(updatedList));
  } catch (error) {
    console.error('Error removing downloaded video:', error);
  }
};
