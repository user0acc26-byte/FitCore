import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Bell, CreditCard, Dumbbell, TrendingUp } from 'lucide-react';
import { MemberLayout, type MemberTabKey } from '../../layouts/MemberLayout';
import { useAuth } from '../../context/AuthContext';
import {
  listAnnouncements,
  subscribeMemberRecords,
} from '../../services/fitcoreDb';
import type {
  AttendanceRecord,
  MemberNotification,
  MemberSubscription,
  PaymentRecord,
  ProgressRecord,
  TrainingSchedule,
  WebsiteAnnouncement,
  WorkoutPlan,
} from '../../types/fitcore';
import { MemberProfileTab } from '../../components/member/MemberProfileTab';
import { MemberMembershipsTab } from '../../components/member/MemberMembershipsTab';
import { MemberProgressTab } from '../../components/member/MemberProgressTab';
import { MemberNotificationsTab } from '../../components/member/MemberNotificationsTab';
import { MemberWorkoutsTab } from '../../components/member/MemberWorkoutsTab';

export function MemberPortalPage() {
  const { firebaseUser, role, memberProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<MemberTabKey>('overview');

  const [subscriptions, setSubscriptions] = useState<MemberSubscription[]>([]);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [notifications, setNotifications] = useState<MemberNotification[]>([]);
  const [announcements, setAnnouncements] = useState<WebsiteAnnouncement[]>([]);

  useEffect(() => {
    if (!firebaseUser || role !== 'member' || !memberProfile) return;

    const uid = memberProfile.authUid || firebaseUser.uid;
    const email = memberProfile.email;

    const unsubs = [
      subscribeMemberRecords<MemberSubscription>('subscriptions', uid, email, setSubscriptions),
      subscribeMemberRecords<TrainingSchedule>('trainingSchedules', uid, email, setSchedules),
      subscribeMemberRecords<AttendanceRecord>('attendance', uid, email, setAttendance),
      subscribeMemberRecords<PaymentRecord>('payments', uid, email, setPayments),
      subscribeMemberRecords<ProgressRecord>('progressRecords', uid, email, setProgressRecords),
      subscribeMemberRecords<WorkoutPlan>('workoutPlans', uid, email, setWorkoutPlans),
      subscribeMemberRecords<MemberNotification>('notifications', uid, email, setNotifications),
    ];

    listAnnouncements()
      .then((rows) => setAnnouncements(rows.filter((a) => a.isActive)))
      .catch(() => setAnnouncements([]));

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [firebaseUser, role, memberProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
        <p className="text-sm text-[#858585]">Loading Member Portal...</p>
      </div>
    );
  }

  if (!firebaseUser || role !== 'member' || !memberProfile) {
    return <Navigate to="/login?tab=member" replace />;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const activeSub = subscriptions.find((s) => s.status === 'active') || subscriptions[0];

  return (
    <MemberLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      unreadNotificationsCount={unreadCount}
    >
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('memberships')}
              className="text-left bg-[#1B1B1B] border border-white/10 hover:border-[#E51C2A] rounded-lg p-5 transition-colors"
            >
              <CreditCard className="h-5 w-5 text-[#E51C2A] mb-3" />
              <p className="text-xs text-[#858585]">Active Plan</p>
              <p className="font-display text-2xl font-bold text-white mt-0.5">
                {activeSub ? activeSub.planName : 'None'}
              </p>
              <p className="text-xs font-mono text-[#858585] mt-1 tabular-nums">
                {activeSub ? `Expires ${activeSub.expiryDate}` : 'No linked subscription'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workouts')}
              className="text-left bg-[#1B1B1B] border border-white/10 hover:border-[#E51C2A] rounded-lg p-5 transition-colors"
            >
              <Dumbbell className="h-5 w-5 text-[#E51C2A] mb-3" />
              <p className="text-xs text-[#858585]">Workout Plans</p>
              <p className="font-display text-2xl font-bold text-white mt-0.5 tabular-nums">
                {workoutPlans.length} Assigned
              </p>
              <p className="text-xs text-[#858585] mt-1">
                {activeSub?.trainerName ? `Trainer: ${activeSub.trainerName}` : 'View training split'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('progress')}
              className="text-left bg-[#1B1B1B] border border-white/10 hover:border-[#E51C2A] rounded-lg p-5 transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-[#E51C2A] mb-3" />
              <p className="text-xs text-[#858585]">Progress Logs</p>
              <p className="font-display text-2xl font-bold text-white mt-0.5 tabular-nums">
                {progressRecords.length} Check-ins
              </p>
              <p className="text-xs text-[#858585] mt-1">View body measurements</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="text-left bg-[#1B1B1B] border border-white/10 hover:border-[#E51C2A] rounded-lg p-5 transition-colors"
            >
              <Bell className="h-5 w-5 text-[#E51C2A] mb-3" />
              <p className="text-xs text-[#858585]">Notifications</p>
              <p className="font-display text-2xl font-bold text-white mt-0.5 tabular-nums">
                {unreadCount} Unread
              </p>
              <p className="text-xs text-[#858585] mt-1">Reminders &amp; announcements</p>
            </button>
          </div>

          <MemberMembershipsTab
            subscriptions={subscriptions}
            schedules={schedules}
            attendance={attendance}
            payments={payments}
          />
        </div>
      )}

      {activeTab === 'profile' && <MemberProfileTab member={memberProfile} />}
      {activeTab === 'memberships' && (
        <MemberMembershipsTab
          subscriptions={subscriptions}
          schedules={schedules}
          attendance={attendance}
          payments={payments}
        />
      )}
      {activeTab === 'progress' && <MemberProgressTab records={progressRecords} />}
      {activeTab === 'notifications' && (
        <MemberNotificationsTab notifications={notifications} announcements={announcements} />
      )}
      {activeTab === 'workouts' && <MemberWorkoutsTab plans={workoutPlans} />}
    </MemberLayout>
  );
}
