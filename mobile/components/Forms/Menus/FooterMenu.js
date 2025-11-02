import { Text, TouchableOpacity, View , StyleSheet} from 'react-native'
import React from 'react'
import { Feather } from '@react-native-vector-icons/feather';
import { useNavigation, useRoute } from '@react-navigation/native';

// import { FontAwesome } from '@react-native-vector-icons/fontawesome';

const FooterMenu = () => {
  const navigation = useNavigation();

  // hooks
  const route = useRoute();

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
        <Feather name="home" style={styles.iconStyle} color={route.name === "Dashboard" && "orange"}/>   
        <Text style={styles.textTitle}> Home </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('About')}>
        <Feather name="book" style={styles.iconStyle} color={route.name === "About" && "orange"}/>
        <Text style={styles.textTitle}> About </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Post')}>
          <Feather name="cast" style={styles.iconStyle} color={route.name === "Post" && "orange"}/>
        <Text style={styles.textTitle}> Post </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Account')}>
          <Feather name="users" style={styles.iconStyle} color={route.name === "Account" && "orange"}/>
        <Text style={styles.textTitle}> Account </Text>
        </TouchableOpacity>
    </View>
  )
};

const styles = StyleSheet.create({
    container:{
        flexDirection:"row",       
        justifyContent: "space-between", 
        backgroundColor: "#e5fbdd",
        paddingHorizontal:30,
        paddingBottom: 45,
        paddingTop:15,
    },
    textTitle:{
      fontSize:12,
    },
    iconStyle:{
      marginBottom:3,
      alignSelf:"center",
      fontSize:25,
    }
});

export default FooterMenu;