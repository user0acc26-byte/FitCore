import React, { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  deleteMembershipPlan,
  saveMembershipPlan,
  savePaymentRecord,
  saveSubscription,
  sendMemberNotification,
} from '../../services/fitcoreDb';
import { formatPKR } from '../../lib/currency';
import type {
  Member,
  MembershipPlan,
  MemberSubscription,
  Trainer,
} from '../../types/fitcore';

interface AdminMembershipsProps {
  plans: MembershipPlan[];
  members: Member[];
  trainers: Trainer[];
  subscriptions: MemberSubscription[];
  onRefresh: () => void;
}

export function AdminMemberships({
  plans,
  members,
  trainers,
  subscriptions,
  onRefresh,
}: AdminMembershipsProps) {
  const [editingPlan, setEditingPlan] = useState<Partial<MembershipPlan> | null>(null);
  const [assigningSub, setAssigningSub] = useState(false);
  const [editingSub, setEditingSub] = useState<MemberSubscription | null>(null);

  // Assign subscription state
  const [memberId, setMemberId] = useState('');
  const [planId, setPlanId] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const openAssignModal = () => {
    const firstMember = members[0];
    const firstPlan = plans[0];
    setMemberId(firstMember?.id || '');
    setPlanId(firstPlan?.id || '');
    setTrainerId(trainers[0]?.id || '');
    const s = new Date().toISOString().slice(0, 10);
    setStartDate(s);
    if (firstPlan) {
      const d = new Date(s);
      d.setDate(d.getDate() + (firstPlan.durationDays || 30));
      setExpiryDate(d.toISOString().slice(0, 10));
    }
    setAssigningSub(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSaving(true);
    try {
      await saveMembershipPlan(editingPlan.id || null, {
        name: editingPlan.name || 'New Plan',
        durationLabel: editingPlan.durationLabel || '1 Month',
        durationDays: Number(editingPlan.durationDays) || 30,
        price: Number(editingPlan.price) || 0,
        currency: 'PKR',
        description: editingPlan.description || '',
        benefits: editingPlan.benefits || [],
        includedFacilities: editingPlan.includedFacilities || [],
        trainingBenefits: editingPlan.trainingBenefits || [],
        status: editingPlan.status || 'active',
        isPopular: Boolean(editingPlan.isPopular),
        sortOrder: Number(editingPlan.sortOrder) || plans.length + 1,
      });
      setEditingPlan(null);
      setFeedback('Membership package saved and synced to public website.');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleAssignSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = members.find((x) => x.id === memberId);
    const p = plans.find((x) => x.id === planId);
    const t = trainers.find((x) => x.id === trainerId) || null;
    if (!m || !p) return;

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const subId = await saveSubscription(null, {
        memberId: m.id,
        memberUid: m.authUid,
        memberEmail: m.email,
        memberName: `${m.firstName} ${m.lastName}`,
        planId: p.id,
        planName: p.name,
        startDate,
        expiryDate,
        status: 'active',
        trainerId: t?.id || '',
        trainerName: t?.fullName || 'Unassigned',
        trainerSpecialization: t?.specialization || '',
        trainerPhone: t?.phone || '',
        amount: p.price,
        createdAt: now,
        updatedAt: now,
      });

      await savePaymentRecord(null, {
        memberId: m.id,
        memberUid: m.authUid,
        memberEmail: m.email,
        memberName: `${m.firstName} ${m.lastName}`,
        subscriptionId: subId,
        planName: p.name,
        amount: p.price,
        status: 'unpaid',
        paymentDate: startDate,
        method: 'Front Desk / Pending',
        notes: `Membership assigned: ${p.name}`,
        createdAt: now,
      });

      await sendMemberNotification({
        memberId: m.id,
        memberUid: m.authUid,
        memberEmail: m.email,
        type: 'trainer_update',
        title: `New Membership Assigned: ${p.name}`,
        message: `Your ${p.name} package is active from ${startDate} to ${expiryDate}.${
          t ? ` Assigned Trainer: ${t.fullName}.` : ''
        }`,
        isRead: false,
        createdAt: now,
      });

      setAssigningSub(false);
      setFeedback(`Assigned ${p.name} to ${m.firstName} ${m.lastName}.`);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    setSaving(true);
    try {
      const t = trainers.find((x) => x.id === editingSub.trainerId) || null;
      await saveSubscription(editingSub.id, {
        ...editingSub,
        trainerName: t ? t.fullName : editingSub.trainerName,
        trainerSpecialization: t ? t.specialization : editingSub.trainerSpecialization,
        trainerPhone: t ? t.phone : editingSub.trainerPhone,
      });
      setEditingSub(null);
      setFeedback('Member subscription updated and synced to Member Portal.');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {feedback && (
        <div className="p-4 bg-[#1B1B1B] border border-emerald-500/40 rounded text-sm text-emerald-300">
          {feedback}
        </div>
      )}

      {/* Packages Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white">Membership Packages</h2>
          <button
            type="button"
            onClick={() =>
              setEditingPlan({
                name: '',
                durationLabel: '1 Month',
                durationDays: 30,
                price: 5000,
                currency: 'PKR',
                description: '',
                benefits: ['Full gym access'],
                includedFacilities: ['Strength Floor', 'Cardio Zone'],
                trainingBenefits: ['Workout portal access'],
                status: 'active',
                isPopular: false,
                sortOrder: plans.length + 1,
              })
            }
            className="px-4 py-2 bg-[#E51C2A] hover:bg-[#c81622] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Package</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-[#1B1B1B] border border-white/10 rounded-lg p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#858585]">{p.durationLabel}</span>
                  <span className={p.status === 'active' ? 'text-emerald-400' : 'text-[#E51C2A]'}>
                    {p.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">{p.name}</h3>
                <p className="font-display text-2xl font-extrabold text-[#E51C2A] tabular-nums my-2">
                  {formatPKR(p.price)}
                </p>
                <p className="text-xs text-[#858585] line-clamp-2">{p.description}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingPlan({ ...p })}
                  className="flex-1 py-1.5 bg-[#111111] hover:bg-white/10 text-xs text-white rounded inline-flex items-center justify-center gap-1"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteMembershipPlan(p.id);
                    onRefresh();
                  }}
                  className="p-1.5 bg-[#111111] hover:bg-[#E51C2A]/20 text-[#E51C2A] rounded"
                  aria-label="Delete package"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Subscriptions Assignment */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white">
            Member Subscriptions &amp; Trainer Links
          </h2>
          <button
            type="button"
            onClick={openAssignModal}
            className="px-4 py-2 bg-[#1B1B1B] hover:bg-[#E51C2A] border border-white/15 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Assign Membership</span>
          </button>
        </div>

        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111111] text-[#858585]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Trainer</th>
                  <th className="py-3 px-4">Start</th>
                  <th className="py-3 px-4">Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 font-semibold text-white">{sub.memberName}</td>
                    <td className="py-3 px-4">{sub.planName}</td>
                    <td className="py-3 px-4 text-[#858585]">{sub.trainerName || 'Unassigned'}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{sub.startDate}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{sub.expiryDate}</td>
                    <td className="py-3 px-4 uppercase font-semibold">
                      <span
                        className={
                          sub.status === 'active' ? 'text-emerald-400' : 'text-[#E51C2A]'
                        }
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setEditingSub({ ...sub })}
                        className="p-1.5 bg-[#111111] hover:bg-white/10 rounded text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Package Editor Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-bold text-white">
                {editingPlan.id ? 'Edit Membership Package' : 'Create Membership Package'}
              </h3>
              <button type="button" onClick={() => setEditingPlan(null)}>
                <X className="h-5 w-5 text-[#858585]" />
              </button>
            </div>
            <form onSubmit={handleSavePlan} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.name || ''}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.price ?? 0}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white tabular-nums"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Duration Label</label>
                  <input
                    type="text"
                    required
                    value={editingPlan.durationLabel || ''}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, durationLabel: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Duration Days</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.durationDays ?? 30}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Status</label>
                  <select
                    value={editingPlan.status || 'active'}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        status: e.target.value as 'active' | 'inactive',
                      })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#858585] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPlan.description || ''}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#858585] mb-1">
                  Benefits (one per line)
                </label>
                <textarea
                  rows={3}
                  value={(editingPlan.benefits || []).join('\n')}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan,
                      benefits: e.target.value.split('\n'),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">
                    Included Facilities (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(editingPlan.includedFacilities || []).join(', ')}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        includedFacilities: e.target.value.split(','),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">
                    Training Benefits (comma separated)
                  </label>
                  <input
                    type="text"
                    value={(editingPlan.trainingBenefits || []).join(', ')}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        trainingBenefits: e.target.value.split(','),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-white">
                <input
                  type="checkbox"
                  checked={Boolean(editingPlan.isPopular)}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, isPopular: e.target.checked })
                  }
                />
                <span>Highlight as Popular Package</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-[#858585]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#E51C2A] text-white font-semibold rounded"
                >
                  {saving ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Subscription Modal */}
      {assigningSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-bold text-white">Assign Membership</h3>
              <button type="button" onClick={() => setAssigningSub(false)}>
                <X className="h-5 w-5 text-[#858585]" />
              </button>
            </div>
            <form onSubmit={handleAssignSubscription} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-[#858585] mb-1">Member</label>
                <select
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.memberCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#858585] mb-1">Membership Plan</label>
                <select
                  required
                  value={planId}
                  onChange={(e) => {
                    setPlanId(e.target.value);
                    const p = plans.find((x) => x.id === e.target.value);
                    if (p) {
                      const d = new Date(startDate);
                      d.setDate(d.getDate() + (p.durationDays || 30));
                      setExpiryDate(d.toISOString().slice(0, 10));
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatPKR(p.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#858585] mb-1">Assign Trainer</label>
                <select
                  value={trainerId}
                  onChange={(e) => setTrainerId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                >
                  <option value="">Unassigned</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningSub(false)}
                  className="px-4 py-2 text-[#858585]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#E51C2A] text-white font-semibold rounded"
                >
                  {saving ? 'Assigning...' : 'Assign Membership'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-bold text-white">
                Update Subscription — {editingSub.memberName}
              </h3>
              <button type="button" onClick={() => setEditingSub(null)}>
                <X className="h-5 w-5 text-[#858585]" />
              </button>
            </div>
            <form onSubmit={handleUpdateSubscription} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-[#858585] mb-1">Assigned Trainer</label>
                <select
                  value={editingSub.trainerId}
                  onChange={(e) => setEditingSub({ ...editingSub, trainerId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                >
                  <option value="">Unassigned</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={editingSub.expiryDate}
                    onChange={(e) =>
                      setEditingSub({ ...editingSub, expiryDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Status</label>
                  <select
                    value={editingSub.status}
                    onChange={(e) =>
                      setEditingSub({
                        ...editingSub,
                        status: e.target.value as MemberSubscription['status'],
                      })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="px-4 py-2 text-[#858585]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#E51C2A] text-white font-semibold rounded"
                >
                  {saving ? 'Updating...' : 'Update Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
