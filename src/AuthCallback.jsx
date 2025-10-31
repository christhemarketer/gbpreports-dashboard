// src/AuthCallback.jsx
import { useEffect } from 'react';
import { supabase } from './supabaseClient';
export default function AuthCallback() {
  useEffect(() => {
    const run = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) console.error('exchangeCodeForSession error:', error);
      } catch (e) {
        console.error('AuthCallback fatal:', e);
      } finally {
        window.location.replace('/');
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow">Finishing sign-in…</div>
    </div>
  );
}
