'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();

  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const allParams = Array.from(searchParams.entries());

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1>Authentication Error</h1>

      <div style={{ background: '#fee', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Error Details:</h2>
        <p><strong>Error Code:</strong> {error || 'Unknown'}</p>
        <p><strong>Description:</strong> {errorDescription || 'No description available'}</p>
      </div>

      <div style={{ background: '#eee', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>All URL Parameters:</h3>
        <ul>
          {allParams.map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ background: '#eef', padding: '20px', borderRadius: '8px' }}>
        <h3>Next Steps:</h3>
        <p>请截图此页面并复制错误信息给开发者</p>
        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto', fontSize: '12px' }}>
Error: {error}
Description: {errorDescription}
All Params: {JSON.stringify(Object.fromEntries(allParams), null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ background: '#0070f3', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px' }}>
          返回首页
        </a>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
