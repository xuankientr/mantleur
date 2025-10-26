import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Test each context individually
function TestAuthContext() {
  try {
    const { AuthProvider } = require('./contexts/AuthContext');
    return (
      <AuthProvider>
        <div style={{ padding: '10px', backgroundColor: '#e8f5e8', margin: '10px' }}>
          ✅ AuthContext loaded successfully
        </div>
      </AuthProvider>
    );
  } catch (error) {
    return (
      <div style={{ padding: '10px', backgroundColor: '#ffe8e8', margin: '10px' }}>
        ❌ AuthContext error: {error.message}
      </div>
    );
  }
}

function TestSocketContext() {
  try {
    const { SocketProvider } = require('./contexts/SocketContext');
    return (
      <SocketProvider>
        <div style={{ padding: '10px', backgroundColor: '#e8f5e8', margin: '10px' }}>
          ✅ SocketContext loaded successfully
        </div>
      </SocketProvider>
    );
  } catch (error) {
    return (
      <div style={{ padding: '10px', backgroundColor: '#ffe8e8', margin: '10px' }}>
        ❌ SocketContext error: {error.message}
      </div>
    );
  }
}

function TestSolanaContext() {
  try {
    const { SolanaProvider } = require('./contexts/SolanaContext');
    return (
      <SolanaProvider>
        <div style={{ padding: '10px', backgroundColor: '#e8f5e8', margin: '10px' }}>
          ✅ SolanaContext loaded successfully
        </div>
      </SolanaProvider>
    );
  } catch (error) {
    return (
      <div style={{ padding: '10px', backgroundColor: '#ffe8e8', margin: '10px' }}>
        ❌ SolanaContext error: {error.message}
      </div>
    );
  }
}

function AppDebug() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 Debug App - Testing Each Context</h1>
      
      <TestAuthContext />
      <TestSocketContext />
      <TestSolanaContext />
      
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', margin: '10px' }}>
        <h3>Debug Info:</h3>
        <ul>
          <li>✅ React: {React.version}</li>
          <li>✅ Window: {typeof window !== 'undefined' ? 'Available' : 'Not available'}</li>
          <li>✅ Buffer: {typeof window.Buffer !== 'undefined' ? 'Available' : 'Not available'}</li>
          <li>✅ Process: {typeof window.process !== 'undefined' ? 'Available' : 'Not available'}</li>
        </ul>
      </div>
    </div>
  );
}

export default AppDebug;



