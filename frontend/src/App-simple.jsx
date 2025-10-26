import React from 'react';

function SimpleApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 React App is Working!</h1>
      <p>If you can see this, React is loading correctly.</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Debug Info:</h3>
        <ul>
          <li>✅ React: {React.version}</li>
          <li>✅ Window: {typeof window !== 'undefined' ? 'Available' : 'Not available'}</li>
          <li>✅ Document: {typeof document !== 'undefined' ? 'Available' : 'Not available'}</li>
        </ul>
      </div>
    </div>
  );
}

export default SimpleApp;