import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  UserCheck,
  CalendarClock,
  ClipboardCheck,
  TrendingUp,
  Dumbbell,
  Receipt,
  Bell,
  Globe,
  Inbox,
  LogOut,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import { BrandMark } from '../components/common/BrandMark';
import { useAuth } from '../context/AuthContext';

export type AdminSectionKey =
  | 'overview'
  | 'members'
  | 'memberships'
  | 'trainers'
  | 'schedules'
  | 'attendance'
  | 'progress'
  | 'workouts'
  | 'payments'
  | 'notifications'
  | 'content'
  | 'inquiries';

interface AdminLayoutProps {
  activeSection: AdminSectionKey;
  onSelectSection: (section: AdminSectionKey) => void;
  newInquiriesCount: number;
  children: React.ReactNode;
}

const ADMIN_SECTIONS: {
  key: AdminSectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
  { key: 'members', label: 'Members Management', icon: Users },
  { key: 'memberships', label: 'Membership Management', icon: CreditCard },
  { key: 'trainers', label: 'Trainer Management', icon: UserCheck },
  { key: 'schedules', label: 'Schedule Management', icon: CalendarClock },
  { key: 'attendance', label: 'Attendance Management', icon: ClipboardCheck },
  { key: 'progress', label: 'Progress Management', icon: TrendingUp },
  { key: 'workouts', label: 'Workout Plans', icon: Dumbbell },
  { key: 'payments', label: 'Payment Management', icon: Receipt },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'content', label: 'Website Content', icon: Globe },
  { key: 'inquiries', label: 'Inquiry Management', icon: Inbox },
];

export function AdminLayout({
  activeSection,
  onSelectSection,
  newInquiriesCount,
  children,
}: AdminLayoutProps) {
  const { firebaseUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-68 lg:flex-col bg-[#161616] border-r border-white/10 shrink-0">
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <button type="button" onClick={() => onSelectSection('overview')}>
            <BrandMark />
          </button>
          <span className="text-xs font-mono text-[#E51C2A] font-semibold">ADMIN</span>
        </div>

        <nav className="p-3 flex-1 space-y-0.5 overflow-y-auto" aria-label="Admin navigation">
          {ADMIN_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const active = activeSection === sec.key;
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => onSelectSection(sec.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#E51C2A] text-white'
                    : 'text-[#858585] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{sec.label}</span>
                </span>
                {sec.key === 'inquiries' && newInquiriesCount > 0 && (
                  <span className="text-xs font-mono tabular-nums font-semibold shrink-0 ml-2">
                    {newInquiriesCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-[#858585] hover:text-white rounded hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>View Public Website</span>
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

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/75" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 max-w-full bg-[#161616] border-r border-white/10 flex flex-col z-10">
            <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
              <BrandMark />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-[#858585] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-3 flex-1 space-y-0.5 overflow-y-auto">
              {ADMIN_SECTIONS.map((sec) => {
                const Icon = sec.icon;
                return (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => {
                      onSelectSection(sec.key);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-sm font-medium ${
                      activeSection === sec.key ? 'bg-[#E51C2A] text-white' : 'text-[#858585]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{sec.label}</span>
                    </span>
                    {sec.key === 'inquiries' && newInquiriesCount > 0 && (
                      <span className="text-xs font-mono tabular-nums">{newInquiriesCount}</span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10 space-y-2">
              <Link to="/" className="flex items-center gap-2 px-3 py-2 text-xs text-[#858585]">
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

      {/* Main Viewport */}
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
              <p className="text-xs text-[#858585]">FitCore Management System</p>
              <h1 className="font-display text-xl font-bold text-white truncate">
                {ADMIN_SECTIONS.find((s) => s.key === activeSection)?.label}
              </h1>
            </div>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-xs text-[#858585]">Authorized Administrator</p>
            <p className="text-sm font-medium text-white truncate max-w-[220px]">
              {firebaseUser?.email}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
