'use client';

/**
 * Authentication Store (Zustand)
 * Mock implementation using localStorage
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { User, UserRole, Permission, ROLE_PERMISSIONS } from '@/entities/auth';

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
  _hasHydrated: boolean;

  // UI state
  showLoginModal: boolean;
  rememberMe: boolean;
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
          _hasHydrated: false,
          showLoginModal: false,
          rememberMe: false,

          // Initialize authentication
          initializeAuth: () => {
            const stored = localStorage.getItem('auth-session');
            if (stored) {
              try {
                const sessionData = JSON.parse(stored);
                // Check if we have a valid session
                if (sessionData.userId) {
                  set((state) => {
                    state.user = {
                      id: sessionData.userId,
                      email: sessionData.email,
                      name: sessionData.name,
                      role: sessionData.role,
                      permissions: [],
                      avatar: null,
                      isActive: true,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    };
                    state.isAuthenticated = true;
                    state.isInitialized = true;
                    state.isLoading = false;
                  });
                  return;
                }
              } catch (error) {
                localStorage.removeItem('auth-session');
              }
            }

            set((state) => {
              state.isInitialized = true;
              state.isLoading = false;
            });
          },

          // Login action
          login: async (email: string, password: string, rememberMe = false) => {
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

              // Save session info to localStorage (for persistence)
              localStorage.setItem('auth-session', JSON.stringify({ 
                userId: user.id,
                email: user.email,
                name: user.name,
                role: user.role
              }));

              set((state) => {
                state.user = user;
                state.session = sessionObj;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
              });

            } catch (error: any) {

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

        })),
        {
          name: 'auth-store',
          storage: createJSONStorage(() => localStorage),
          skipHydration: true,
          partialize: (state) => ({
            user: state.user,
            session: state.session,
            isAuthenticated: state.isAuthenticated,
            isInitialized: state.isInitialized,
            rememberMe: state.rememberMe,
          }),
          version: 1,
          onRehydrateStorage: () => (state) => {
            if (state) {
              state.isLoading = false;
              state._hasHydrated = true;
            }
          },
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
  hasHydrated: (state: AuthStore) => state._hasHydrated,
};
