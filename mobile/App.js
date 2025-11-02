import { NavigationContainer } from "@react-navigation/native";
import { useAuth, AuthProvider, AuthContext } from "./context/AuthContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HeaderMenu from "./components/Forms/Menus/HeaderMenu";
import { lazy, Suspense, useContext } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ToastManager from 'toastify-react-native'



const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [state] = useContext(AuthContext);
  const isAuthentiCatedUser = state?.user && state?.token;

  // Lazy load the HomeScreen and AboutScreen
  const Dashboard = lazy(() => import('./screens/Dashboard.js'));
  const Login = lazy(() => import('./screens/auth/Login.js'));
  const Register = lazy(() => import('./screens/auth/Register.js'));


  const LoadingIndicator = () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text>loading..</Text>
      </View>
    );

  return (
    <Stack.Navigator>
      {isAuthentiCatedUser ? (
        <>
        <Stack.Screen name="Dashboard"
            component={() => (
                <Suspense fallback={<LoadingIndicator />}>
                  <Dashboard />
                </Suspense>
              )}
              options={() => ({
                title: 'Finance Mobile',
                headerStyle: {backgroundColor: '#f4511e'},
                headerTintColor: '#fff',
                headerTitleStyle: {fontWeight: 'bold'},
                statusBarAnimation:"fade",
                headerRight: () => <HeaderMenu/>
            })}
          />
          </>
      ) : (
        <>
          <Stack.Screen name='Login' component={Login}
            options={{ headerShown: false }}/>
          <Stack.Screen name='Register' component={Register}
            options={{ headerShown: false }}/>
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return ( 
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
           <ToastManager
              theme='light'
              position='top'
              icons={{
                success: 'check-circle',
                error: 'error',
                info: 'info',
                warn: 'warning',
                default: 'notifications',
              }}
              iconSize={24} />
        </NavigationContainer>
      </AuthProvider>    
      </SafeAreaProvider>  
  );
}


// const styles = StyleSheet.create({
// 	headerStyle:{
// 		backgroundColor: "#f4511e",
// 		shadowOpacity: 0,
// 		borderBottomWidth: 0,
// 		elevation: 0,
// 	},
// }) 