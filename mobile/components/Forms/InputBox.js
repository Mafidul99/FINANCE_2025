import { View, Text, StyleSheet, TextInput } from 'react-native'
import React from 'react'

const InputBox = ({inputTitle, autoComplete, keyboardType, secureTextEntry=false, value, setValue}) => {
  return (
    <View>
       <Text style={{ fontSize: 18, fontWeight: 600 }}>
            {inputTitle}
       </Text>
        <TextInput 
            style={styles.inputBox}
            autoCorrect={false}
            keyboardType={keyboardType}
            autoComplete={autoComplete}
            secureTextEntry={secureTextEntry}
            value={value}
            onChangeText={(text) => setValue(text)}
        />
    </View>
  )
}

const styles = StyleSheet.create({    
    inputBox:{
        height:45,
        marginBottom:20,
        backgroundColor:"#ffffff",
        borderRadius:10,
        marginTop:10,
        paddingLeft: 15,
        color:"#000000",
        fontSize:18,
    }
});

export default InputBox;