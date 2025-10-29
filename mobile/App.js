import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext, AuthProvider } from './context/AuthContext';
import React, { useContext } from 'react'
import Login from "./screens/auth/Login";
import Register from "./screens/auth/Register";
import Home from './screens/Home';
import AdminDashboard from './screens/Admin/AdminDashboard';






export default function App() {
  const [state, loading] = useContext(AuthContext);
  const authenticatedUser = state?.user && state?.token;
  const Stack = createNativeStackNavigator();

if (loading) {
    return null; // Or loading screen
  }

  return (
      <NavigationContainer>
        <AuthProvider>
          <Stack.Navigator initialRouteName="Login">
            {!authenticatedUser ? 
            (
              <>
                <Stack.Screen name="Login"
                  component={Login}
                  options={{ headerShown:false }}
                  />
                <Stack.Screen name="Register" 
                  component={Register} 
                  options={{ headerShown:false }}
                  />
              </>
              ) : 
              authenticatedUser.role === 'admin' ? (
              <Stack.Screen name="AdminDashboard" component={AdminDashboard}
                options={{ headerShown:true }} />
              ) : (
              <>
                <Stack.Screen name="UserDashboard" 
                component={Home} 
                options={{ headerShown:true }}
                />
              </>
              )
            }
          </Stack.Navigator>
            
        </AuthProvider>
      </NavigationContainer>
  );
}
