import { View, Text, StyleSheet, Alert } from 'react-native';
import React, { useContext, useState } from 'react';
import InputBox from '../../components/Forms/InputBox';
import SubmitButton from '../../components/Forms/SubmitButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Toast } from 'toastify-react-native'

const Login = ({navigation}) => {   
    
    const [state, setState] = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if(!email || !password){
                setLoading(false);
              return Toast.warn("Please Fill All Fields");
            }
            setLoading(false);   

            const {data} = await axios.post('/auth/login', 
                {email, password}
            );
            setState(data)
            await AsyncStorage.setItem("@auth", JSON.stringify(data));
            console.log("Login Data==>", data);
            navigation.navigate('Dashboard');
            return Toast.success(data && data.message);            
                     
        } catch (error) {
            setLoading(false);
            console.log(error);
            return Toast.error(error.response.data.message);
            
        }
    }

  return (   
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Login Page</Text>
      <View style={{ marginHorizontal: 20 }}>        
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
            btnTitle="Sign In"
            loading={loading}
            handleSubmit={handleSubmit}
        />

        <Text style={styles.linkText}> 
            Crate Your Account 
            <Text style={styles.link} onPress={()=> navigation.navigate("Register")}> 
                {" "} Sign Up
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

export default Login;