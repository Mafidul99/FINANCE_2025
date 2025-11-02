import { View, Text, StyleSheet } from 'react-native'
import FooterMenu from '../components/Forms/Menus/FooterMenu';
import { useAuth } from '../context/AuthContext';

const Account = () => {
   const [state] = useAuth();

  return (
    <>
      <View style={styles.container}>
        <Text> Name : {state?.user.name}</Text>
        <Text> Email ID : {state?.user.email}</Text>
        <Text> Role : {state?.user.role}</Text>
      </View>
      <FooterMenu/>
    </>
  )
}


const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"space-between",
    margin: 20,

  }
});

export default Account