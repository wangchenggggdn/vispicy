'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function DebugSessionPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('[Debug Session] Status:', status);
    console.log('[Debug Session] Session:', session);
  }, [session, status]);

  const testSessionAPI = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      console.log('[Debug Session] API Response:', data);
      alert(`Session API Response:\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('[Debug Session] API Error:', error);
      alert(`Error: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Session Debug Page</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Status: {status}</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Session Data:</h3>
        <pre style={{ background: '#f0f0f0', padding: '10px' }}>
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <button
        onClick={testSessionAPI}
        style={{
          padding: '10px 20px',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Test Session API
      </button>

      {session ? (
        <div>
          <p>Signed in as: {session.user?.email}</p>
          <button
            onClick={() => signOut()}
            style={{
              padding: '10px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <p>Not signed in</p>
      )}
    </div>
  );
}
