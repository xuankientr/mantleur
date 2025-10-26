import supabase from './supabase';
import api from './api';

// Authentication
export const supabaseAuth = {
  async signUp(email, password, username) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              username: username,
              coinBalance: 1000
            }
          ]);

        if (profileError) console.error('Profile creation error:', profileError);
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  },

  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      return { 
        user: {
          ...user,
          ...profile
        }, 
        error: null 
      };
    } catch (error) {
      return { user: null, error };
    }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

// User operations
export const supabaseUser = {
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getStreams(userId) {
    try {
      const { data, error } = await supabase
        .from('streams')
        .select('*')
        .eq('streamerId', userId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async addCoins(userId, amount) {
    try {
      // Get current balance
      const { data: user, error: getUserError } = await supabase
        .from('users')
        .select('coinBalance')
        .eq('id', userId)
        .single();

      if (getUserError) throw getUserError;

      // Update balance
      const { data, error } = await supabase
        .from('users')
        .update({ coinBalance: (user.coinBalance || 0) + amount })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Stream operations
export const supabaseStreams = {
  async getAll(filters = {}) {
    try {
      let query = supabase
        .from('streams')
        .select('*, streamer:users(*)');

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.q) {
        query = query.or(`title.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
      }
      if (filters.isLive !== undefined) {
        query = query.eq('isLive', filters.isLive);
      }

      query = query.order('createdAt', { ascending: false });
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async getById(streamId) {
    try {
      const { data, error } = await supabase
        .from('streams')
        .select('*, streamer:users(*)')
        .eq('id', streamId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async create(streamData) {
    try {
      const { data, error } = await supabase
        .from('streams')
        .insert([streamData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async update(streamId, updates) {
    try {
      const { data, error } = await supabase
        .from('streams')
        .update(updates)
        .eq('id', streamId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  async delete(streamId) {
    try {
      const { error } = await supabase
        .from('streams')
        .delete()
        .eq('id', streamId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }
};

// Hybrid approach: Use Supabase for database, keep HTTP API for backend logic
export const supabaseClient = {
  ...supabaseAuth,
  ...supabaseUser,
  ...supabaseStreams,
  
  // Use HTTP API for complex operations
  async createDonation(donationData) {
    return api.post('/donations', donationData);
  },

  async getDonations(type = 'sent') {
    const endpoint = type === 'sent' ? '/donations/my-donations' : '/donations/received';
    return api.get(endpoint);
  },

  async followStreamer(streamerId) {
    return api.post(`/follows/${streamerId}`);
  },

  async unfollowStreamer(streamerId) {
    return api.delete(`/follows/${streamerId}`);
  },

  async createPayment(amount) {
    return api.post('/payments/create', { amount });
  },

  async createWithdrawal(withdrawalData) {
    return api.post('/withdrawals', withdrawalData);
  }
};

export default supabaseClient;
