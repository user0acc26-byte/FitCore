import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout, type AdminSectionKey } from '../../layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import {
  listAllAttendance,
  listAllMembers,
  listAllNotifications,
  listAllPayments,
  listAllProgress,
  listAllSchedules,
  listAllSubscriptions,
  listAllWorkoutPlans,
  listAnnouncements,
  listClasses,
  listFacilities,
  listInquiries,
  listMembershipPlans,
  listShopProducts,
  listTrainers,
  seedStarterGymCatalog,
} from '../../services/fitcoreDb';
import type {
  AttendanceRecord,
  Facility,
  FitnessClass,
  Inquiry,
  Member,
  MemberNotification,
  MembershipPlan,
  MemberSubscription,
  PaymentRecord,
  ProgressRecord,
  ShopProduct,
  Trainer,
  TrainingSchedule,
  WebsiteAnnouncement,
  WorkoutPlan,
} from '../../types/fitcore';
import { AdminOverview } from '../../components/admin/AdminOverview';
import { AdminMembers } from '../../components/admin/AdminMembers';
import { AdminMemberships } from '../../components/admin/AdminMemberships';
import { AdminTrainers } from '../../components/admin/AdminTrainers';
import { AdminSchedules } from '../../components/admin/AdminSchedules';
import { AdminAttendance } from '../../components/admin/AdminAttendance';
import { AdminProgress } from '../../components/admin/AdminProgress';
import { AdminWorkouts } from '../../components/admin/AdminWorkouts';
import { AdminPayments } from '../../components/admin/AdminPayments';
import { AdminNotifications } from '../../components/admin/AdminNotifications';
import { AdminWebsiteContent } from '../../components/admin/AdminWebsiteContent';
import { AdminInquiries } from '../../components/admin/AdminInquiries';

export function AdminDashboardPage() {
  const { firebaseUser, role, loading } = useAuth();
  const [section, setSection] = useState<AdminSectionKey>('overview');
  const [dataLoading, setDataLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<MemberSubscription[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [notifications, setNotifications] = useState<MemberNotification[]>([]);
  const [announcements, setAnnouncements] = useState<WebsiteAnnouncement[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [prefillInquiry, setPrefillInquiry] = useState<Inquiry | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      const [
        mems,
        pls,
        subs,
        trs,
        schs,
        atts,
        pays,
        progs,
        wps,
        notifs,
        anns,
        facs,
        cls,
        prods,
        inqs,
      ] = await Promise.all([
        listAllMembers().catch(() => []),
        listMembershipPlans().catch(() => []),
        listAllSubscriptions().catch(() => []),
        listTrainers().catch(() => []),
        listAllSchedules().catch(() => []),
        listAllAttendance().catch(() => []),
        listAllPayments().catch(() => []),
        listAllProgress().catch(() => []),
        listAllWorkoutPlans().catch(() => []),
        listAllNotifications().catch(() => []),
        listAnnouncements().catch(() => []),
        listFacilities().catch(() => []),
        listClasses().catch(() => []),
        listShopProducts().catch(() => []),
        listInquiries().catch(() => []),
      ]);
      setMembers(mems);
      setPlans(pls);
      setSubscriptions(subs);
      setTrainers(trs);
      setSchedules(schs);
      setAttendance(atts);
      setPayments(pays);
      setProgressRecords(progs);
      setWorkoutPlans(wps);
      setNotifications(notifs);
      setAnnouncements(anns);
      setFacilities(facs);
      setClasses(cls);
      setProducts(prods);
      setInquiries(inqs);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (firebaseUser && role === 'admin') {
      void loadAllData();
    }
  }, [firebaseUser, role, loadAllData]);

  const handleSeedStarter = async () => {
    setSeeding(true);
    try {
      await seedStarterGymCatalog(true);
      await loadAllData();
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
        <p className="text-sm text-[#858585]">Verifying Administrator Access...</p>
      </div>
    );
  }

  if (!firebaseUser || role !== 'admin') {
    return <Navigate to="/login?tab=admin" replace />;
  }

  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;
  const hasCatalog = plans.length > 0 && facilities.length > 0;

  return (
    <AdminLayout
      activeSection={section}
      onSelectSection={setSection}
      newInquiriesCount={newInquiriesCount}
    >
      {dataLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[#1B1B1B] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {section === 'overview' && (
            <AdminOverview
              members={members}
              subscriptions={subscriptions}
              trainers={trainers}
              schedules={schedules}
              payments={payments}
              inquiries={inquiries}
              hasCatalog={hasCatalog}
              seeding={seeding}
              onSeedStarter={handleSeedStarter}
              onNavigate={setSection}
            />
          )}

          {section === 'members' && (
            <AdminMembers
              members={members}
              plans={plans}
              trainers={trainers}
              subscriptions={subscriptions}
              inquiries={inquiries}
              prefillInquiry={prefillInquiry}
              onClearPrefill={() => setPrefillInquiry(null)}
              onRefresh={loadAllData}
            />
          )}

          {section === 'memberships' && (
            <AdminMemberships
              plans={plans}
              members={members}
              trainers={trainers}
              subscriptions={subscriptions}
              onRefresh={loadAllData}
            />
          )}

          {section === 'trainers' && (
            <AdminTrainers trainers={trainers} onRefresh={loadAllData} />
          )}

          {section === 'schedules' && (
            <AdminSchedules
              schedules={schedules}
              members={members}
              trainers={trainers}
              subscriptions={subscriptions}
              onRefresh={loadAllData}
            />
          )}

          {section === 'attendance' && (
            <AdminAttendance
              attendance={attendance}
              members={members}
              subscriptions={subscriptions}
              onRefresh={loadAllData}
            />
          )}

          {section === 'progress' && (
            <AdminProgress
              progressRecords={progressRecords}
              members={members}
              onRefresh={loadAllData}
            />
          )}

          {section === 'workouts' && (
            <AdminWorkouts
              workoutPlans={workoutPlans}
              members={members}
              trainers={trainers}
              onRefresh={loadAllData}
            />
          )}

          {section === 'payments' && (
            <AdminPayments
              payments={payments}
              members={members}
              subscriptions={subscriptions}
              onRefresh={loadAllData}
            />
          )}

          {section === 'notifications' && (
            <AdminNotifications
              members={members}
              notifications={notifications}
              announcements={announcements}
              onRefresh={loadAllData}
            />
          )}

          {section === 'content' && (
            <AdminWebsiteContent
              facilities={facilities}
              classes={classes}
              products={products}
              onRefresh={loadAllData}
            />
          )}

          {section === 'inquiries' && (
            <AdminInquiries
              inquiries={inquiries}
              onConvertRegistration={(inq) => {
                setPrefillInquiry(inq);
                setSection('members');
              }}
              onRefresh={loadAllData}
            />
          )}
        </>
      )}
    </AdminLayout>
  );
}
