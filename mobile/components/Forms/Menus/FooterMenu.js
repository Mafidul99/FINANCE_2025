import { Text, TouchableOpacity, View , StyleSheet} from 'react-native'
import React from 'react'
import { Feather } from '@react-native-vector-icons/feather';

// import { FontAwesome } from '@react-native-vector-icons/fontawesome';

const FooterMenu = () => {
  return (
    <View style={styles.container}>
        <TouchableOpacity>
        <Feather name="home" style={styles.iconStyle}/>   
        <Text style={styles.textTitle}> Home </Text>
        </TouchableOpacity>
        <TouchableOpacity>
        <Feather name="book" style={styles.iconStyle}/>
        <Text style={styles.textTitle}> About </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="cast" style={styles.iconStyle}/>
        <Text style={styles.textTitle}> Post </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="users" style={styles.iconStyle}/>
        <Text style={styles.textTitle}> Account </Text>
        </TouchableOpacity>
    </View>
  )
};

const styles = StyleSheet.create({
    container:{
        flexDirection:"row",       
        justifyContent: "space-between", 
        backgroundColor: "#D4FFC2",
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