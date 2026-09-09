import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, intakeAPI, formatErrorMessage } from '../api/client';

export const DEFAULT_ATHLETE = {
  id: 'athlete-1',
  email: 'athlete@sportify.ai',
  full_name: 'Alex Vance',
};

export const DEFAULT_PROFILE = {
  sport: 'cricket',
  primary_role: 'batsman',
  sub_role: 'opening_batsman',
  experience_level: 'intermediate',
  training_days_per_week: 4,
  session_duration_minutes: 60,
  age: 21,
  weight_kg: 72,
  height_cm: 178,
  development_objectives: ['explosiveness', 'deceleration'],
};

export const useAthleteStore = create(
  persist(
    (set, get) => ({
      // Auth & Identity (Ready by default — zero login/auth barrier)
      athlete: DEFAULT_ATHLETE,
      token: 'local-session-active',
      isAuthenticated: true,
      authStatus: 'authenticated',

      // Profile & Status
      profile: DEFAULT_PROFILE,
      profileStatus: 'ready',
      profileError: null,

      // Biomechanical Telemetry & Assessment
      currentAssessment: null,
      bottlenecks: [],

      // Training & Recovery Plan
      currentPlan: null,

      // Onboarding Wizard State
      onboardingStep: 0,
      onboardingData: {},

      // ── Actions ──────────────────────────────────────────────────────────

      login: (athlete, token, profile = null) => {
        set({
          athlete: athlete || DEFAULT_ATHLETE,
          token: token || 'local-session-active',
          isAuthenticated: true,
          authStatus: 'authenticated',
          profile: profile || get().profile || DEFAULT_PROFILE,
          profileStatus: 'ready',
          profileError: null,
        });
      },

      logout: () => {
        // Reset to clean default state without locking out the user
        set({
          athlete: DEFAULT_ATHLETE,
          token: 'local-session-active',
          isAuthenticated: true,
          authStatus: 'authenticated',
          profile: DEFAULT_PROFILE,
          profileStatus: 'ready',
          profileError: null,
          currentAssessment: null,
          bottlenecks: [],
          currentPlan: null,
        });
      },

      setProfile: (profile) => {
        set({
          profile: profile ? { ...DEFAULT_PROFILE, ...profile } : DEFAULT_PROFILE,
          profileStatus: 'ready',
          profileError: null,
        });
      },

      setProfileStatus: (status, error = null) => {
        set({
          profileStatus: status,
          profileError: typeof error === 'string' ? error : formatErrorMessage(error),
        });
      },

      setAssessment: (assessment) => set({ currentAssessment: assessment }),
      setBottlenecks: (bottlenecks) => set({ bottlenecks }),
      setPlan: (plan) => set({ currentPlan: plan }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      updateOnboardingData: (data) =>
        set((state) => ({ onboardingData: { ...state.onboardingData, ...data } })),

      /**
       * Bootstraps athlete context on app load.
       * Always ensures a valid profile is ready with zero auth barriers.
       */
      hydrateAuthAndProfile: async () => {
        const state = get();
        if (!state.profile) {
          set({
            athlete: DEFAULT_ATHLETE,
            token: 'local-session-active',
            isAuthenticated: true,
            authStatus: 'authenticated',
            profile: DEFAULT_PROFILE,
            profileStatus: 'ready',
            profileError: null,
          });
        }
        return { isAuthenticated: true, profileStatus: 'ready', profile: state.profile || DEFAULT_PROFILE };
      },
    }),
    {
      name: 'athlete-storage',
      partialize: (state) => ({
        token: state.token,
        athlete: state.athlete,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        currentAssessment: state.currentAssessment,
        bottlenecks: state.bottlenecks,
        currentPlan: state.currentPlan,
      }),
    }
  )
);

export default useAthleteStore;
