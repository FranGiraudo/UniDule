import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import type { Session } from '@supabase/supabase-js';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useStore((state) => state.setSession);
  const setProfile = useStore((state) => state.setProfile);
  const setTheme = useStore((state) => state.setTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: Session | null) => {
    setSession(session);
    if (session) {
      // Fetch profile
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (data) {
        setProfile(data);
        if (data.theme) {
          setTheme(data.theme);
        }
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading-screen">Cargando UniDule...</div>;
  }

  return <>{children}</>;
}
