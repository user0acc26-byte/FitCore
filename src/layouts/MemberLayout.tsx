import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  CreditCard,
  TrendingUp,
  Bell,
  Dumbbell,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { BrandMark } from '../components/common/BrandMark';
import { useAuth } from '../context/AuthContext';

export type MemberTabKey =
  | 'overview'
  | 'profile'
  | 'memberships'
  | 'progress'
  | 'notifications'
  | 'workouts';

interface MemberLayoutProps {
  activeTab: MemberTabKey;
  onSelectTab: (tab: MemberTabKey) => void;
  unreadNotificationsCount: number;
  children: React.ReactNode;
}

const MEMBER_TABS: { key: MemberTabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'profile', label: 'My Profile', icon: User },
  { key: 'memberships', label: 'My Memberships', icon: CreditCard },
  { key: 'progress', label: 'My Progress', icon: TrendingUp },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'workouts', label: 'Workout Plans', icon: Dumbbell },
];

export function MemberLayout({
  activeTab,
  onSelectTab,
  unreadNotificationsCount,
  children,
}: MemberLayoutProps) {
  const { memberProfile, logout, changeMemberPassword } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwSaving(true);
    try {
      await changeMemberPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col bg-[#161616] border-r border-white/10 shrink-0">
        <div className="h-16 px-6 flex items-center border-b border-white/10">
          <button type="button" onClick={() => onSelectTab('overview')} className="text-left">
            <BrandMark />
          </button>
        </div>

        <div className="p-4 flex-1 space-y-1">
          <button
            type="button"
            onClick={() => onSelectTab('overview')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#E51C2A] text-white'
                : 'text-[#858585] hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Member Overview</span>
          </button>

          <div className="pt-3 pb-1 px-3.5 text-xs font-medium text-[#858585]">
            Member Portal
          </div>

          {MEMBER_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onSelectTab(tab.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#E51C2A] text-white'
                    : 'text-[#858585] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </span>
                {tab.key === 'notifications' && unreadNotificationsCount > 0 && (
                  <span className="text-xs font-mono tabular-nums font-semibold">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#858585] hover:text-white rounded hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Public Website</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#E51C2A] hover:bg-[#E51C2A]/10 rounded transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-full bg-[#161616] border-r border-white/10 flex flex-col z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
              <BrandMark />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-[#858585] hover:text-white"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 flex-1 space-y-1">
              <button
                type="button"
                onClick={() => {
                  onSelectTab('overview');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-3.5 py-2.5 rounded text-sm font-medium ${
                  activeTab === 'overview' ? 'bg-[#E51C2A] text-white' : 'text-[#858585]'
                }`}
              >
                Member Overview
              </button>
              {MEMBER_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      onSelectTab(tab.key);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium ${
                      activeTab === tab.key ? 'bg-[#E51C2A] text-white' : 'text-[#858585]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </span>
                    {tab.key === 'notifications' && unreadNotificationsCount > 0 && (
                      <span className="text-xs font-mono tabular-nums">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-white/10 space-y-2">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-xs text-[#858585] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Public Website</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#E51C2A]"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#111111] border-b border-white/10 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="truncate">
              <p className="text-xs text-[#858585]">FitCore Member Portal</p>
              <h1 className="font-display text-xl font-bold text-white truncate">
                {activeTab === 'overview'
                  ? 'Dashboard Overview'
                  : MEMBER_TABS.find((t) => t.key === activeTab)?.label}
              </h1>
            </div>
          </div>

          {memberProfile && (
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-white">
                {memberProfile.firstName} {memberProfile.lastName}
              </p>
              <p className="text-xs font-mono text-[#858585] tabular-nums">
                {memberProfile.memberCode}
              </p>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
          {memberProfile?.mustChangePassword && (
            <div className="mb-6 bg-[#1B1B1B] border border-[#E51C2A]/40 rounded-lg p-5">
              <div className="flex items-start gap-3 mb-4">
                <KeyRound className="h-5 w-5 text-[#E51C2A] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    Security Check: Update Your Temporary Password
                  </h2>
                  <p className="text-xs text-[#858585]">
                    Please replace the temporary password assigned at registration with your own
                    personal password.
                  </p>
                </div>
              </div>
              {pwError && <p className="text-xs text-[#E51C2A] mb-3">{pwError}</p>}
              <form
                onSubmit={handlePasswordChange}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                />
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="px-4 py-2 bg-[#E51C2A] hover:bg-[#c81622] text-white text-sm font-semibold rounded transition-colors"
                >
                  {pwSaving ? 'Updating...' : 'Save New Password'}
                </button>
              </form>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
