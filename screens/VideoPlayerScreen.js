import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Video, Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { getWatchProgress, saveWatchProgress } from '../utils/storage';
import { isVideoDownloaded } from '../utils/download'; // ✅ import this

export default function VideoPlayerScreen({ route }) {
  const { video } = route.params;
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(true);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [duration, setDuration] = useState(1);
  const [videoUri, setVideoUri] = useState(video.url); // ✅ for offline path

  useEffect(() => {
    const setup = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
        });

        // ✅ Check if video is downloaded
        const localPath = await isVideoDownloaded(video.id);
        if (localPath) {
          setVideoUri(localPath);
        }

        const lastPosition = await getWatchProgress(video.id);
        if (videoRef.current && lastPosition > 0) {
          await videoRef.current.setPositionAsync(lastPosition);
        }

      } catch (e) {
        console.log('Audio config error:', e);
      }
    };
    setup();

    return () => {
      videoRef.current?.unloadAsync();
    };
  }, []);

  const onPlaybackStatusUpdate = (s) => {
    if (!s.isLoaded) return;
    setStatus(s);

    if (!isSeeking && s.durationMillis) {
      setSliderValue(s.positionMillis / s.durationMillis);
    }

    setIsPlaying(s.isPlaying);
    if (s.durationMillis) setDuration(s.durationMillis);

    if (s.isPlaying && s.positionMillis) {
      saveWatchProgress(video.id, s.positionMillis);
    }
  };

  const togglePlayPause = async () => {
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const seekTo = async (seconds) => {
    const current = status.positionMillis || 0;
    const target = Math.min(Math.max(current + seconds * 1000, 0), duration);
    await videoRef.current.setPositionAsync(target);
  };

  const handleSliderStart = () => setIsSeeking(true);
  const handleSliderChange = (val) => setSliderValue(val);
  const handleSliderComplete = async (val) => {
    const position = val * duration;
    await videoRef.current.setPositionAsync(position);
    setIsSeeking(false);
  };

  const formatTime = (millis) => {
    const totalSec = Math.floor(millis / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }} // ✅ Use local file or remote URL
          style={styles.video}
          resizeMode="contain"
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          shouldPlay
          useNativeControls={false}
        />
      </View>

      <View style={styles.overlay}>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={() => seekTo(-10)}>
            <Ionicons name="play-back" size={36} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause}>
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={56}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => seekTo(10)}>
            <Ionicons name="play-forward" size={36} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sliderRow}>
          <Text style={styles.time}>{formatTime(status.positionMillis || 0)}</Text>

          <Slider
            style={styles.slider}
            value={sliderValue}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#1db954"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#fff"
            onSlidingStart={handleSliderStart}
            onValueChange={handleSliderChange}
            onSlidingComplete={handleSliderComplete}
          />

          <Text style={styles.time}>{formatTime(duration || 0)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    ...(Platform.OS === 'web' && { minHeight: '100vh' }),
  },
  videoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: Platform.OS === 'web' ? '80%' : '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
  },
  overlay: {
    paddingBottom: 40,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
    marginBottom: 20,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  time: {
    color: '#fff',
    width: 50,
    textAlign: 'center',
  },
});
