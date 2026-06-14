import { UserProfile } from '@/types/laundry';
import { supabase, isSupabaseConfigured } from '@/utils/supabaseClient';

const KEYS = {
  USERS: 'lms_users',
  CURRENT_USER: 'lms_current_user',
};

// Seed demo user
const DEMO_USER: UserProfile & { passwordHash: string } = {
  id: 'user-demo',
  email: 'demo@lms-saas.com',
  fullName: 'John Doe',
  shopName: "JohnDoe's Laundry Care",
  createdAt: new Date().toISOString(),
  passwordHash: 'demopassword', // Simple plain check for mock environment
};

function getLocalUsers(): (UserProfile & { passwordHash: string })[] {
  if (typeof window === 'undefined') return [DEMO_USER];
  const raw = localStorage.getItem(KEYS.USERS);
  if (!raw) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([DEMO_USER]));
    return [DEMO_USER];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [DEMO_USER];
  }
}

function saveLocalUser(user: UserProfile & { passwordHash: string }) {
  if (typeof window === 'undefined') return;
  const users = getLocalUsers();
  users.push(user);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

export const authService = {
  async login(email: string, password: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      console.log('Supabase Auth: Logging in...', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        // Fetch profile data from metadata or profiles table
        const shopName = data.user.user_metadata?.shopName || 'My Laundry Store';
        const fullName = data.user.user_metadata?.fullName || 'Shop Owner';

        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          shopName,
          fullName,
          createdAt: data.user.created_at || new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(profile));
        }
        return profile;
      }
      throw new Error('User data unavailable');
    }

    // Local Storage Mock Auth
    console.log('Mock Auth: Checking credentials...', email);
    const users = getLocalUsers();
    const matched = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === password
    );

    if (matched) {
      const profile: UserProfile = {
        id: matched.id,
        email: matched.email,
        shopName: matched.shopName,
        fullName: matched.fullName,
        createdAt: matched.createdAt,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(profile));
      }
      return profile;
    }

    throw new Error('Invalid email or password. Use "demo@lms-saas.com" / "demopassword" for demo access.');
  },

  async signUp(email: string, password: string, fullName: string, shopName: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      console.log('Supabase Auth: Registering user...', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
            shopName,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          shopName,
          fullName,
          createdAt: data.user.created_at || new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(profile));
        }
        return profile;
      }
      throw new Error('Failed to register user.');
    }

    // Local Storage Mock Registration
    console.log('Mock Auth: Registering customer...', email);
    const users = getLocalUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (exists) {
      throw new Error('Email address already registered.');
    }

    const newUser: UserProfile & { passwordHash: string } = {
      id: `user-${Date.now()}`,
      email,
      fullName,
      shopName,
      createdAt: new Date().toISOString(),
      passwordHash: password,
    };

    saveLocalUser(newUser);

    const profile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      shopName: newUser.shopName,
      fullName: newUser.fullName,
      createdAt: newUser.createdAt,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(profile));
    }
    return profile;
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase Auth: logout error', error);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    if (typeof window === 'undefined') return null;

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const u = data.session.user;
        return {
          id: u.id,
          email: u.email || '',
          shopName: u.user_metadata?.shopName || 'My Laundry Store',
          fullName: u.user_metadata?.fullName || 'Shop Owner',
          createdAt: u.created_at,
        };
      }
    }

    const cached = localStorage.getItem(KEYS.CURRENT_USER);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  },
};
