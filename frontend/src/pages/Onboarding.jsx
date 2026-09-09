import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { authAPI, intakeAPI, formatErrorMessage } from '../api/client';
import SportifyLogo from '../components/common/SportifyLogo';
import { normalizeSport } from '../config/sportAssessmentConfig';
import {
  ArrowRightIcon,
  CheckIcon,
  TargetIcon,
  ZapIcon,
  DumbbellIcon,
  ShieldIcon,
  SlidersIcon,
  ClockIcon,
  SportIcon,
} from '../components/common/Icons';

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signup'; // 'signup' | 'signin' | 'complete-profile'

  const login = useAthleteStore((state) => state.login);
  const setProfile = useAthleteStore((state) => state.setProfile);
  const athlete = useAthleteStore((state) => state.athlete);

  const isSignIn = mode === 'signin';
  const isCompleteProfile = mode === 'complete-profile';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Taxonomy & Objectives from backend
  const [sportsData, setSportsData] = useState({});
  const [objectivesData, setObjectivesData] = useState({});

  // Form State
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    full_name: '',
  });

  const [profileData, setProfileData] = useState({
    sport: 'cricket',
    discipline: '',
    primary_role: 'batsman',
    sub_role: 'opening_batsman',
    development_objectives: ['explosiveness'],
    experience_level: 'intermediate',
    training_days_per_week: 4,
    session_duration_minutes: 60,
    age: 21,
    weight_kg: 72,
    height_cm: 178,
  });

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [sports, objs] = await Promise.all([
          intakeAPI.getSports().catch(() => ({})),
          intakeAPI.getObjectives().catch(() => ({})),
        ]);
        setSportsData(sports);
        setObjectivesData(objs);

        if (sports && sports['cricket']) {
          const firstRoleKey = Object.keys(sports['cricket'].roles || {})[0] || 'batsman';
          const firstSubKey = Object.keys(sports['cricket'].roles[firstRoleKey]?.sub_roles || {})[0] || '';
          setProfileData((prev) => ({
            ...prev,
            primary_role: firstRoleKey,
            sub_role: firstSubKey,
          }));
        }
      } catch (err) {
        console.error('Failed to load taxonomy:', err);
      }
    }
    loadTaxonomy();
  }, []);

  const currentSport = sportsData[profileData.sport] || {};
  const currentRoles = currentSport.roles || {};
  const currentSubRoles = currentRoles[profileData.primary_role]?.sub_roles || {};

  const handleSportSelect = (sportKey) => {
    const sportObj = sportsData[sportKey] || {};
    const firstRoleKey = Object.keys(sportObj.roles || {})[0] || '';
    const firstSubKey = Object.keys(sportObj.roles?.[firstRoleKey]?.sub_roles || {})[0] || '';
    setProfileData((prev) => ({
      ...prev,
      sport: sportKey,
      discipline: sportObj.disciplines?.[0]?.id || sportObj.disciplines?.[0] || '',
      primary_role: firstRoleKey,
      sub_role: firstSubKey,
    }));
  };

  const handleRoleSelect = (roleKey) => {
    const subRoles = currentRoles[roleKey]?.sub_roles || {};
    const firstSub = Object.keys(subRoles)[0] || '';
    setProfileData((prev) => ({
      ...prev,
      primary_role: roleKey,
      sub_role: firstSub,
    }));
  };

  const toggleObjective = (objKey) => {
    setProfileData((prev) => {
      const current = prev.development_objectives || [];
      if (current.includes(objKey)) {
        return {
          ...prev,
          development_objectives: current.filter((k) => k !== objKey),
        };
      } else {
        return {
          ...prev,
          development_objectives: [...current, objKey],
        };
      }
    });
  };

  /**
   * Dedicated SIGN IN Handler
   * Authenticates user, hydrates profile from backend, and routes safely.
   * NEVER calls submitProfile() to prevent overwriting stored profiles!
   */
  const handleSignInSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loginRes = await authAPI.login({
        email: authData.email,
        password: authData.password,
      });

      const token = loginRes.access_token;
      if (!token) {
        throw new Error('Authentication failed. No access token received.');
      }

      // 1. Temporarily save token in store so axios interceptor uses it
      login({ email: authData.email }, token, null);

      // 2. Hydrate athlete identity
      const me = await authAPI.getMe();

      // 3. Fetch existing profile
      try {
        const existingProfile = await intakeAPI.getProfile();
        login(me, token, existingProfile);

        const targetSport = normalizeSport(existingProfile.sport);
        if (targetSport) {
          navigate(`/assessment/${targetSport}`);
        } else {
          navigate('/dashboard');
        }
      } catch (profileErr) {
        if (profileErr.response?.status === 404) {
          // Profile not yet created for this user
          login(me, token, null);
          setSearchParams({ mode: 'complete-profile' });
          setStep(1);
          setError('Welcome back! Please complete your athlete profile configuration.');
        } else {
          throw profileErr;
        }
      }
    } catch (err) {
      setError(
        formatErrorMessage(
          err,
          'Incorrect email or password. Please verify your credentials.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * REGISTRATION or COMPLETE-PROFILE Handler
   * Creates account (if signup), submits chosen profileData, and routes to assessment.
   */
  const handleProfileSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let token = useAthleteStore.getState().token;
      let me = athlete;

      if (!isCompleteProfile) {
        // Step A: Register Account
        await authAPI.register({
          email: authData.email,
          password: authData.password,
          full_name: authData.full_name,
        });

        // Step B: Authenticate
        const loginRes = await authAPI.login({
          email: authData.email,
          password: authData.password,
        });
        token = loginRes.access_token;
        login({ email: authData.email }, token, null);

        me = await authAPI.getMe();
      }

      // Step C: Save Athlete Profile with selected sport & role data
      const savedProfile = await intakeAPI.submitProfile({
        sport: profileData.sport,
        discipline: profileData.discipline,
        primary_role: profileData.primary_role,
        sub_role: profileData.sub_role,
        development_objectives: profileData.development_objectives,
        experience_level: profileData.experience_level,
        training_days_per_week: Number(profileData.training_days_per_week),
        session_duration_minutes: Number(profileData.session_duration_minutes),
        age: Number(profileData.age),
        weight_kg: Number(profileData.weight_kg),
        height_cm: Number(profileData.height_cm),
      });

      login(me || { email: authData.email }, token, savedProfile);
      setProfile(savedProfile);

      const targetSport = normalizeSport(savedProfile?.sport || profileData.sport);
      navigate(`/assessment/${targetSport || 'cricket'}`);
    } catch (err) {
      setError(
        formatErrorMessage(
          err,
          'Failed to complete profile configuration. Please check your inputs.'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#07080C] text-[#F1F5F9] flex flex-col w-full selection:bg-white/20 select-none relative overflow-x-hidden">
      <div className="w-full max-w-xl mx-auto min-h-[100dvh] flex flex-col justify-between px-4 py-4 sm:py-6 relative z-10">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between mb-3 pt-safe">
          <SportifyLogo size="xs" showTagline={false} />
          {!isCompleteProfile && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSearchParams({ mode: isSignIn ? 'signup' : 'signin' });
              }}
              className="text-[11px] font-medium text-slate-300 hover:text-white font-tech tracking-wide px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            >
              {isSignIn ? 'Need Account? Sign Up' : 'Have Account? Sign In'}
            </button>
          )}
        </div>

        {/* Main Multi-Step Box */}
        <div className="w-full sportify-card p-4 sm:p-6 border border-white/[0.1] shadow-2xl relative flex-1 flex flex-col justify-between my-2">
          {/* Step Progress Bar (hidden in sign-in mode) */}
          {!isSignIn && (
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
              {[
                { num: 1, label: 'Sport' },
                { num: 2, label: 'Goals' },
                { num: 3, label: 'Biometrics' },
                ...(!isCompleteProfile ? [{ num: 4, label: 'Account' }] : []),
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all ${
                      step === s.num
                        ? 'bg-white text-slate-950 shadow-[0_0_12px_rgba(255,255,255,0.35)]'
                        : step > s.num
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35'
                        : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'
                    }`}
                  >
                    {step > s.num ? <CheckIcon className="w-3 h-3" /> : s.num}
                  </div>
                  <span className="text-[10px] font-medium font-tech tracking-wide text-slate-400">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs mb-3 flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── DEDICATED SIGN IN FORM ────────────────────────────────────────── */}
          {isSignIn && (
            <form onSubmit={handleSignInSubmit} className="space-y-3.5 my-auto">
              <div>
                <h2 className="text-base font-bold font-heading tracking-wider uppercase text-white mb-1">
                  Sign In to Sportify
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Access your personalized biomechanical telemetry and development pathway.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="athlete@sportify.com"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  className="w-full h-11 px-3.5 sportify-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authData.password}
                  onChange={(e) =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                  className="w-full h-11 px-3.5 sportify-input text-xs font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full h-11 btn-primary flex items-center justify-center gap-2 uppercase tracking-wider text-xs ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                  {!loading && <ArrowRightIcon className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-center text-xs text-slate-500 pt-2">
                New athlete?{' '}
                <button
                  type="button"
                  onClick={() => setSearchParams({ mode: 'signup' })}
                  className="text-white hover:underline font-tech font-bold"
                >
                  Create your athlete profile
                </button>
              </p>
            </form>
          )}

          {/* ── STEP 1: SPORT, DISCIPLINE & ROLE ───────────────────────────────── */}
          {!isSignIn && step === 1 && (
            <div className="space-y-3.5">
              <div>
                <h2 className="text-base font-bold font-heading tracking-wider uppercase text-white mb-1">
                  Select Sport & Role
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Configures custom biomechanical demand weights and calibrated movement protocols.
                </p>
              </div>

              {/* Sport Selector */}
              <div>
                <label className="text-[10px] font-bold font-tech uppercase text-slate-400 tracking-wider block mb-1.5">
                  Primary Sport
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(sportsData).map((sportKey) => (
                    <button
                      key={sportKey}
                      type="button"
                      onClick={() => handleSportSelect(sportKey)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        profileData.sport === sportKey
                          ? 'bg-white/[0.1] border-white/40 text-white shadow-[0_2px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                        <SportIcon sport={sportKey} className="w-3.5 h-3.5 text-slate-200" />
                      </div>
                      <span className="text-xs font-bold font-tech capitalize truncate">
                        {sportsData[sportKey].name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Role Selector */}
              {Object.keys(currentRoles).length > 0 && (
                <div>
                  <label className="text-[10px] font-bold font-tech uppercase text-slate-400 tracking-wider block mb-1.5">
                    Tactical Role / Position
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                    {Object.keys(currentRoles).map((roleKey) => (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => handleRoleSelect(roleKey)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          profileData.primary_role === roleKey
                            ? 'bg-white/[0.1] border-white/40 text-white shadow-[0_2px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]'
                            : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold font-tech capitalize truncate">
                            {currentRoles[roleKey].title || roleKey.replace(/_/g, ' ')}
                          </p>
                          {profileData.primary_role === roleKey && (
                            <CheckIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {currentRoles[roleKey].description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Role Selector */}
              {Object.keys(currentSubRoles).length > 0 && (
                <div>
                  <label className="text-[10px] font-bold font-tech uppercase text-slate-400 tracking-wider block mb-1.5">
                    Specialist Sub-Role
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-0.5">
                    {Object.keys(currentSubRoles).map((subKey) => (
                      <button
                        key={subKey}
                        type="button"
                        onClick={() =>
                          setProfileData((prev) => ({ ...prev, sub_role: subKey }))
                        }
                        className={`p-2 rounded-xl border text-left transition-all ${
                          profileData.sub_role === subKey
                            ? 'bg-white/[0.1] border-white/40 text-white shadow-[0_2px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]'
                            : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold font-tech capitalize truncate">
                            {currentSubRoles[subKey].title || subKey.replace(/_/g, ' ')}
                          </span>
                          {profileData.sub_role === subKey && (
                            <CheckIcon className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {currentSubRoles[subKey].description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-11 btn-primary flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
              >
                <span>Next: Objectives</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── STEP 2: OBJECTIVES & GOALS ─────────────────────────────────────── */}
          {!isSignIn && step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold font-heading tracking-wider uppercase text-white mb-1">
                  Focus Objectives
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Select your primary physical and biomechanical development goals.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-0.5">
                {Object.keys(objectivesData).map((objKey) => {
                  const isSelected = profileData.development_objectives?.includes(objKey);
                  return (
                    <button
                      key={objKey}
                      type="button"
                      onClick={() => toggleObjective(objKey)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-white/[0.1] border-white/40 text-white shadow-[0_2px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold font-tech capitalize">
                          {objectivesData[objKey].title || objKey.replace(/_/g, ' ')}
                        </span>
                        {isSelected && <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                        {objectivesData[objKey].description}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 h-11 btn-secondary text-xs flex items-center justify-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-2/3 h-11 btn-primary flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                >
                  <span>Next: Biometrics</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: BIOMETRICS & TRAINING CONTEXT ──────────────────────────── */}
          {!isSignIn && step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold font-heading tracking-wider uppercase text-white mb-1">
                  Physical Biometrics
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Calibrates baseline force ratios, workload endurance limits, and injury-risk models.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="65"
                    value={profileData.age}
                    onChange={(e) =>
                      setProfileData({ ...profileData, age: e.target.value })
                    }
                    className="w-full h-11 px-2 sportify-input text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="240"
                    value={profileData.height_cm}
                    onChange={(e) =>
                      setProfileData({ ...profileData, height_cm: e.target.value })
                    }
                    className="w-full h-11 px-2 sportify-input text-xs font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={profileData.weight_kg}
                    onChange={(e) =>
                      setProfileData({ ...profileData, weight_kg: e.target.value })
                    }
                    className="w-full h-11 px-2 sportify-input text-xs font-mono text-center"
                  />
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1.5">
                  Competitive Tier
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['beginner', 'intermediate', 'advanced', 'elite'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() =>
                        setProfileData({ ...profileData, experience_level: lvl })
                      }
                      className={`h-9 rounded-xl border text-[11px] font-bold capitalize flex items-center justify-center transition-all ${
                        profileData.experience_level === lvl
                          ? 'bg-white/[0.1] border-white/40 text-white shadow-[0_2px_12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {lvl.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 h-11 btn-secondary text-xs flex items-center justify-center"
                >
                  Back
                </button>

                {isCompleteProfile ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleProfileSubmit}
                    className={`w-2/3 h-11 btn-primary flex items-center justify-center gap-2 uppercase tracking-wider text-xs ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                    {!loading && <ArrowRightIcon className="w-3.5 h-3.5" />}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="w-2/3 h-11 btn-primary flex items-center justify-center gap-2 uppercase tracking-wider text-xs"
                  >
                    <span>Next: Account</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 4: ACCOUNT CREATION (SIGNUP ONLY) ───────────────────────── */}
          {!isSignIn && !isCompleteProfile && step === 4 && (
            <form onSubmit={handleProfileSubmit} className="space-y-3.5">
              <div>
                <h2 className="text-base font-bold font-heading tracking-wider uppercase text-white mb-1">
                  Create Athlete Account
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Your profile, movement assessments, and training pathways sync securely across devices.
                </p>
              </div>

              <div>
                <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cristiano Ronaldo"
                  value={authData.full_name}
                  onChange={(e) =>
                    setAuthData({ ...authData, full_name: e.target.value })
                  }
                  className="w-full h-11 px-3.5 sportify-input text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="athlete@sportify.com"
                  value={authData.email}
                  onChange={(e) =>
                    setAuthData({ ...authData, email: e.target.value })
                  }
                  className="w-full h-11 px-3.5 sportify-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authData.password}
                  onChange={(e) =>
                    setAuthData({ ...authData, password: e.target.value })
                  }
                  className="w-full h-11 px-3.5 sportify-input text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-1/3 h-11 btn-secondary text-xs flex items-center justify-center"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-2/3 h-11 btn-primary flex items-center justify-center gap-2 uppercase tracking-wider text-xs ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{loading ? 'Creating...' : 'Launch Studio'}</span>
                  {!loading && <ArrowRightIcon className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
