import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useContext } from "react";
import Login from "../../../screens/auth/Login";
import Register from "../../../screens/auth/Register";
// import AdminDashboard from "../../../screens/Admin/AdminDashboard";
import Dashboard from "../../../screens/Dashboard";
import { AuthContext } from "../../../context/AuthContext";
import HeaderMenu from "./HeaderMenu";



  
const ScreenMenu = () => {
  const [state] = useContext(AuthContext);
  const authenticatedUser = state?.user && state?.token;

  const Stack = createNativeStackNavigator();

  return ( 
    <Stack.Navigator>
      
    </Stack.Navigator>
  );
}

export default ScreenMenu;