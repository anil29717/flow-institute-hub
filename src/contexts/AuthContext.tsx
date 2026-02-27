import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

type AppRole = 'owner' | 'teacher' | 'admin';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole | null;
  profileId: string | null;
  instituteId: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserData(userId: string): Promise<AuthUser | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (!profile) return null;

  return {
    id: userId,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    role: (roleData?.role as AppRole) ?? null,
    profileId: profile.id,
    instituteId: profile.institute_id ?? null,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setTimeout(async () => {
          const userData = await fetchUserData(newSession.user.id);
          setUser(userData);
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchUserData(existingSession.user.id).then(userData => {
          setUser(userData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    const userId = data.user.id;

    // Check role — admins bypass plan check
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    const role = roleData?.role as AppRole | null;

    if (role !== 'admin') {
      // Get institute_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('institute_id')
        .eq('user_id', userId)
        .single();

      if (profile?.institute_id) {
        const { data: inst } = await supabase
          .from('institutes')
          .select('plan_id, is_active, plan_expires_at')
          .eq('id', profile.institute_id)
          .single();

        const isExpired = inst?.plan_expires_at ? new Date(inst.plan_expires_at) < new Date() : false;

        if (!inst || !inst.plan_id || inst.is_active === false || isExpired) {
          await supabase.auth.signOut();
          return { error: 'Your institute does not have an active plan. Please contact the administrator.' };
        }
      }
    }

    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
