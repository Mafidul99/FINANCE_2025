import { View, Text } from 'react-native'
import React from 'react'
import { AuthProvider } from './context/AuthContext';
import ScreenMenu from './components/Forms/Menus/ScreenMenu';

const RootNavigation = () => {
  return (
    <AuthProvider>
        <ScreenMenu/>
    </AuthProvider>
  )
}

export default RootNavigation;