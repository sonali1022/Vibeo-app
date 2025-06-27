import { View, Text, StyleSheet } from 'react-native';

export default function OfflineScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You're Offline</Text>
      <Text style={styles.subtitle}>Check your Wi-Fi or mobile data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  title: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 10,
  },
  subtitle: {
    fontSize: 16, color: '#666', marginBottom: 30,
  },
  button: {
    backgroundColor: '#1db954', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8,
  },
  buttonText: {
    color: '#fff', fontSize: 16,
  },
});
