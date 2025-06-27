import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/StackNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
