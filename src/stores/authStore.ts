'use client';

/**
 * Authentication Store (Zustand)
 * Mock implementation using localStorage
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { appwriteApi } from '@/lib/api/appwrite-api';
import { mockAuthApi } from '@/lib/api/mock-auth-api';
import { account } from '@/lib/appwrite/client';
import { createUserLabels } from '@/lib/appwrite/permissions';
import { User, UserRole, Permission, ROLE_PERMISSIONS } from '@/types/auth';

interface Session {
  userId: string;
  accessToken: string;
  expire: string;
}

interface AuthState {
  // Auth state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // UI state
  showLoginModal: boolean;
  rememberMe: boolean;
  loginAttempts: number;
  lastLoginAttempt?: Date;
}

interface AuthActions {
  // Authentication actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: (callback?: () => void) => void;
  initializeAuth: () => void;

  // Permission helpers
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;

  // UI actions
  setShowLoginModal: (show: boolean) => void;
  clearError: () => void;
  setRememberMe: (remember: boolean) => void;

  // Internal actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  incrementLoginAttempts: () => void;
  resetLoginAttempts: () => void;
}

type AuthStore = AuthState & AuthActions;

// Configuration: Set to true to use mock authentication temporarily
const USE_MOCK_AUTH = false;

// Convert Appwrite user to Store user
const appwriteUserToStoreUser = (appwriteUser: any): User => {
  const role = (appwriteUser.labels?.[0]?.toUpperCase() || 'MEMBER') as UserRole;
  return {
    id: appwriteUser.$id,
    email: appwriteUser.email,
    name: appwriteUser.name,
    role,
    avatar: appwriteUser.avatar,
    permissions: ROLE_PERMISSIONS[role] || [],
    isActive: true,
    createdAt: appwriteUser.$createdAt,
    updatedAt: appwriteUser.$updatedAt,
  };
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          // Initial state
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: false,
          error: null,
          showLoginModal: false,
          rememberMe: false,
          loginAttempts: 0,

          // Initialize authentication
          initializeAuth: () => {
            const stored = localStorage.getItem('auth-session');
            if (stored) {
              try {
                const session = JSON.parse(stored);
                const expiresAt = new Date(session.expire);

                if (expiresAt > new Date()) {
                  set((state) => {
                    state.session = session;
                    state.isAuthenticated = true;
                  });
                } else {
                  localStorage.removeItem('auth-session');
                }
              } catch (error) {
                localStorage.removeItem('auth-session');
              }
            }

            set((state) => {
              state.isInitialized = true;
            });
          },

          // Login action
          login: async (email: string, password: string, rememberMe = false) => {
            const state = get();

            // Rate limiting
            if (state.loginAttempts >= 5) {
              const lastAttempt = state.lastLoginAttempt;
              if (lastAttempt && Date.now() - lastAttempt.getTime() < 15 * 60 * 1000) {
                set((state) => {
                  state.error = 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.';
                });
                throw new Error('Çok fazla deneme. 15 dakika sonra tekrar deneyin.');
              } else {
                get().resetLoginAttempts();
              }
            }

            set((state) => {
              state.isLoading = true;
              state.error = null;
              state.rememberMe = rememberMe;
            });

            try {
              // Get CSRF token first
              const csrfResponse = await fetch('/api/csrf');
              const csrfData = await csrfResponse.json();

              if (!csrfData.success) {
                throw new Error('CSRF token alınamadı');
              }

              // Call server-side login API (sets HttpOnly cookie)
              const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-csrf-token': csrfData.token,
                },
                body: JSON.stringify({ email, password, rememberMe }),
              });

              const result = await response.json();

              if (!result.success) {
                throw new Error(result.error || 'Giriş yapılamadı');
              }

              const user = result.data.user;

              // Create session object (without actual token - stored in HttpOnly cookie)
              const sessionObj: Session = {
                userId: user.id,
                accessToken: 'stored-in-httponly-cookie', // Not stored client-side
                expire: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              };

              // Save minimal session info to localStorage (for persistence)
              localStorage.setItem('auth-session', JSON.stringify({ userId: user.id }));

              set((state) => {
                state.user = user;
                state.session = sessionObj;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
              });

              get().resetLoginAttempts();
            } catch (error: any) {
              get().incrementLoginAttempts();

              const errorMessage = error.message || 'Giriş yapılamadı';

              set((state) => {
                state.isLoading = false;
                state.error = errorMessage;
              });

              throw new Error(errorMessage);
            }
          },

          // Logout action
          logout: async (callback?: () => void) => {
            try {
              // Call server-side logout API (clears HttpOnly cookie)
              await fetch('/api/auth/logout', {
                method: 'POST',
              });
            } catch (error) {
              console.error('Logout error:', error);
            }

            // Clear localStorage
            localStorage.removeItem('auth-session');

            set((state) => {
              state.user = null;
              state.session = null;
              state.isAuthenticated = false;
              state.error = null;
              state.showLoginModal = false;
            });

            if (callback) {
              callback();
            } else {
              window.location.href = '/login';
            }
          },

          // Permission helpers
          hasPermission: (permission: Permission) => {
            const { user, isAuthenticated } = get();
            if (!user || !isAuthenticated) return false;
            return user.permissions.includes(permission);
          },

          hasRole: (role: UserRole) => {
            const { user, isAuthenticated } = get();
            if (!user || !isAuthenticated) return false;
            return user.role === role;
          },

          hasAnyPermission: (permissions: Permission[]) => {
            const { user, isAuthenticated } = get();
            if (!user || !isAuthenticated) return false;
            return permissions.some((permission) => user.permissions.includes(permission));
          },

          hasAllPermissions: (permissions: Permission[]) => {
            const { user, isAuthenticated } = get();
            if (!user || !isAuthenticated) return false;
            return permissions.every((permission) => user.permissions.includes(permission));
          },

          // UI actions
          setShowLoginModal: (show: boolean) => {
            set((state) => {
              state.showLoginModal = show;
            });
          },

          clearError: () => {
            set((state) => {
              state.error = null;
            });
          },

          setRememberMe: (remember: boolean) => {
            set((state) => {
              state.rememberMe = remember;
            });
          },

          // Internal actions
          setUser: (user: User | null) => {
            set((state) => {
              state.user = user;
            });
          },

          setSession: (session: Session | null) => {
            set((state) => {
              state.session = session;
            });
          },

          setLoading: (loading: boolean) => {
            set((state) => {
              state.isLoading = loading;
            });
          },

          setError: (error: string | null) => {
            set((state) => {
              state.error = error;
            });
          },

          incrementLoginAttempts: () => {
            set((state) => {
              state.loginAttempts += 1;
              state.lastLoginAttempt = new Date();
            });
          },

          resetLoginAttempts: () => {
            set((state) => {
              state.loginAttempts = 0;
              state.lastLoginAttempt = undefined;
            });
          },
        })),
        {
          name: 'auth-store',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            user: state.user,
            session: state.session,
            isAuthenticated: state.isAuthenticated,
            isInitialized: state.isInitialized,
            rememberMe: state.rememberMe,
            loginAttempts: state.loginAttempts,
            lastLoginAttempt: state.lastLoginAttempt,
          }),
          version: 1,
        }
      )
    ),
    { name: 'AuthStore' }
  )
);

// Selectors for performance optimization
export const authSelectors = {
  user: (state: AuthStore) => state.user,
  isAuthenticated: (state: AuthStore) => state.isAuthenticated,
  isLoading: (state: AuthStore) => state.isLoading,
  error: (state: AuthStore) => state.error,
  permissions: (state: AuthStore) => state.user?.permissions ?? [],
  role: (state: AuthStore) => state.user?.role,
  session: (state: AuthStore) => state.session,
};
