import { View, Text } from 'react-native'
import React, { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
   const [state] = useContext(AuthContext);
  return (
    <>
      <View style={styles.container}>
        <Text>{JSON.stringify(state,null, 4)}</Text>
      </View>
      <FooterMenu/>
    </>
  )
}

export default AdminDashboard