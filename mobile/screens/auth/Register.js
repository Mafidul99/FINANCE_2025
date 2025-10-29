import { View, Text, StyleSheet, Alert } from 'react-native'
import React, { useState } from 'react'
import InputBox from '../../components/Forms/InputBox'
import SubmitButton from '../../components/Forms/SubmitButton'

const Register = ({navigation}) => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = () => {
        try {
            setLoading(true);
            if(!name || !email || !password){
                setLoading(false);
              return Alert.alert("Please Fill All Fields");
            }
            setLoading(false);   
            console.log("Regiter Data==>", {name, email, password});
                     
        } catch (error) {
            setLoading(false);
            console.log(error);
            
        }
    }

  return (
    
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Register</Text>
      <View style={{ marginHorizontal: 20 }}>
        <InputBox inputTitle={"Name"} value={name} setValue={setName} />
        <InputBox 
            inputTitle={"Email"}  
            keyboardType="email-address"
            autoComplete="email"
            value={email} setValue={setEmail}
            />
        <InputBox 
            inputTitle={"Password"} 
            secureTextEntry={true}
             keyboardType="password"
            value={password} setValue={setPassword}
            />
      </View>
        <SubmitButton
            btnTitle="Register"
            loading={loading}
            handleSubmit={handleSubmit}
        />

        <Text style={styles.linkText}> 
            Already Register Please 
            <Text style={styles.link} onPress={()=> navigation.navigate("Login")}>
                 {" "} Login
            </Text>
        </Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        backgroundColor:"#e0dedeff"
    },
    pageTitle:{
        fontSize:40,
        fontWeight:'900',
        textAlign:'center',
        color:"#1e2225",
        marginBottom:20,
    },
    linkText:{
        fontSize:23,
        justifyContent:"center",
        textAlign:"center"
    },
    link:{
        color:"red",
        fontWeight:"600"
    }
})

export default Register;