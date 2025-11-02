import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider, AuthContext, useAuth } from "./context/AuthContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HeaderMenu from "./components/Forms/Menus/HeaderMenu";
import { lazy, Suspense, useContext } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ToastManager from 'toastify-react-native'



const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [state] = useAuth();
  const isAuthentiCatedUser = state?.token;

  // Lazy load the HomeScreen and AboutScreen
  const Dashboard = lazy(() => import('./screens/Dashboard.js'));
  const Login = lazy(() => import('./screens/auth/Login.js'));
  const Register = lazy(() => import('./screens/auth/Register.js'));
  const About = lazy(() => import('./screens/About.js'));
  const Post = lazy(() => import('./screens/Post.js'));
  const Account = lazy(() => import('./screens/Account.js'));


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
                  headerStyle: {backgroundColor: '#00b800'},
                  headerTintColor: '#fff',
                  headerTitleStyle: {fontWeight: 'bold'},
                  statusBarAnimation:"fade",
                  headerRight: () => <HeaderMenu/>
              })}
            />
            <Stack.Screen name="About"
              component={() => (
                  <Suspense fallback={<LoadingIndicator />}>
                    <About />
                  </Suspense>
                )}
                options={() => ({
                  headerBackTitle: "Back",
                  title: 'About Page',
                  headerStyle: {backgroundColor: '#19df19'},
                  headerTintColor: '#fff',
                  headerTitleStyle: {fontWeight: 'bold'},
                  statusBarAnimation:"fade",
                  headerRight: () => <HeaderMenu/>
              })}
            />
            <Stack.Screen name="Post"
              component={() => (
                  <Suspense fallback={<LoadingIndicator />}>
                    <Post />
                  </Suspense>
                )}
                options={() => ({
                  headerBackTitle: "Back",
                  title: 'Post Page',
                  headerStyle: {backgroundColor: '#00c600'},
                  headerTintColor: '#fff',
                  headerTitleStyle: {fontWeight: 'bold'},
                  statusBarAnimation:"fade",
                  headerRight: () => <HeaderMenu/>
              })}
            />
            <Stack.Screen name="Account"
              component={() => (
                  <Suspense fallback={<LoadingIndicator />}>
                    <Account />
                  </Suspense>
                )}
                options={() => ({
                  headerBackTitle: "Back",
                  title: 'Account Page',
                  headerStyle: {backgroundColor: '#00c600'},
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
                warn: 'warning'
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