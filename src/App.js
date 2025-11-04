// src/App.js
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

/* ------------ Auth helpers ------------ */
const handleLogin = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: [
        'https://www.googleapis.com/auth/business.manage',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' '),
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  });
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.replace('/');
};

export default function App() {
  /* ------------ State ------------ */
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  /* ------------ Session bootstrap ------------ */
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session ?? null);
      setAuthLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s ?? null);
    });
    return () => sub.subscription?.unsubscribe();
  }, []);

  /* ------------ Handle /auth/callback ------------ */
  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      if (!url.pathname.startsWith('/auth/callback')) return;

      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      if (!code || !state) {
        window.history.replaceState({}, '', '/');
        return;
      }

      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession({ code });
        if (!error && data?.session?.provider_token) {
          // hand provider access token to our function so it can mint/refresh tokens server-side
          const { error: fnErr } = await supabase.functions.invoke('oauth-exchange', {
            body: { provider: 'google', provider_token: data.session.provider_token },
          });
          if (fnErr) console.error('oauth-exchange error:', fnErr);
        } else if (error) {
          console.error('exchangeCodeForSession error:', error);
        }
      } catch (e) {
        console.error('Auth callback failed:', e);
      } finally {
        // Clean the URL either way
        window.history.replaceState({}, '', '/');
      }
    })();
  }, []);

  /* ------------ Data loaders ------------ */
  const normalizeLocations = (raw) => {
    // Accept { locations: [...] } OR [...] OR anything else -> []
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.locations)) return raw.locations;
    return [];
  };

  const loadLocations = async () => {
    setErrorMsg('');
    setLocations([]);
    setSelectedLocation('');
    setReport(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('get-locations', { body: {} });
      if (error) throw error;
      const list = normalizeLocations(data);
      setLocations(list);
      if (list.length) {
        const first = list[0];
        const id = first?.id || first?.name || first?.title || first?.locationName || String(first);
        setSelectedLocation(id);
      }
    } catch (e) {
      console.error('get-locations error:', e);
      setErrorMsg(`get-locations failed: ${e.message || e.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (locationIdOrName) => {
    if (!locationIdOrName) return;
    setErrorMsg('');
    setReport(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('get-report', {
        body: { locationId: locationIdOrName },
      });
      if (error) throw error;
      setReport(data ?? null);
    } catch (e) {
      console.error('get-report error:', e);
      setErrorMsg(`get-report failed: ${e.message || e.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  /* ------------ Auto-load after sign-in ------------ */
  useEffect(() => {
    if (session) loadLocations();
  }, [session]);

  useEffect(() => {
    if (selectedLocation) loadReport(selectedLocation);
  }, [selectedLocation]);

  /* ------------ Render ------------ */
  if (authLoading) {
    return (
      <div style={{display:'flex',minHeight:'100vh',alignItems:'center',justifyContent:'center'}}>
        Checking sign-in…
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{display:'flex',minHeight:'100vh',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12}}>
        <h1>GBP Reports (Live)</h1>
        <p>Sign in with Google to fetch your real locations and report.</p>
        <button onClick={handleLogin} style={{padding:'8px 14px'}}>Sign in with Google</button>
      </div>
    );
  }

  const safeLocations = Array.isArray(locations) ? locations : [];

  return (
    <div style={{maxWidth:980,margin:'40px auto',padding:'0 16px',fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Arial'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h2>GBP Reports (Live JSON)</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <section style={{marginBottom:16,padding:12,background:'#f7f7f7',borderRadius:8}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <label htmlFor="loc">Location:</label>
          <select
            id="loc"
            value={selectedLocation || ''}
            onChange={(e) => setSelectedLocation(e.target.value)}
            disabled={loading || !safeLocations.length}
          >
            {safeLocations.map((loc, idx) => {
              const id = loc?.id || loc?.name || loc?.title || loc?.locationName || String(loc);
              const label = loc?.name || loc?.title || loc?.locationName || id;
              return <option key={idx} value={id}>{label}</option>;
            })}
          </select>
          <button onClick={() => loadLocations()} disabled={loading}>Reload locations</button>
          <button onClick={() => loadReport(selectedLocation)} disabled={loading || !selectedLocation}>Reload report</button>
        </div>
        {!safeLocations.length && !loading && (
          <div style={{marginTop:8,color:'#b45309'}}>No locations returned yet.</div>
        )}
      </section>

      {errorMsg && (
        <div style={{marginBottom:16,padding:12,background:'#fee2e2',border:'1px solid #fecaca',borderRadius:8,color:'#991b1b'}}>
          {errorMsg}
        </div>
      )}

      <section>
        <h3 style={{margin:'8px 0'}}>Report (raw response)</h3>
        {loading && <div>Loading…</div>}
        {!loading && report && (
          <pre style={{background:'#0b1021',color:'#d1e7ff',padding:16,borderRadius:8,overflow:'auto'}}>
{JSON.stringify(report, null, 2)}
          </pre>
        )}
        {!loading && !report && (
          <div style={{color:'#6b7280'}}>Select a location to load its report.</div>
        )}
      </section>
    </div>
  );
}
