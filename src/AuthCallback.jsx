{\rtf1\ansi\ansicpg1252\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // src/AuthCallback.jsx\
import \{ useEffect \} from 'react';\
import \{ supabase \} from './supabaseClient';\
\
export default function AuthCallback() \{\
  useEffect(() => \{\
    const run = async () => \{\
      try \{\
        // Exchanges the code in the URL for a Supabase session\
        const \{ error \} = await supabase.auth.exchangeCodeForSession(window.location.href);\
        if (error) console.error('exchangeCodeForSession error:', error);\
\
        // After session exists, bounce to the app root\
        window.location.replace('/');\
      \} catch (e) \{\
        console.error('AuthCallback fatal:', e);\
        window.location.replace('/');\
      \}\
    \};\
    run();\
  \}, []);\
\
  return (\
    <div className="min-h-screen flex items-center justify-center bg-gray-100">\
      <div className="bg-white p-6 rounded-xl shadow">Finishing sign-in\'85</div>\
    </div>\
  );\
\}\
}