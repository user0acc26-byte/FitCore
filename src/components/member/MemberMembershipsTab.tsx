import { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Receipt,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import { formatPKR } from '../../lib/currency';
import type {
  AttendanceRecord,
  MemberSubscription,
  PaymentRecord,
  TrainingSchedule,
} from '../../types/fitcore';

interface MemberMembershipsTabProps {
  subscriptions: MemberSubscription[];
  schedules: TrainingSchedule[];
  attendance: AttendanceRecord[];
  payments: PaymentRecord[];
}

export function MemberMembershipsTab({
  subscriptions,
  schedules,
  attendance,
  payments,
}: MemberMembershipsTabProps) {
  const [selectedSub, setSelectedSub] = useState<MemberSubscription | null>(null);

  if (subscriptions.length === 0) {
    return (
      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-12 text-center">
        <p className="text-sm text-[#858585]">
          No membership subscriptions are linked to your profile yet. Contact FitCore reception to
          activate a package.
        </p>
      </div>
    );
  }

  const getSubSchedules = (subId: string) =>
    schedules.filter((s) => s.subscriptionId === subId || !s.subscriptionId);

  const getSubPayments = (subId: string) =>
    payments.filter((p) => p.subscriptionId === subId || !p.subscriptionId);

  const getSubAttendance = (subId: string) =>
    attendance.filter((a) => a.subscriptionId === subId || !a.subscriptionId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subscriptions.map((sub) => {
          const subSchedules = getSubSchedules(sub.id);
          const subPayments = getSubPayments(sub.id);
          const subAttendance = getSubAttendance(sub.id);
          const presentCount = subAttendance.filter((a) => a.status === 'present').length;
          const paidTotal = subPayments
            .filter((p) => p.status === 'paid')
            .reduce((acc, p) => acc + p.amount, 0);

          return (
            <article
              key={sub.id}
              className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <p className="text-xs text-[#858585] mb-1">Membership Package</p>
                    <h2 className="font-display text-3xl font-bold text-white">{sub.planName}</h2>
                  </div>
                  <span
                    className={`text-xs font-semibold uppercase ${
                      sub.status === 'active'
                        ? 'text-emerald-400'
                        : sub.status === 'expired'
                        ? 'text-[#E51C2A]'
                        : 'text-[#858585]'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-[#858585]">Start Date</p>
                    <p className="font-mono font-semibold text-white tabular-nums">
                      {sub.startDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#858585]">Expiry Date</p>
                    <p className="font-mono font-semibold text-white tabular-nums">
                      {sub.expiryDate}
                    </p>
                  </div>
                </div>

                <div className="bg-[#111111] border border-white/10 rounded p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#858585] flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-[#E51C2A]" />
                      Assigned Trainer
                    </span>
                    <span className="text-white font-semibold">{sub.trainerName || 'Unassigned'}</span>
                  </div>
                  {sub.trainerSpecialization && (
                    <div className="flex items-center justify-between">
                      <span className="text-[#858585]">Specialization</span>
                      <span className="text-white/90">{sub.trainerSpecialization}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[#858585] flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5 text-[#E51C2A]" />
                      Training Schedule
                    </span>
                    <span className="text-white/90">
                      {subSchedules[0]
                        ? `${subSchedules[0].trainingDays} (${subSchedules[0].timings})`
                        : 'Not assigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#858585] flex items-center gap-1.5">
                      <ClipboardCheck className="h-3.5 w-3.5 text-[#E51C2A]" />
                      Attendance Logs
                    </span>
                    <span className="text-white/90 font-mono tabular-nums">
                      {presentCount} / {subAttendance.length} Present
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#858585] flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-[#E51C2A]" />
                      Payment Recorded
                    </span>
                    <span className="text-white/90 font-mono tabular-nums">{formatPKR(paidTotal)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSub(sub)}
                className="w-full py-2.5 bg-[#111111] hover:bg-[#E51C2A] border border-white/15 hover:border-[#E51C2A] text-white text-sm font-semibold rounded transition-colors inline-flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
            </article>
          );
        })}
      </div>

      {/* Membership Details Modal */}
      {selectedSub && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1B1B1B] border border-white/15 rounded-lg">
            <div className="sticky top-0 bg-[#1B1B1B] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#E51C2A] font-semibold uppercase">
                  Membership Record
                </p>
                <h3 className="font-display text-2xl font-bold text-white">
                  {selectedSub.planName} — {selectedSub.status.toUpperCase()}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="p-2 text-[#858585] hover:text-white rounded"
                aria-label="Close details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-sm">
              {/* Dates & Trainer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#111111] border border-white/10 rounded p-4 space-y-1">
                  <p className="text-xs text-[#858585]">Subscription Period</p>
                  <p className="font-mono text-white tabular-nums">
                    {selectedSub.startDate} to {selectedSub.expiryDate}
                  </p>
                  <p className="text-xs text-[#858585] font-mono tabular-nums">
                    Fee: {formatPKR(selectedSub.amount)}
                  </p>
                </div>
                <div className="bg-[#111111] border border-white/10 rounded p-4 space-y-1">
                  <p className="text-xs text-[#858585]">Assigned Trainer Details</p>
                  <p className="font-semibold text-white">
                    {selectedSub.trainerName || 'Not Assigned'}
                  </p>
                  {selectedSub.trainerSpecialization && (
                    <p className="text-xs text-[#858585]">{selectedSub.trainerSpecialization}</p>
                  )}
                  {selectedSub.trainerPhone && (
                    <p className="text-xs font-mono text-[#858585] tabular-nums">
                      {selectedSub.trainerPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Training Schedule */}
              <div>
                <h4 className="font-display text-xl font-bold text-white mb-3">
                  Training Schedule
                </h4>
                {getSubSchedules(selectedSub.id).length === 0 ? (
                  <p className="text-xs text-[#858585]">No training schedule recorded yet.</p>
                ) : (
                  <div className="space-y-2.5">
                    {getSubSchedules(selectedSub.id).map((sch) => (
                      <div
                        key={sch.id}
                        className="bg-[#111111] border border-white/10 rounded p-4 space-y-1"
                      >
                        <div className="flex flex-wrap justify-between gap-2">
                          <span className="font-semibold text-white">{sch.trainingType}</span>
                          <span className="text-xs font-mono text-[#E51C2A]">
                            {sch.trainingDays} · {sch.timings}
                          </span>
                        </div>
                        {sch.instructions && (
                          <p className="text-xs text-[#858585]">{sch.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div>
                <h4 className="font-display text-xl font-bold text-white mb-3">
                  Payment Details
                </h4>
                {getSubPayments(selectedSub.id).length === 0 ? (
                  <p className="text-xs text-[#858585]">No payment records linked.</p>
                ) : (
                  <div className="overflow-x-auto border border-white/10 rounded">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#111111] text-[#858585]">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Plan</th>
                          <th className="py-2.5 px-3">Method</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                          <th className="py-2.5 px-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {getSubPayments(selectedSub.id).map((pay) => (
                          <tr key={pay.id}>
                            <td className="py-2.5 px-3 font-mono tabular-nums">
                              {pay.paymentDate}
                            </td>
                            <td className="py-2.5 px-3">{pay.planName}</td>
                            <td className="py-2.5 px-3 text-[#858585]">{pay.method}</td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                              {formatPKR(pay.amount)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-semibold uppercase">
                              <span
                                className={
                                  pay.status === 'paid' ? 'text-emerald-400' : 'text-[#E51C2A]'
                                }
                              >
                                {pay.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Attendance Records */}
              <div>
                <h4 className="font-display text-xl font-bold text-white mb-3">
                  Attendance Records
                </h4>
                {getSubAttendance(selectedSub.id).length === 0 ? (
                  <p className="text-xs text-[#858585]">No attendance logs recorded yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {getSubAttendance(selectedSub.id)
                      .slice(0, 12)
                      .map((att) => (
                        <div
                          key={att.id}
                          className="bg-[#111111] border border-white/10 rounded px-3 py-2 flex items-center justify-between text-xs"
                        >
                          <span className="font-mono tabular-nums">{att.date}</span>
                          {att.status === 'present' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#E51C2A]">
                              <XCircle className="h-3.5 w-3.5" />
                              Absent
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
