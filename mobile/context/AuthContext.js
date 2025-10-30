import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const [user, setUser] = useState({
    user:null,
    token:"",
  });
  const [loading, setLoading] = useState(false);

  //deaflt axios setteing
  axios.defaults.baseURL = "http://172.20.10.13:5000/api";

  useEffect(() => {
    setLoading(true);
    const loadLocalStorageData = async () => {
      const data = await AsyncStorage.getItem('@auth');
      const loginData = JSON.parse(data);
      setUser({...user, user:data?.user, token:data?.token});
    };
    loadLocalStorageData();
    setLoading(false);
  }, []);

  const value = {
    user,
    loading,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export {AuthContext, AuthProvider};

