import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import React, { useContext } from "react";
import Login from "../../../screens/auth/Login";
import Register from "../../../screens/auth/Register";
// import AdminDashboard from "../../../screens/Admin/AdminDashboard";
import Home from "../../../screens/Home";
// import { AuthContext } from "../../../context/AuthContext";



  
const ScreenMenu = () => {
  // const [state] = useContext(AuthContext);
  // const authenticatedUser = state?.user && state?.token;

  const Stack = createNativeStackNavigator();

  return (    
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
                  name="Dashboard"
                  component={Home}
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={Register}
                options={{ headerShown: false }}
              />
          {/* {authenticatedUser ? (
            <>
            <Stack.Screen
                  name="Dashboard"
                  component={Home}
                  options={{ headerShown: false }}
                />
          </>
          ) : (
            <>
            <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={Register}
                options={{ headerShown: false }}
              />
            </>
          )} */}

          {/* {!authenticatedUser ? (
            <>
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={Register}
                options={{ headerShown: false }}
              />
            </>
          ) : authenticatedUser.role === "admin" ? (
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboard}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen
                name="Dashboard"
                component={Home}
                options={{ headerShown: false }}
              />
            </>
          )} */}
        </Stack.Navigator>
  );
}

export default ScreenMenu;