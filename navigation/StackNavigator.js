import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import OfflineScreen from '../screens/OfflineScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000', // Netflix-style black header
        },
        headerTitleAlign: 'center', // Centered title
        headerTitleStyle: {
          color: '#fff',            // White text
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerTintColor: '#fff',     // White back arrow
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ 
          title: 'Vibeo',
          headerShown: true,
         }}
      />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{
          title: 'Now Playing',
        }}
      />
      <Stack.Screen
        name="Offline"
        component={OfflineScreen}
        options={{ title: 'Offline' }}
      />
  
    </Stack.Navigator>
  );
}
