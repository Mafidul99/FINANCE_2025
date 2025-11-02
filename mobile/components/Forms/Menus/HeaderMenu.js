import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { useAuth } from '../../../context/AuthContext';
import { Feather } from '@react-native-vector-icons/feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'toastify-react-native'

const HeaderMenu = ({navigation}) => {
   const [state, setState] = useAuth();

    // Logout function
  const handleLogout = async () => {
    setState({user:null, token:''});    
    await AsyncStorage.removeItem('@auth');
    Toast.success("Logout Successfully");
    navigation.navigate("Login");
  };

  return (
    <View>
      <TouchableOpacity onPress={handleLogout}>
        <Feather name="log-out" style={styles.iconStyle}/>
      </TouchableOpacity>
    </View>
  )
}


const styles = StyleSheet.create({    
    iconStyle:{
      marginBottom:3,
      alignSelf:"center",
      fontSize:25,
    }
});

export default HeaderMenu