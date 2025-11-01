<<<<<<< HEAD
=======

>>>>>>> 64255fc0d6c49956edfea82278ce103d8ffa385d
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useContext } from "react";
import Login from "../../../screens/auth/Login";
import Register from "../../../screens/auth/Register";
import AdminDashboard from "../../../screens/Admin/AdminDashboard";
import Home from "../../../screens/Home";
import { AuthContext } from "../../../context/AuthContext";



  
const ScreenMenu = () => {
  const [user] = useContext(AuthContext);
  const authenticatedUser = user?.user && user?.token;


  const Stack = createNativeStackNavigator();

  return (    
        <Stack.Navigator initialRouteName="Login">
          {!authenticatedUser ? (
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
              options={{ headerShown: true }}
            />
          ) : (
            <>
              <Stack.Screen
                name="UserDashboard"
                component={Home}
                options={{ headerShown: true }}
              />
            </>
          )}
        </Stack.Navigator>
  );
}

export default ScreenMenu;