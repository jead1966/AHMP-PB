import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data, error } = await supabase
          .from('associados')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (error) console.error('Error fetching profile:', error);
        if (mounted) setProfile(data);
      }
      if (mounted) setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state change:', _event, session?.user?.id);
      if (mounted) setUser(session?.user ?? null);
      if (session?.user) {
        const { data, error } = await supabase
          .from('associados')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        if (error) console.error('Error fetching profile on change:', error);
        if (mounted) setProfile(data);
      } else {
        if (mounted) setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
