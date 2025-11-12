// src/AuthCallback.jsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function AuthCallback() {
  const [msg, setMsg] = useState('Exchanging authorization code…');

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (!code) {
          setMsg('Missing ?code in URL. Did Google redirect here?');
          return;
        }

        // Invoke Edge Function to exchange the code for tokens
        const { data, error } = await supabase.functions.invoke('oauth-exchange', {
          body: { code },
        });

        if (error) {
          console.error('[oauth-exchange] error:', error);
          setMsg('Token exchange failed. Check function logs.');
          return;
        }

        console.log('[oauth-exchange] success:', data);
        setMsg('Success! Redirecting…');
        // Clean the URL then go home
        window.history.replaceState({}, '', '/');
        window.location.assign('/');
      } catch (e) {
        console.error('[oauth-exchange] exception:', e);
        setMsg('Unexpected error during token exchange.');
      }
    })();
  }, []);

  return (
    <div style={{display:'grid',placeItems:'center',minHeight:'60vh',fontFamily:'system-ui'}}>
      <div>
        <h1>Signing you in…</h1>
        <p>{msg}</p>
      </div>
    </div>
  );
}
