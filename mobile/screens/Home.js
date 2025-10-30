import { View, Text, StyleSheet } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import FooterMenu from '../components/Forms/Menus/FooterMenu';

const Home = () => {
    const [user] = useContext(AuthContext);
  return (
    <>
      <View style={styles.container}>
        <Text>{JSON.stringify(user,null, 4)}</Text>
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

export default Home;