import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({children}) => {
  const [state, setState] = useState({
    user:null,
    token:"",
  });
  const [loading, setLoading] = useState(false);

  //deaflt axios setteing
  axios.defaults.baseURL = "http://172.20.10.13:5000/api";

  useEffect(() => {
    setLoading(true);
      const loadLocalStorageData = async () => {
      const data = await AsyncStorage.getItem("@auth");
      const loginData = JSON.parse(data);
      setState({...state, user: loginData?.user, token: loginData?.token});
    };
    loadLocalStorageData();
    setLoading(false);
  }, []);


  // Logout function
  // const logout = async () => {
  //   await AsyncStorage.removeItem('@auth');
  //   setState({user:null, token:''});
  // };


  return (
    <AuthContext.Provider value={[state, setState, loading, useAuth]}>
      {children}
    </AuthContext.Provider>
  )
}

export {AuthContext, AuthProvider};