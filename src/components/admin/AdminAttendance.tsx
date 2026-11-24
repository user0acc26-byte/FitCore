import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { saveAttendanceRecord } from '../../services/fitcoreDb';
import type { AttendanceRecord, Member, MemberSubscription } from '../../types/fitcore';

interface AdminAttendanceProps {
  attendance: AttendanceRecord[];
  members: Member[];
  subscriptions: MemberSubscription[];
  onRefresh: () => void;
}

export function AdminAttendance({
  attendance,
  members,
  subscriptions,
  onRefresh,
}: AdminAttendanceProps) {
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<'present' | 'absent'>('present');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleMark = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = members.find((x) => x.id === (memberId || members[0]?.id));
    if (!m) return;
    const sub = subscriptions.find((s) => s.memberId === m.id && s.status === 'active');

    setSaving(true);
    try {
      await saveAttendanceRecord(null, {
        memberId: m.id,
        memberUid: m.authUid,
        memberEmail: m.email,
        memberName: `${m.firstName} ${m.lastName}`,
        subscriptionId: sub?.id || '',
        date,
        status,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
      });
      setNotes('');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6">
        <h2 className="font-display text-2xl font-bold text-white mb-4">Mark Member Attendance</h2>
        <form onSubmit={handleMark} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs text-[#858585] mb-1">Member</label>
            <select
              required
              value={memberId || members[0]?.id || ''}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.memberCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm font-mono text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'present' | 'absent')}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving || members.length === 0}
            className="px-4 py-2 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-50 text-white text-sm font-semibold rounded"
          >
            {saving ? 'Logging...' : 'Save Log'}
          </button>
        </form>
      </div>

      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-display text-2xl font-bold text-white">Attendance History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-[#858585]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#858585]">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-mono tabular-nums">{a.date}</td>
                    <td className="py-3 px-4 font-semibold text-white">{a.memberName}</td>
                    <td className="py-3 px-4">
                      {a.status === 'present' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#E51C2A] font-semibold">
                          <XCircle className="h-3.5 w-3.5" />
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#858585]">{a.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
