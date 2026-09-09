import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, intakeAPI } from '../api/client';

export const useAthleteStore = create(
  persist(
    (set, get) => ({
      // Auth & Token
      athlete: null,
      token: null,
      isAuthenticated: false,
      authStatus: 'unknown', // 'unknown' | 'authenticated' | 'unauthenticated'

      // Profile & Status
      profile: null,
      profileStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'missing' | 'error'
      profileError: null,

      // Assessment & Bottlenecks
      currentAssessment: null,
      bottlenecks: [],

      // Training Plan
      currentPlan: null,

      // Onboarding state
      onboardingStep: 0,
      onboardingData: {},

      // Actions
      login: (athlete, token, profile = null) => {
        set({
          athlete,
          token,
          isAuthenticated: true,
          authStatus: 'authenticated',
          profile,
          profileStatus: profile ? 'ready' : 'missing',
          profileError: null,
        });
      },

      logout: () => {
        set({
          athlete: null,
          token: null,
          isAuthenticated: false,
          authStatus: 'unauthenticated',
          profile: null,
          profileStatus: 'idle',
          profileError: null,
          currentAssessment: null,
          bottlenecks: [],
          currentPlan: null,
        });
      },

      setProfile: (profile) => {
        set({
          profile,
          profileStatus: profile ? 'ready' : 'missing',
          profileError: null,
        });
      },

      setProfileStatus: (status, error = null) => {
        set({ profileStatus: status, profileError: error });
      },

      setAssessment: (assessment) => set({ currentAssessment: assessment }),
      setBottlenecks: (bottlenecks) => set({ bottlenecks }),
      setPlan: (plan) => set({ currentPlan: plan }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      updateOnboardingData: (data) =>
        set((state) => ({ onboardingData: { ...state.onboardingData, ...data } })),

      /**
       * Asynchronously hydrate authentication identity and stored profile.
       * Called at app boot or after auth events.
       */
      hydrateAuthAndProfile: async () => {
        const state = get();
        const token = state.token;

        if (!token) {
          set({
            authStatus: 'unauthenticated',
            isAuthenticated: false,
            athlete: null,
            profile: null,
            profileStatus: 'idle',
          });
          return { isAuthenticated: false, profileStatus: 'idle' };
        }

        set({ profileStatus: 'loading' });

        try {
          // 1. Fetch current athlete
          const me = await authAPI.getMe();
          set({ athlete: me, isAuthenticated: true, authStatus: 'authenticated' });

          // 2. Fetch athlete profile
          try {
            const prof = await intakeAPI.getProfile();
            set({ profile: prof, profileStatus: 'ready', profileError: null });
            return { isAuthenticated: true, profileStatus: 'ready', profile: prof };
          } catch (profileErr) {
            if (profileErr.response?.status === 404) {
              set({ profile: null, profileStatus: 'missing', profileError: null });
              return { isAuthenticated: true, profileStatus: 'missing', profile: null };
            }
            set({
              profileStatus: 'error',
              profileError: profileErr.response?.data?.detail || profileErr.message,
            });
            return { isAuthenticated: true, profileStatus: 'error', error: profileErr };
          }
        } catch (authErr) {
          if (authErr.response?.status === 401) {
            get().logout();
            return { isAuthenticated: false, profileStatus: 'idle' };
          }
          set({
            profileStatus: 'error',
            profileError: authErr.response?.data?.detail || authErr.message,
          });
          return { isAuthenticated: false, profileStatus: 'error', error: authErr };
        }
      },
    }),
    {
      name: 'athlete-storage',
      partialize: (state) => ({
        token: state.token,
        athlete: state.athlete,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
