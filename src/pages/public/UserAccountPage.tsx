import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CheckCircle2, LogOut, ShieldCheck, User, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { WebsiteUser } from '../../types/fitcore';

export function UserAccountPage() {
  const { role, websiteUser, loading, updateWebsiteUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('24');
  const [gender, setGender] = useState<WebsiteUser['gender']>('Male');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (websiteUser) {
      setFullName(websiteUser.fullName);
      setPhone(websiteUser.phone);
      setAge(String(websiteUser.age));
      setGender(websiteUser.gender);
    }
  }, [websiteUser]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#111111] text-white flex items-center justify-center">
        <p className="text-sm text-[#858585]">Loading Account...</p>
      </div>
    );
  }

  if (role === 'member') return <Navigate to="/member" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role !== 'user' || !websiteUser) return <Navigate to="/login" replace />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    setErrorMsg(null);
    try {
      await updateWebsiteUserProfile({
        fullName,
        phone,
        age: Math.max(12, Math.min(110, Number(age) || 24)),
        gender,
      });
      setSavedMsg('Website account profile updated.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#111111] text-white min-h-[75vh] py-14 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#E51C2A]/15 border border-[#E51C2A]/40 flex items-center justify-center text-[#E51C2A]">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#E51C2A]">
                General Website Account
              </p>
              <h1 className="font-display text-3xl font-extrabold text-white">
                {websiteUser.fullName}
              </h1>
              <p className="text-xs text-[#858585]">{websiteUser.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/login?tab=member"
              className="px-4 py-2 bg-[#111111] hover:bg-white/10 border border-white/15 text-xs font-semibold rounded inline-flex items-center gap-1.5"
            >
              <UserCheck className="h-4 w-4 text-[#E51C2A]" />
              <span>Member Portal Login</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="px-4 py-2 bg-[#E51C2A] hover:bg-[#c81622] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 sm:p-8 space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h2 className="font-display text-2xl font-bold text-white">Profile Details</h2>
            <p className="text-xs text-[#858585]">
              Your general FitCore website visitor profile. Separate from Gym Member Portal records.
            </p>
          </div>

          {savedMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{savedMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="p-3 bg-[#E51C2A]/15 border border-[#E51C2A]/50 rounded text-xs text-white">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#858585] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/15 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#858585] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/15 rounded text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#858585] mb-1">Age</label>
                <input
                  type="number"
                  min={12}
                  max={110}
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/15 rounded text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-[#858585] mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as WebsiteUser['gender'])}
                  className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/15 rounded text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#E51C2A] hover:bg-[#c81622] text-white text-sm font-semibold rounded"
            >
              {saving ? 'Saving...' : 'Save Account Details'}
            </button>
          </form>
        </div>

        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-5 flex items-start gap-3 text-xs text-[#858585]">
          <ShieldCheck className="h-5 w-5 text-[#E51C2A] shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold mb-0.5">Looking for the Gym Member Portal?</p>
            <p className="leading-relaxed">
              Gym Member Portal accounts are provisioned in person by FitCore Administration. Once
              you receive your Member Email and Password from our admin desk,{' '}
              <Link to="/login?tab=member" className="text-[#E51C2A] hover:underline font-semibold">
                sign into the Member Portal here
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
