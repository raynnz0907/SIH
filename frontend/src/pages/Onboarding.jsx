import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAthleteStore } from '../store/athleteStore';
import { intakeAPI, formatErrorMessage } from '../api/client';
import SportifyLogo from '../components/common/SportifyLogo';
import { normalizeSport } from '../config/sportAssessmentConfig';
import {
  CricketIcon,
  FootballIcon,
  BasketballIcon,
  AthleticsIcon,
  CheckIcon,
  ArrowRightIcon,
  SlidersIcon,
  TargetIcon,
  DumbbellIcon,
} from '../components/common/Icons';

export default function Onboarding() {
  const navigate = useNavigate();

  const setProfile = useAthleteStore((state) => state.setProfile);
  const storedProfile = useAthleteStore((state) => state.profile);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Taxonomy & Objectives from backend
  const [sportsData, setSportsData] = useState({});
  const [objectivesData, setObjectivesData] = useState([]);

  const [profileData, setProfileData] = useState({
    sport: storedProfile?.sport || 'cricket',
    discipline: storedProfile?.discipline || '',
    primary_role: storedProfile?.primary_role || 'batsman',
    sub_role: storedProfile?.sub_role || 'opening_batsman',
    development_objectives: storedProfile?.development_objectives || ['explosiveness'],
    experience_level: storedProfile?.experience_level || 'intermediate',
    training_days_per_week: storedProfile?.training_days_per_week || 4,
    session_duration_minutes: storedProfile?.session_duration_minutes || 60,
    age: storedProfile?.age || 21,
    weight_kg: storedProfile?.weight_kg || 72,
    height_cm: storedProfile?.height_cm || 178,
  });

  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const [sports, objs] = await Promise.all([
          intakeAPI.getSports().catch(() => ({})),
          intakeAPI.getObjectives().catch(() => []),
        ]);
        setSportsData(sports);
        setObjectivesData(Array.isArray(objs) ? objs : objs?.objectives || []);

        if (sports && sports['cricket'] && !storedProfile) {
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
  }, [storedProfile]);

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
   * Completes calibration, persists profile locally, and routes directly to the assessment studio.
   * Zero account creation, zero email/password required!
   */
  const handleProfileSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
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
      };

      // Persist in local store
      setProfile(payload);

      // Submit to backend if available (non-blocking)
      intakeAPI.submitProfile(payload).catch((err) => {
        console.warn('Backend intake submit deferred:', err?.message);
      });

      const targetSport = normalizeSport(profileData.sport);
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
          <Link to="/">
            <SportifyLogo size="xs" showTagline={false} />
          </Link>
          <Link
            to="/dashboard"
            className="text-[11px] font-medium text-slate-300 hover:text-white font-tech tracking-wide px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all flex items-center gap-1.5"
          >
            <span>Skip to Dashboard</span>
            <ArrowRightIcon className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {/* Main Multi-Step Box */}
        <div className="w-full sportify-card p-4 sm:p-6 border border-white/[0.1] shadow-2xl relative flex-1 flex flex-col justify-between my-2">
          {/* Step Progress Bar (3 steps: Sport, Objectives, Biometrics) */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
            {[
              { num: 1, label: 'Sport' },
              { num: 2, label: 'Objectives' },
              { num: 3, label: 'Biometrics' },
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

          {/* Error Notification */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs mb-3 flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: SPORT & ROLE SELECTION ──────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold font-heading tracking-wider uppercase text-white mb-1">
                  Select Sport & Role
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Choose your sport and tactical playing position to calibrate role-specific benchmarks.
                </p>
              </div>

              {/* Sport Selector */}
              <div>
                <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1.5">
                  Sport
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'cricket', label: 'Cricket', icon: CricketIcon },
                    { id: 'football', label: 'Football', icon: FootballIcon },
                    { id: 'basketball', label: 'Basketball', icon: BasketballIcon },
                    { id: 'athletics', label: 'Athletics', icon: AthleticsIcon },
                  ].map((s) => {
                    const Icon = s.icon;
                    const isSelected = profileData.sport === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSportSelect(s.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center ${
                          isSelected
                            ? 'bg-white/[0.08] border-white/30 text-white shadow-[0_2px_12px_rgba(0,0,0,0.6)]'
                            : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        <span className="text-[11px] font-bold font-tech tracking-tight">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Position / Role Selector */}
              {Object.keys(currentRoles).length > 0 && (
                <div>
                  <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1.5">
                    Primary Position
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {Object.keys(currentRoles).map((rKey) => {
                      const rObj = currentRoles[rKey];
                      const isSelected = profileData.primary_role === rKey;
                      return (
                        <button
                          key={rKey}
                          type="button"
                          onClick={() => handleRoleSelect(rKey)}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-white/[0.08] border-white/30 text-white'
                              : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold font-sans truncate">{rObj.name || rKey}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-Role / Tactical Specialty */}
              {Object.keys(currentSubRoles).length > 0 && (
                <div>
                  <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1.5">
                    Tactical Specialty / Sub-Role
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.keys(currentSubRoles).map((srKey) => {
                      const srObj = currentSubRoles[srKey];
                      const isSelected = profileData.sub_role === srKey;
                      return (
                        <button
                          key={srKey}
                          type="button"
                          onClick={() => setProfileData({ ...profileData, sub_role: srKey })}
                          className={`p-2 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-white/[0.08] border-white/30 text-white'
                              : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold font-sans truncate">
                            {srObj.name || srKey.replace(/_/g, ' ')}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-11 btn-primary text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
              >
                <span>Next: Objectives</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── STEP 2: OBJECTIVES ──────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold font-heading tracking-wider uppercase text-white mb-1">
                  Development Objectives
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Select key physical and tactical qualities you want the pathway to prioritize.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'explosiveness', name: 'Explosive Power', desc: 'Vertical impulse, acceleration, and force rate' },
                  { id: 'deceleration', name: 'Deceleration & Landing Control', desc: 'Eccentric knee absorption and landing stability' },
                  { id: 'rotational_power', name: 'Rotational Velocity', desc: 'Torso torque, kinetic whip, and core sequencing' },
                  { id: 'joint_stability', name: 'Joint Stability & Prehab', desc: 'Knee valgus resistance, ankle stiffness, and shoulder health' },
                  { id: 'first_step', name: 'First-Step Quickness', desc: 'Lateral change-of-direction and reactive takeoff' },
                ].map((obj) => {
                  const isChecked = profileData.development_objectives?.includes(obj.id);
                  return (
                    <div
                      key={obj.id}
                      onClick={() => toggleObjective(obj.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-white/[0.07] border-white/25 text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                          isChecked
                            ? 'bg-white text-slate-950'
                            : 'border border-white/20 bg-white/[0.02]'
                        }`}
                      >
                        {isChecked && <CheckIcon className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white font-sans">{obj.name}</div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">{obj.desc}</div>
                      </div>
                    </div>
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
                  className="w-2/3 h-11 btn-primary text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>Next: Biometrics</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: BIOMETRICS & TIER ────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold font-heading tracking-wider uppercase text-white mb-1">
                  Biometrics & Tier
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Helps calibrate kinetic power benchmarks and volume loading.
                </p>
              </div>

              {/* Age, Height, Weight */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="65"
                    value={profileData.age}
                    onChange={(e) =>
                      setProfileData({ ...profileData, age: e.target.value })
                    }
                    className="w-full h-11 px-2 sportify-input text-xs font-mono text-center rounded-xl bg-white/[0.04] border border-white/10 text-white"
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
                    className="w-full h-11 px-2 sportify-input text-xs font-mono text-center rounded-xl bg-white/[0.04] border border-white/10 text-white"
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
                    className="w-full h-11 px-2 sportify-input text-xs font-mono text-center rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Competitive Tier */}
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
                          ? 'bg-white/[0.1] border-white/40 text-white shadow-[0_2px_12px_rgba(0,0,0,0.6)]'
                          : 'bg-white/[0.02] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Training Availability */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                    Days / Week
                  </label>
                  <select
                    value={profileData.training_days_per_week}
                    onChange={(e) =>
                      setProfileData({ ...profileData, training_days_per_week: Number(e.target.value) })
                    }
                    className="w-full h-11 px-3 sportify-input text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                  >
                    {[2, 3, 4, 5, 6].map((d) => (
                      <option key={d} value={d} className="bg-[#0C0E14] text-white">
                        {d} Days
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold font-tech uppercase text-slate-400 block mb-1">
                    Session Duration
                  </label>
                  <select
                    value={profileData.session_duration_minutes}
                    onChange={(e) =>
                      setProfileData({ ...profileData, session_duration_minutes: Number(e.target.value) })
                    }
                    className="w-full h-11 px-3 sportify-input text-xs rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                  >
                    {[30, 45, 60, 75, 90].map((m) => (
                      <option key={m} value={m} className="bg-[#0C0E14] text-white">
                        {m} Mins
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 h-11 btn-secondary text-xs flex items-center justify-center"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleProfileSubmit}
                  className={`w-2/3 h-11 btn-primary flex items-center justify-center gap-2 uppercase tracking-wider text-xs shadow-[0_4px_20px_rgba(255,255,255,0.2)] ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{loading ? 'Configuring...' : 'Launch Studio'}</span>
                  {!loading && <ArrowRightIcon className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
