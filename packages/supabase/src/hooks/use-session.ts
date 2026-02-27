import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import type { SupabaseClient } from "../client";

export function useSession(client: SupabaseClient) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [client]);

  const signOut = useCallback(async () => {
    await client.auth.signOut();
  }, [client]);

  return { session, loading, signOut };
}
