import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { SafeAreaProvider } from "react-native-safe-area-context";
import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";






export default function App() {
  const Stack = createNativeStackNavigator();

  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login"
            component={Login}
            options={{ headerShown:false }}
            />
          <Stack.Screen name="Register" 
            component={Register} 
            options={{ headerShown:false }}
            />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
