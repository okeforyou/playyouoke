import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { auth } from '../../firebase';
import {
    onIdTokenChanged,
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import nookies from 'nookies';

interface UserData {
    uid: string | null;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role?: string | null;
    tier?: string | null;
}

interface UserState {
    user: UserData | null;
    isLoading: boolean;
    error: string | null;
    isHydrated: boolean;
}

interface AuthActions {
    initialize: () => () => void;
    signIn: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    setHydrated: () => void;
}

export const useAuthStore = create<UserState & AuthActions>()(
    persist(
        (set, get) => ({
            user: null,
            isLoading: true,
            error: null,
            isHydrated: false,

            initialize: () => {
                if (!auth) {
                    set({ isLoading: false, error: 'Firebase not configured' });
                    return () => { };
                }

                console.log('🔐 Auth Store: Initializing...');

                const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
                    if (!firebaseUser) {
                        set({ user: null, isLoading: false });
                        nookies.destroy(null, 'token');
                        nookies.destroy(null, 'uid');
                    } else {
                        // Optimistic update: Set user immediately with basic info
                        set({
                            user: {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                displayName: firebaseUser.displayName,
                                photoURL: firebaseUser.photoURL,
                                // Preserve existing role/tier if we have it in store already
                                role: get().user?.role,
                                tier: get().user?.tier,
                            },
                            isLoading: false
                        });

                        // Sync with backend (Get latest token claims)
                        try {
                            const token = await firebaseUser.getIdToken();
                            const idTokenResult = await firebaseUser.getIdTokenResult();
                            const customClaims = idTokenResult.claims;

                            set((state) => ({
                                user: {
                                    ...state.user!,
                                    role: (customClaims.role as string) || null,
                                    tier: (customClaims.tier as string) || null,
                                }
                            }));

                            // Set cookies for SSR/Middleware if needed
                            nookies.set(null, 'token', token, { path: '/', maxAge: 3600, sameSite: 'Lax' });
                            nookies.set(null, 'uid', firebaseUser.uid, { path: '/', maxAge: 3600, sameSite: 'Lax' });
                        } catch (error) {
                            console.error('Auth token error:', error);
                        }
                    }
                });

                return unsubscribe;
            },

            signIn: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    await signInWithEmailAndPassword(auth, email, password);
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            signUp: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    await createUserWithEmailAndPassword(auth, email, password);
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            signInWithGoogle: async () => {
                set({ isLoading: true, error: null });
                try {
                    const provider = new GoogleAuthProvider();
                    await signInWithPopup(auth, provider);
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                    throw error;
                }
            },

            signOut: async () => {
                set({ isLoading: true });
                try {
                    await firebaseSignOut(auth);
                    set({ user: null });
                } catch (error: any) {
                    set({ error: error.message, isLoading: false });
                }
            },

            setHydrated: () => set({ isHydrated: true })
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHydrated();
            },
            partialize: (state) => ({ user: state.user }), // Only persist user object
        }
    )
);
