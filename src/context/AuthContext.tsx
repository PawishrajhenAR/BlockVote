
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

// Mock Users - In a real app, this would come from a backend
const MOCK_USERS = [
  { id: 'admin1', password: 'admin123', role: 'admin' },
  { id: 'voter1', password: 'voter123', role: 'voter' },
  { id: 'voter2', password: 'voter123', role: 'voter' },
];

interface User {
  id: string;
  role: 'admin' | 'voter';
}

interface AuthContextType {
  user: User | null;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isVoter: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.role === 'admin';
  const isVoter = user?.role === 'voter';

  // Check for saved auth token on load
  useEffect(() => {
    const savedUser = localStorage.getItem('blockchain_voting_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('blockchain_voting_user');
      }
    }
  }, []);

  const login = async (id: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call that returns a JWT
    const user = MOCK_USERS.find(
      (u) => u.id === id && u.password === password
    );

    if (user) {
      const userData = { id: user.id, role: user.role as 'admin' | 'voter' };
      setUser(userData);
      localStorage.setItem('blockchain_voting_user', JSON.stringify(userData));
      toast.success(`Welcome, ${userData.role}!`);
      return true;
    }

    toast.error('Invalid credentials');
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('blockchain_voting_user');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isVoter }}>
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
