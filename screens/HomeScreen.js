import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Network from 'expo-network';
import { Ionicons } from '@expo/vector-icons';
import { getWatchProgress } from '../utils/storage';

const VIDEO_LIST = [
  {
    id: '1',
    title: 'Big Buck Bunny',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217',
  },
  {
    id: '2',
    title: 'Sintel',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://i.ytimg.com/vi/eRsGyueVLvQ/maxresdefault.jpg',
  },
  {
    id: '3',
    title: 'Tears of Steel',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://i3.ytimg.com/vi/R6MlUcmOul8/maxresdefault.jpg',
  },
  {
    id: '4',
    title: 'For Bigger Blazes',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://dummyimage.com/600x400/000/fff&text=For+Bigger+Blazes',
  },
  {
    id: '5',
    title: 'Elephants Dream',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Elephants_Dream_poster_big.jpg/480px-Elephants_Dream_poster_big.jpg',
  },
];

const getDownloadPath = (id) => `${FileSystem.documentDirectory}${id}.mp4`;

export default function HomeScreen({ navigation }) {
  const [videoMeta, setVideoMeta] = useState({});
  const [progressMap, setProgressMap] = useState({});
  const [downloadedMap, setDownloadedMap] = useState({});
  const [downloadingMap, setDownloadingMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  const checkNetwork = async () => {
    const netState = await Network.getNetworkStateAsync();
    setIsOffline(!netState.isConnected);
  };

  useFocusEffect(
    useCallback(() => {
      const loadAll = async () => {
        await checkNetwork();

        const newMeta = {};
        const newProgress = {};
        const newDownloaded = {};

        for (const video of VIDEO_LIST) {
          try {
            const progress = await getWatchProgress(video.id);
            const localPath = getDownloadPath(video.id);
            const fileInfo = await FileSystem.getInfoAsync(localPath);

            const durationMillis = video.id === '4' ? 15000 : video.id === '1' ? 600000 : 300000;

            newMeta[video.id] = {
              ...video,
              durationMillis,
              durationText: new Date(durationMillis).toISOString().substr(14, 5),
            };

            newProgress[video.id] = progress || 0;
            newDownloaded[video.id] = fileInfo.exists ? localPath : null;
          } catch (e) {
            console.warn('Metadata error:', e);
          }
        }

        setVideoMeta(newMeta);
        setProgressMap(newProgress);
        setDownloadedMap(newDownloaded);
        setLoading(false);
      };

      loadAll();
    }, [])
  );

  const handleDownload = async (video) => {
    const destPath = getDownloadPath(video.id);

    try {
      const fileInfo = await FileSystem.getInfoAsync(destPath);
      if (fileInfo.exists) {
        Alert.alert(
          'Already Downloaded',
          'This video is already downloaded.',
          [
            {
              text: 'Delete Download',
              style: 'destructive',
              onPress: async () => {
                await FileSystem.deleteAsync(destPath, { idempotent: true });
                setDownloadedMap((prev) => ({ ...prev, [video.id]: null }));
              },
            },
            { text: 'OK', style: 'cancel' },
          ]
        );
        return;
      }

      setDownloadingMap((prev) => ({ ...prev, [video.id]: true }));
      const result = await FileSystem.downloadAsync(video.url, destPath);

      if (result.status === 200) {
        setDownloadedMap((prev) => ({ ...prev, [video.id]: destPath }));
        Alert.alert('Download Complete');
      }
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Download Failed');
    } finally {
      setDownloadingMap((prev) => ({ ...prev, [video.id]: false }));
    }
  };

  const renderItem = ({ item }) => {
    const meta = videoMeta[item.id];
    if (!meta) return null;

    const progressMillis = progressMap[item.id] || 0;
    const progressPercent = meta.durationMillis
      ? Math.min((progressMillis / meta.durationMillis) * 100, 100)
      : 0;

    const isWatched = progressPercent >= 95;
    const isDownloaded = !!downloadedMap[item.id];
    const isDownloading = !!downloadingMap[item.id];

    const videoToPlay = {
      ...meta,
      url: isDownloaded ? downloadedMap[item.id] : meta.url,
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('VideoPlayer', { video: videoToPlay })}
      >
        <View style={styles.thumbnailWrapper}>
          <Image source={{ uri: meta.thumbnail }} style={styles.thumbnail} />
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          {isWatched && (
            <View style={styles.watchedBadge}>
              <Ionicons name="checkmark-done-circle" size={18} color="#fff" />
              <Text style={styles.watchedLabel}>Watched</Text>
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text numberOfLines={2} style={styles.title}>{meta.title}</Text>
          <Text style={styles.duration}>Duration: {meta.durationText}</Text>
        </View>

        <TouchableOpacity onPress={() => handleDownload(meta)} style={styles.downloadIcon}>
          {isDownloading ? (
            <ActivityIndicator size={20} color="#e50914" />
          ) : (
            <Ionicons
              name={isDownloaded ? 'checkmark-circle' : 'arrow-down-circle-outline'}
              size={26}
              color={isDownloaded ? '#1db954' : '#aaa'}
            />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e50914" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Loading videos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Vibeo</Text>
      </View>
      <FlatList
        data={VIDEO_LIST}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
  },
  headerContainer: {
    paddingTop: 0,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomColor: '#222',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 12,
    marginBottom: 20,
    padding: 10,
    alignItems: 'center',
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: Platform.OS === 'web' ? 160 : 125,
    height: Platform.OS === 'web' ? 100 : 85,
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: '#222',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 4,
    width: '100%',
    backgroundColor: '#444',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#e50914',
  },
  watchedBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  watchedLabel: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: '#aaa',
  },
  downloadIcon: {
    paddingHorizontal: 8,
    alignSelf: 'center',
  },
});
