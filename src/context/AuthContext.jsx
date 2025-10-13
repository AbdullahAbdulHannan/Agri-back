import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { debugGoogleAuth } from '../utils/debugGoogleAuth';
import { API_BASE_URL } from '../main';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Check if user is authenticated on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check authentication status from localStorage
  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setUserRole(parsedUser.role);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password
      });
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      setUserRole(userData.role);
      
      return { success: true, user: userData };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // Google Sign-In function
  const googleSignIn = async (googleResponse) => {
    try {
      console.log('Google response received:', googleResponse);
      
      // Debug the Google response
      debugGoogleAuth(googleResponse);
      
      // The @react-oauth/google library provides access_token in the response
      const accessToken = googleResponse.access_token;
      
      if (!accessToken) {
        console.error('No access token found in Google response');
        throw new Error('No access token received from Google');
      }
      
      console.log('Sending access token to backend...');
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/google`, {
        googleToken: accessToken
      });
      
      const { token, user: userData, needsProfileSetup } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      setUserRole(userData.role);
      
      // Check if this is a Google user who needs profile setup
      const isNewGoogleUser = userData.authProvider === 'google' && (needsProfileSetup || !userData.phone);
      
      return { 
        success: true, 
        user: userData,
        isNewGoogleUser 
      };
    } catch (error) {
      console.error('Google sign-in error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Google sign-in failed');
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // Update user data
  const updateUser = (newUserData) => {
    setUser(newUserData);
    setUserRole(newUserData.role || 'user');
    localStorage.setItem('userData', JSON.stringify(newUserData));
  };

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Check if token is valid
  const isTokenValid = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    userRole,
    login,
    googleSignIn,
    logout,
    updateUser,
    getToken,
    isTokenValid,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 