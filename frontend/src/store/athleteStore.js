import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAthleteStore = create(
  persist(
    (set) => ({
      // Auth
      athlete: null,
      token: null,
      isAuthenticated: false,
      login: (athlete, token) => set({ athlete, token, isAuthenticated: true }),
      logout: () => set({ athlete: null, token: null, isAuthenticated: false, profile: null, currentAssessment: null, bottlenecks: [], currentPlan: null }),

      // Profile
      profile: null,
      setProfile: (profile) => set({ profile }),

      // Assessment
      currentAssessment: null,
      bottlenecks: [],
      setAssessment: (assessment) => set({ currentAssessment: assessment }),
      setBottlenecks: (bottlenecks) => set({ bottlenecks }),

      // Plan
      currentPlan: null,
      setPlan: (plan) => set({ currentPlan: plan }),

      // Onboarding state
      onboardingStep: 0,
      onboardingData: {},
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      updateOnboardingData: (data) => set((state) => ({ onboardingData: { ...state.onboardingData, ...data } })),
    }),
    {
      name: 'athlete-storage',
    }
  )
)
