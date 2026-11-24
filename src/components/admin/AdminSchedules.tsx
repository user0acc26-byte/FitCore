import React, { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  deleteTrainingSchedule,
  saveTrainingSchedule,
  sendMemberNotification,
} from '../../services/fitcoreDb';
import type {
  Member,
  MemberSubscription,
  Trainer,
  TrainingSchedule,
} from '../../types/fitcore';

interface AdminSchedulesProps {
  schedules: TrainingSchedule[];
  members: Member[];
  trainers: Trainer[];
  subscriptions: MemberSubscription[];
  onRefresh: () => void;
}

export function AdminSchedules({
  schedules,
  members,
  trainers,
  subscriptions,
  onRefresh,
}: AdminSchedulesProps) {
  const [editing, setEditing] = useState<Partial<TrainingSchedule> | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    const m = members[0];
    const t = trainers[0];
    setEditing({
      memberId: m?.id || '',
      trainerId: t?.id || '',
      trainingDays: 'Mon, Wed, Fri',
      timings: '6:30 PM – 7:30 PM',
      trainingType: 'Strength & Hypertrophy',
      instructions: '',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.memberId || !editing?.trainerId) return;
    const m = members.find((x) => x.id === editing.memberId);
    const t = trainers.find((x) => x.id === editing.trainerId);
    if (!m || !t) return;

    const activeSub = subscriptions.find((s) => s.memberId === m.id && s.status === 'active');

    setSaving(true);
    try {
      const now = new Date().toISOString();
      await saveTrainingSchedule(editing.id || null, {
        memberId: m.id,
        memberUid: m.authUid,
        memberEmail: m.email,
        memberName: `${m.firstName} ${m.lastName}`,
        subscriptionId: activeSub?.id || editing.subscriptionId || '',
        trainerId: t.id,
        trainerName: t.fullName,
        trainingDays: editing.trainingDays || '',
        timings: editing.timings || '',
        trainingType: editing.trainingType || '',
        instructions: editing.instructions || '',
        updatedAt: now,
      });

      await sendMemberNotification({
        memberId: m.id,
        memberUid: m.authUid,
        memberEmail: m.email,
        type: 'schedule_update',
        title: 'Training Schedule Updated',
        message: `${editing.trainingType} with ${t.fullName} scheduled for ${editing.trainingDays} (${editing.timings}).`,
        isRead: false,
        createdAt: now,
      });

      setEditing(null);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-white">Member Training Schedules</h2>
        <button
          type="button"
          onClick={openNew}
          disabled={members.length === 0 || trainers.length === 0}
          className="px-4 py-2 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-50 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Create Schedule</span>
        </button>
      </div>

      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-[#858585]">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Assigned Trainer</th>
                <th className="py-3 px-4">Training Type</th>
                <th className="py-3 px-4">Days &amp; Timings</th>
                <th className="py-3 px-4">Instructions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#858585]">
                    No training schedules assigned yet.
                  </td>
                </tr>
              ) : (
                schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-semibold text-white">{s.memberName}</td>
                    <td className="py-3 px-4">{s.trainerName}</td>
                    <td className="py-3 px-4 text-[#E51C2A]">{s.trainingType}</td>
                    <td className="py-3 px-4 font-mono">
                      {s.trainingDays} · {s.timings}
                    </td>
                    <td className="py-3 px-4 text-[#858585] max-w-xs truncate">{s.instructions}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing({ ...s })}
                          className="p-1.5 bg-[#111111] hover:bg-white/10 rounded text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteTrainingSchedule(s.id);
                            onRefresh();
                          }}
                          className="p-1.5 bg-[#111111] hover:bg-[#E51C2A]/20 rounded text-[#E51C2A]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-bold text-white">
                {editing.id ? 'Update Training Schedule' : 'Assign Training Schedule'}
              </h3>
              <button type="button" onClick={() => setEditing(null)}>
                <X className="h-5 w-5 text-[#858585]" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Member</label>
                  <select
                    required
                    value={editing.memberId || ''}
                    onChange={(e) => setEditing({ ...editing, memberId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Trainer</label>
                  <select
                    required
                    value={editing.trainerId || ''}
                    onChange={(e) => setEditing({ ...editing, trainerId: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  >
                    {trainers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#858585] mb-1">Training Type</label>
                <input
                  type="text"
                  required
                  value={editing.trainingType || ''}
                  onChange={(e) => setEditing({ ...editing, trainingType: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Training Days</label>
                  <input
                    type="text"
                    required
                    value={editing.trainingDays || ''}
                    onChange={(e) => setEditing({ ...editing, trainingDays: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Timings</label>
                  <input
                    type="text"
                    required
                    value={editing.timings || ''}
                    onChange={(e) => setEditing({ ...editing, timings: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#858585] mb-1">Instructions</label>
                <textarea
                  rows={3}
                  value={editing.instructions || ''}
                  onChange={(e) => setEditing({ ...editing, instructions: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 text-[#858585]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#E51C2A] text-white font-semibold rounded"
                >
                  {saving ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
