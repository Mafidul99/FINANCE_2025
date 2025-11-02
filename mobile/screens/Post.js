import { View, Text, StyleSheet } from 'react-native'
import FooterMenu from '../components/Forms/Menus/FooterMenu';

const Post = () => {
  
  return (
    <>
      <View style={styles.container}>
        
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

export default Post