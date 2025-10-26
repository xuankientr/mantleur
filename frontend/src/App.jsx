import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { PaymentProvider } from './contexts/PaymentContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Home from './pages/Home';
import Stream from './pages/Stream';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ScheduledStreams from './pages/ScheduledStreams';
import Payment from './pages/Payment';
import MockPayment from './pages/MockPayment';
import AdminWithdrawals from './pages/AdminWithdrawals';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCallback from './pages/PaymentCallback';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <PaymentProvider>
            <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Public Routes */}
              <Route path="/payment/mock" element={<MockPayment />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                    <Route path="stream/:streamId" element={<Stream />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="scheduled-streams" element={<ScheduledStreams />} />
                    <Route path="payment" element={<Payment />} />
              </Route>
            </Routes>
            </Router>
          </PaymentProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;