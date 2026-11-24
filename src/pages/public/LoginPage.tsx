import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { WebsiteUser } from '../../types/fitcore';

type LoginTab = 'user' | 'member' | 'admin';
type UserAuthMode = 'signin' | 'register';

export function LoginPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = ((): LoginTab => {
    const t = searchParams.get('tab');
    if (t === 'member' || t === 'admin' || t === 'user') return t;
    return 'user';
  })();

  const [tab, setTab] = useState<LoginTab>(initialTab);
  const [userMode, setUserMode] = useState<UserAuthMode>(
    searchParams.get('mode') === 'register' ? 'register' : 'signin'
  );

  // Sign-in credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // General Website User Registration fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('24');
  const [gender, setGender] = useState<WebsiteUser['gender']>('Male');
  const [regPassword, setRegPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const {
    role,
    websiteUser,
    loading,
    authError,
    clearAuthError,
    loginUserWithEmail,
    registerUserWithEmail,
    loginUserWithGoogle,
    loginMemberWithEmail,
    loginAdminWithEmail,
    loginAdminWithGoogle,
    resetPassword,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab === 'member' || urlTab === 'admin' || urlTab === 'user') {
      setTab(urlTab);
    }
    if (searchParams.get('mode') === 'register') {
      setUserMode('register');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (!loading && role === 'member') {
      navigate('/member', { replace: true });
    }
  }, [loading, role, navigate]);

  const handleTabSwitch = (next: LoginTab) => {
    setTab(next);
    setSearchParams(next === 'user' ? {} : { tab: next });
    clearAuthError();
    setResetMessage(null);
    setResetError(null);
    setEmail('');
    setPassword('');
  };

  const handleUserModeSwitch = (nextMode: UserAuthMode) => {
    setUserMode(nextMode);
    clearAuthError();
    setResetMessage(null);
    setResetError(null);
  };

  const handlePasswordReset = async () => {
    clearAuthError();
    setResetMessage(null);
    setResetError(null);
    try {
      await resetPassword(email);
      setResetMessage(
        `Password reset email sent to ${email.trim()}. Check your inbox to set a new password.`
      );
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Unable to send reset email.');
    }
  };

  const handleUserRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);
    if (regPassword.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const ok = await registerUserWithEmail({
        fullName,
        email: regEmail,
        phone,
        age: Number(age) || 24,
        gender,
        password: regPassword,
      });
      if (ok) {
        navigate('/account');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);
    setSubmitting(true);
    try {
      if (tab === 'user') {
        const ok = await loginUserWithEmail(email, password);
        if (ok) navigate('/account');
      } else if (tab === 'member') {
        const ok = await loginMemberWithEmail(email, password);
        if (ok) navigate('/member');
      } else {
        const ok = await loginAdminWithEmail(email, password);
        if (ok) navigate('/admin');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setResetError(null);
    setResetMessage(null);
    setSubmitting(true);
    try {
      if (tab === 'user') {
        const ok = await loginUserWithGoogle();
        if (ok) navigate('/account');
      } else if (tab === 'admin') {
        const ok = await loginAdminWithGoogle();
        if (ok) navigate('/admin');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#111111] text-white min-h-[82vh] flex items-center justify-center py-14 px-4">
      <div className="w-full max-w-lg bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden">
        {/* 3 Distinct Login Portals */}
        <div className="grid grid-cols-3 border-b border-white/10">
          <button
            type="button"
            onClick={() => handleTabSwitch('user')}
            className={`py-4 px-3 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors ${
              tab === 'user'
                ? 'bg-[#E51C2A] text-white'
                : 'bg-[#161616] text-[#858585] hover:text-white'
            }`}
          >
            <User className="h-4 w-4 shrink-0" />
            <span>User Login</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('member')}
            className={`py-4 px-3 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors border-x border-white/10 ${
              tab === 'member'
                ? 'bg-[#E51C2A] text-white'
                : 'bg-[#161616] text-[#858585] hover:text-white'
            }`}
          >
            <UserCheck className="h-4 w-4 shrink-0" />
            <span>Member Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('admin')}
            className={`py-4 px-3 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold transition-colors ${
              tab === 'admin'
                ? 'bg-[#E51C2A] text-white'
                : 'bg-[#161616] text-[#858585] hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Admin Login</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-display text-3xl font-extrabold text-white">
              {tab === 'user'
                ? userMode === 'register'
                  ? 'Create Website Account'
                  : 'Website User Sign In'
                : tab === 'member'
                ? 'Member Portal Sign In'
                : 'Admin Dashboard Sign In'}
            </h1>
            <p className="text-sm text-[#858585] mt-1">
              {tab === 'user'
                ? userMode === 'register'
                  ? 'Register a general FitCore website account. Approved immediately — no admin approval required.'
                  : 'Sign in with your general website account using Google or Email & Password.'
                : tab === 'member'
                ? 'Enter the Member Email and Password issued to you by FitCore Administration.'
                : 'Restricted to authorized FitCore administrators only.'}
            </p>
          </div>

          {/* Notice if a General User is signed in and opens Member Portal */}
          {tab === 'member' && role === 'user' && websiteUser && (
            <div className="p-3.5 bg-[#111111] border border-white/15 rounded text-xs text-white/90 leading-relaxed flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">
                  Signed in as General User ({websiteUser.email})
                </p>
                <p className="text-[#858585] mt-0.5">
                  General website accounts are separate from the Gym Member Portal. Enter your
                  Admin-issued Member credentials below to open your Member Portal.
                </p>
              </div>
              <Link
                to="/account"
                className="shrink-0 text-xs font-semibold text-[#E51C2A] hover:underline"
              >
                My Account
              </Link>
            </div>
          )}

          {/* Already signed in as User on User tab */}
          {tab === 'user' && role === 'user' && websiteUser && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Signed in as <strong>{websiteUser.fullName}</strong> ({websiteUser.email})
                </span>
              </div>
              <Link
                to="/account"
                className="px-3 py-1.5 bg-[#E51C2A] text-white font-semibold rounded shrink-0"
              >
                Open Account
              </Link>
            </div>
          )}

          {(authError || resetError) && (
            <div className="p-3.5 bg-[#E51C2A]/15 border border-[#E51C2A]/50 rounded text-xs sm:text-sm text-white leading-relaxed">
              {authError || resetError}
            </div>
          )}

          {resetMessage && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded text-xs sm:text-sm text-emerald-300 leading-relaxed">
              {resetMessage}
            </div>
          )}

          {/* TAB 1: GENERAL WEBSITE USER (Sign In + Self Registration) */}
          {tab === 'user' && (
            <>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#111111] rounded border border-white/10">
                <button
                  type="button"
                  onClick={() => handleUserModeSwitch('signin')}
                  className={`py-2 text-xs font-semibold rounded transition-colors ${
                    userMode === 'signin'
                      ? 'bg-[#1B1B1B] text-white border border-white/15'
                      : 'text-[#858585] hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleUserModeSwitch('register')}
                  className={`py-2 text-xs font-semibold rounded transition-colors inline-flex items-center justify-center gap-1.5 ${
                    userMode === 'register'
                      ? 'bg-[#1B1B1B] text-white border border-white/15'
                      : 'text-[#858585] hover:text-white'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Register New Account</span>
                </button>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 bg-white hover:bg-[#F5F5F5] text-[#111111] text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                <span>Continue with Google (Website User)</span>
              </button>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/10" />
                <span className="shrink mx-3 text-xs text-[#858585]">
                  {userMode === 'register' ? 'or register with email' : 'or sign in with email'}
                </span>
                <div className="flex-grow border-t border-white/10" />
              </div>

              {userMode === 'register' ? (
                <form onSubmit={handleUserRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#858585] mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Hamza Tariq"
                      className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#858585] mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#858585] mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+92 300 1234567"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#858585] mb-1.5">Age</label>
                      <input
                        type="number"
                        min={12}
                        max={110}
                        required
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white tabular-nums focus:outline-none focus:border-[#E51C2A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#858585] mb-1.5">
                        Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as WebsiteUser['gender'])}
                        className="w-full px-3.5 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                      >
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#858585] mb-1.5">
                      Create Password (min. 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Create your password"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors"
                  >
                    {submitting ? 'Creating Account...' : 'Register & Activate Account'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEmailSignInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#858585] mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-[#858585]">Password</label>
                      <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-xs text-[#E51C2A] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors"
                  >
                    {submitting ? 'Signing In...' : 'Sign In to Website Account'}
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-white/10 text-center space-y-1">
                <p className="text-xs text-[#858585]">
                  Already a registered Gym Member with Admin-issued credentials?
                </p>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('member')}
                  className="text-xs font-semibold text-[#E51C2A] hover:underline"
                >
                  Go to Member Portal Login →
                </button>
              </div>
            </>
          )}

          {/* TAB 2: MEMBER PORTAL (EMAIL + PASSWORD ISSUED BY ADMIN ONLY) */}
          {tab === 'member' && (
            <>
              <form onSubmit={handleEmailSignInSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#858585] mb-1.5">
                    Member Email (Provided by Admin)
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="member@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[#858585]">
                      Member Password
                    </label>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-xs text-[#E51C2A] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Admin-issued password"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors"
                >
                  {submitting ? 'Opening Member Portal...' : 'Sign In to Member Portal'}
                </button>
              </form>

              <div className="pt-4 border-t border-white/10 text-center space-y-2">
                <p className="text-xs text-[#858585] leading-relaxed">
                  Gym Member Portal accounts are created exclusively by FitCore Administration when
                  you join at the facility. Self-registration is disabled for Member Portal access.
                </p>
                <Link
                  to="/contact"
                  className="inline-block text-xs font-semibold text-[#E51C2A] hover:underline"
                >
                  Visit FitCore or Contact Reception →
                </Link>
              </div>
            </>
          )}

          {/* TAB 3: ADMIN LOGIN */}
          {tab === 'admin' && (
            <>
              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 bg-white hover:bg-[#F5F5F5] text-[#111111] text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                <span>Sign in with Google (Admin)</span>
              </button>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/10" />
                <span className="shrink mx-3 text-xs text-[#858585]">or use credentials</span>
                <div className="flex-grow border-t border-white/10" />
              </div>

              <form onSubmit={handleEmailSignInSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#858585] mb-1.5">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@fitcore.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-[#858585]">Password</label>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-xs text-[#E51C2A] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors"
                >
                  {submitting ? 'Signing In...' : 'Login as Admin'}
                </button>
              </form>

              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-[#858585]">
                  Admin accounts cannot be created via public registration. Sign in using an
                  authorized administrator account.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
