
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  guestId: string | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for guest mode
    const guestData = localStorage.getItem('jee-prepometer-guest');
    if (guestData) {
      const guest = JSON.parse(guestData);
      setIsGuest(true);
      setGuestId(guest.id);
      setLoading(false);
      return;
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsGuest(false);
        setGuestId(null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username
          }
        }
      });

      // Check if email confirmation is required
      if (data.user && !data.session && !error) {
        return { error: null, needsConfirmation: true };
      }

      return { error };
    } catch (networkError) {
      console.error('Network error during sign up:', networkError);
      return { error: { message: 'Network connection failed. Please check your internet connection and try again.' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('Sign in result:', { user: data?.user?.email, error });
      return { error };
    } catch (networkError) {
      console.error('Network error during sign in:', networkError);
      return { error: { message: 'Network connection failed. Please check your internet connection and try again.' } };
    }
  };

  const signOut = async () => {
    // Clear guest mode
    localStorage.removeItem('jee-prepometer-guest');
    localStorage.removeItem('jee-prepometer-timetable');
    localStorage.removeItem('jee-prepometer-progress');
    
    await supabase.auth.signOut();
    setIsGuest(false);
    setGuestId(null);
  };

  const continueAsGuest = () => {
    const guestData = {
      id: 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('jee-prepometer-guest', JSON.stringify(guestData));
    setIsGuest(true);
    setGuestId(guestData.id);
    setLoading(false);
  };

  const value = {
    user,
    session,
    isGuest,
    guestId,
    loading,
    signUp,
    signIn,
    signOut,
    continueAsGuest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
