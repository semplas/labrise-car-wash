import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  type: 'super_admin' | 'business';
  businessId?: string;
  businessName?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, type: 'super_admin' | 'business') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('labrise_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string, type: 'super_admin' | 'business'): Promise<boolean> => {
    if (type === 'super_admin') {
      const superAdmin = localStorage.getItem('labrise_super_admin');
      if (superAdmin) {
        const admin = JSON.parse(superAdmin);
        if (admin.username === username && admin.password === password) {
          const userData = { id: 'super_admin', username, type: 'super_admin' as const };
          setUser(userData);
          localStorage.setItem('labrise_current_user', JSON.stringify(userData));
          return true;
        }
      }
    } else {
      const businesses = JSON.parse(localStorage.getItem('labrise_businesses') || '[]');
      const business = businesses.find((b: any) => b.username === username && b.password === password && b.isActive);
      if (business) {
        const userData = { 
          id: business.id, 
          username, 
          type: 'business' as const, 
          businessId: business.id,
          businessName: business.businessName 
        };
        setUser(userData);
        localStorage.setItem('labrise_current_user', JSON.stringify(userData));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('labrise_current_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};