// SUPABASE AUTHENTICATION GUIDE
// This file shows how to integrate Supabase authentication with your existing auth system

import { supabaseAuth, supabaseUser } from '../utils/supabaseClient';

/*
EXAMPLE USAGE IN YOUR COMPONENTS:

// Login with Supabase
async function handleLogin(email, password) {
  const { data, error } = await supabaseAuth.signIn(email, password);
  
  if (error) {
    console.error('Login error:', error);
    return;
  }
  
  // User is automatically authenticated
  // Access token is stored in localStorage by Supabase
}

// Register with Supabase
async function handleRegister(email, password, username) {
  const { data, error } = await supabaseAuth.signUp(email, password, username);
  
  if (error) {
    console.error('Registration error:', error);
    return;
  }
  
  // User is automatically registered
}

// Get current user
async function getCurrentUser() {
  const { user, error } = await supabaseAuth.getUser();
  
  if (error) {
    console.error('Get user error:', error);
    return;
  }
  
  return user;
}

// Logout
async function handleLogout() {
  const { error } = await supabaseAuth.signOut();
  
  if (error) {
    console.error('Logout error:', error);
    return;
  }
  
  // User is logged out
}

// Listen to auth state changes
useEffect(() => {
  const { data: authListener } = supabaseAuth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN') {
        // User signed in
        console.log('User signed in:', session);
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        console.log('User signed out');
      }
    }
  );

  return () => {
    authListener?.subscription?.unsubscribe();
  };
}, []);

// Update user profile
async function updateProfile(userId, updates) {
  const { data, error } = await supabaseUser.updateProfile(userId, updates);
  
  if (error) {
    console.error('Update profile error:', error);
    return;
  }
  
  return data;
}
*/

export const SupabaseAuthExample = {
  // Use these methods in your components
  async login(email, password) {
    const result = await supabaseAuth.signIn(email, password);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data;
  },

  async register(email, password, username) {
    const result = await supabaseAuth.signUp(email, password, username);
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data;
  },

  async logout() {
    const result = await supabaseAuth.signOut();
    return result;
  },

  async getUser() {
    const result = await supabaseAuth.getUser();
    return result.user;
  },

  async updateProfile(userId, updates) {
    const result = await supabaseUser.updateProfile(userId, updates);
    return result.data;
  }
};
