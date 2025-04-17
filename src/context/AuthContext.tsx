import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, isAdmin?: boolean) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isVoter: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVoter, setIsVoter] = useState(false);

  useEffect(() => {
    const setupAuth = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            setTimeout(() => {
              fetchUserRole(currentSession.user.id);
            }, 0);
          } else {
            setIsAdmin(false);
            setIsVoter(false);
          }
        }
      );

      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        await fetchUserRole(initialSession.user.id);
      }
      
      setLoading(false);

      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      if (data) {
        const role = data.role;
        setIsAdmin(role === 'admin');
        setIsVoter(role === 'voter');
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        toast.success(`Welcome back!`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred during login');
      return false;
    }
  };

  const signUp = async (email: string, password: string, isAdmin: boolean = false): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return false;
      }

      if (data.user) {
        if (isAdmin) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', data.user.id);

          if (profileError) {
            console.error('Error setting admin role:', profileError);
            toast.error('Could not set admin role');
            return false;
          }
        }

        toast.success('Account created successfully! Please verify your email.');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An unexpected error occurred during signup');
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred during logout');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      login, 
      signUp,
      logout, 
      isAdmin, 
      isVoter,
      loading
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
