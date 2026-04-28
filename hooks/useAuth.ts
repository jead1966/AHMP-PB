import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('associados')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        if (error) console.error('Error fetching profile:', error);
        setProfile(data);
      }
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state change:', _event, session?.user?.id);
      setLoading(true);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data, error } = await supabase
          .from('associados')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        if (error) console.error('Error fetching profile on change:', error);
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading };
}
