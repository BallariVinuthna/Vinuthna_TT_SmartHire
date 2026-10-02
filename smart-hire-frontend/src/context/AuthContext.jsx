import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smarthire_token') || null);
  const [role, setRole] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            const authData = res.data;
            setUser(authData.user);
            setRole(authData.user.role);
            setProfileId(authData.profileId);
            setCompanyId(authData.companyId);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const handleAuthSuccess = (resData) => {
    const { token: newToken, user: userData, profileId: pId, companyId: cId } = resData;
    localStorage.setItem('smarthire_token', newToken);
    setToken(newToken);
    setUser(userData);
    setRole(userData.role);
    setProfileId(pId);
    setCompanyId(cId);
  };

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      handleAuthSuccess(res.data);
    }
    return res;
  };

  const registerCandidate = async (data) => {
    const res = await authService.registerCandidate(data);
    if (res.success && res.data) {
      handleAuthSuccess(res.data);
    }
    return res;
  };

  const registerRecruiter = async (data) => {
    const res = await authService.registerRecruiter(data);
    if (res.success && res.data) {
      handleAuthSuccess(res.data);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('smarthire_token');
    localStorage.removeItem('smarthire_user');
    setToken(null);
    setUser(null);
    setRole(null);
    setProfileId(null);
    setCompanyId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        profileId,
        companyId,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        registerCandidate,
        registerRecruiter,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
