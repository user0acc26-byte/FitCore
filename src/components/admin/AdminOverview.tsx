import {
  Users,
  UserCheck,
  AlertCircle,
  Inbox,
  Dumbbell,
  CalendarClock,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { formatPKR } from '../../lib/currency';
import type {
  Inquiry,
  Member,
  MemberSubscription,
  PaymentRecord,
  Trainer,
  TrainingSchedule,
} from '../../types/fitcore';
import type { AdminSectionKey } from '../../layouts/AdminLayout';

interface AdminOverviewProps {
  members: Member[];
  subscriptions: MemberSubscription[];
  trainers: Trainer[];
  schedules: TrainingSchedule[];
  payments: PaymentRecord[];
  inquiries: Inquiry[];
  hasCatalog: boolean;
  seeding: boolean;
  onSeedStarter: () => void;
  onNavigate: (sec: AdminSectionKey) => void;
}

export function AdminOverview({
  members,
  subscriptions,
  trainers,
  schedules,
  payments,
  inquiries,
  hasCatalog,
  seeding,
  onSeedStarter,
  onNavigate,
}: AdminOverviewProps) {
  const activeMembers = members.filter((m) => m.status === 'active').length;
  const expiredMemberships = subscriptions.filter((s) => s.status === 'expired').length;
  const pendingRegistrations = inquiries.filter(
    (i) => i.type === 'membership_registration' && i.status === 'new'
  ).length;
  const paidTotal = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const unpaidTotal = payments
    .filter((p) => p.status === 'unpaid')
    .reduce((sum, p) => sum + p.amount, 0);

  const cards = [
    {
      label: 'Total Members',
      value: members.length,
      sub: `${activeMembers} Active`,
      icon: Users,
      section: 'members' as AdminSectionKey,
    },
    {
      label: 'Expired Memberships',
      value: expiredMemberships,
      sub: `${subscriptions.filter((s) => s.status === 'active').length} Active Subs`,
      icon: AlertCircle,
      section: 'memberships' as AdminSectionKey,
    },
    {
      label: 'Pending Registrations',
      value: pendingRegistrations,
      sub: `${inquiries.filter((i) => i.status === 'new').length} Total New Inquiries`,
      icon: Inbox,
      section: 'inquiries' as AdminSectionKey,
    },
    {
      label: 'Total Trainers',
      value: trainers.length,
      sub: `${trainers.filter((t) => t.status === 'active').length} Active Coaches`,
      icon: UserCheck,
      section: 'trainers' as AdminSectionKey,
    },
    {
      label: 'Training Schedules',
      value: schedules.length,
      sub: 'Assigned Member Sessions',
      icon: CalendarClock,
      section: 'schedules' as AdminSectionKey,
    },
    {
      label: 'Paid Revenue',
      value: formatPKR(paidTotal),
      sub: `${formatPKR(unpaidTotal)} Unpaid Due`,
      icon: Receipt,
      section: 'payments' as AdminSectionKey,
    },
  ];

  return (
    <div className="space-y-6">
      {!hasCatalog && (
        <div className="bg-[#1B1B1B] border border-[#E51C2A]/50 rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-[#E51C2A] shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-2xl font-bold text-white">
                Initialize FitCore Gym Catalog
              </h2>
              <p className="text-sm text-[#858585]">
                Your public website database has no starter facilities, membership plans, classes,
                trainers, or shop items yet. Populate starter editable gym content in one click.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={seeding}
            onClick={onSeedStarter}
            className="px-5 py-2.5 bg-[#E51C2A] hover:bg-[#c81622] text-white text-sm font-semibold rounded transition-colors whitespace-nowrap shrink-0"
          >
            {seeding ? 'Populating...' : 'Populate Starter Catalog'}
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => onNavigate(c.section)}
              className="text-left bg-[#1B1B1B] border border-white/10 hover:border-[#E51C2A] rounded-lg p-6 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#858585]">{c.label}</span>
                <Icon className="h-5 w-5 text-[#E51C2A]" />
              </div>
              <p className="font-display text-4xl font-extrabold text-white tabular-nums">
                {c.value}
              </p>
              <p className="text-xs text-[#858585] mt-1 font-mono tabular-nums">{c.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Recent Inquiries & Upcoming Training Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-white">Recent Inquiries</h2>
            <button
              type="button"
              onClick={() => onNavigate('inquiries')}
              className="text-xs font-semibold text-[#E51C2A] hover:underline"
            >
              Manage All
            </button>
          </div>
          {inquiries.length === 0 ? (
            <p className="text-sm text-[#858585] py-6 text-center">No inquiries received yet.</p>
          ) : (
            <div className="space-y-3">
              {inquiries.slice(0, 5).map((inq) => (
                <div
                  key={inq.id}
                  className="p-3.5 bg-[#111111] border border-white/10 rounded flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{inq.name}</p>
                    <p className="text-xs text-[#858585] truncate">
                      {inq.type === 'membership_registration'
                        ? `Registration: ${inq.requestedPlanName || 'Membership'}`
                        : 'Contact Inquiry'}{' '}
                      · {inq.email}
                    </p>
                  </div>
                  <span className="text-xs font-mono uppercase text-[#E51C2A] shrink-0">
                    {inq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold text-white">
              Active Training Sessions
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('schedules')}
              className="text-xs font-semibold text-[#E51C2A] hover:underline"
            >
              Manage Schedules
            </button>
          </div>
          {schedules.length === 0 ? (
            <div className="py-6 text-center">
              <Dumbbell className="h-7 w-7 text-[#858585] mx-auto mb-2" />
              <p className="text-sm text-[#858585]">No training schedules assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.slice(0, 5).map((sch) => (
                <div
                  key={sch.id}
                  className="p-3.5 bg-[#111111] border border-white/10 rounded flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{sch.memberName}</p>
                    <p className="text-xs text-[#858585] truncate">
                      {sch.trainingType} · Coach {sch.trainerName}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-white/80 shrink-0">
                    {sch.trainingDays}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
