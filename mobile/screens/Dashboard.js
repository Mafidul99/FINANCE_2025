import { View, Text, StyleSheet } from 'react-native'
import { AuthContext } from '../context/AuthContext'
import FooterMenu from '../components/Forms/Menus/FooterMenu';
import { useContext } from 'react';

const Dashboard = () => {
    const [state] = useContext(AuthContext);
  return (
    <>
      <View style={styles.container}>
        <Text>{JSON.stringify(state,null, 4)}</Text>
      </View>
      <FooterMenu/>
    </>
  )
};

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:"space-between",
    margin: 20,

  }
});

export default Dashboard;