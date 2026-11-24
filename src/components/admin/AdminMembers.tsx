import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import {
  adminCreateMember,
  adminDeleteMember,
  adminUpdateMember,
  generateRandomMemberPassword,
} from '../../services/fitcoreDb';
import { formatPKR } from '../../lib/currency';
import type {
  Inquiry,
  Member,
  MembershipPlan,
  MemberSubscription,
  Trainer,
} from '../../types/fitcore';

interface AdminMembersProps {
  members: Member[];
  plans: MembershipPlan[];
  trainers: Trainer[];
  subscriptions: MemberSubscription[];
  inquiries: Inquiry[];
  prefillInquiry?: Inquiry | null;
  onClearPrefill?: () => void;
  onRefresh: () => void;
}

interface CreatedCredentials {
  memberCode: string;
  fullName: string;
  email: string;
  password: string;
}

export function AdminMembers({
  members,
  plans,
  trainers,
  subscriptions,
  inquiries,
  prefillInquiry,
  onClearPrefill,
  onRefresh,
}: AdminMembersProps) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [removingMember, setRemovingMember] = useState<Member | null>(null);
  const [createdCreds, setCreatedCreds] = useState<CreatedCredentials | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Add Member Form State (includes Date of Birth + Auto-Generated Password)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('24');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-01');
  const [gender, setGender] = useState<Member['gender']>('Male');
  const [phone, setPhone] = useState('');
  const [tempPassword, setTempPassword] = useState(() => generateRandomMemberPassword());
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('paid');
  const [inquiryIdToApprove, setInquiryIdToApprove] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (plans.length > 0 && !planId) {
      const firstPlan = plans[0];
      setPlanId(firstPlan.id);
      const start = new Date(startDate);
      start.setDate(start.getDate() + (firstPlan.durationDays || 30));
      setExpiryDate(start.toISOString().slice(0, 10));
    }
  }, [plans, planId, startDate]);

  useEffect(() => {
    if (prefillInquiry) {
      const parts = prefillInquiry.name.trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || 'Member');
      setEmail(prefillInquiry.email);
      setPhone(prefillInquiry.phone);
      setAge(String(prefillInquiry.age || 25));
      setGender(
        prefillInquiry.gender === 'Other' || prefillInquiry.gender === 'Prefer not to say'
          ? prefillInquiry.gender
          : 'Male'
      );
      if (prefillInquiry.requestedPlanId) {
        setPlanId(prefillInquiry.requestedPlanId);
      }
      setInquiryIdToApprove(prefillInquiry.id);
      setTempPassword(generateRandomMemberPassword());
      setShowAdd(true);
    }
  }, [prefillInquiry]);

  const handlePlanOrDateChange = (nextPlanId: string, nextStart: string) => {
    setPlanId(nextPlanId);
    setStartDate(nextStart);
    const selectedPlan = plans.find((p) => p.id === nextPlanId);
    if (selectedPlan && nextStart) {
      const d = new Date(nextStart);
      if (!Number.isNaN(d.getTime())) {
        d.setDate(d.getDate() + (selectedPlan.durationDays || 30));
        setExpiryDate(d.toISOString().slice(0, 10));
      }
    }
  };

  const resetAddForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setAge('24');
    setDateOfBirth('2000-01-01');
    setGender('Male');
    setPhone('');
    setTempPassword(generateRandomMemberPassword());
    setTrainerId('');
    setInquiryIdToApprove(undefined);
    if (onClearPrefill) onClearPrefill();
  };

  const matchingPendingInquiry = inquiries.find(
    (inq) =>
      inq.email.toLowerCase() === email.trim().toLowerCase() &&
      inq.status !== 'approved' &&
      inq.id !== inquiryIdToApprove
  );

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    const chosenPlan = plans.find((p) => p.id === planId);
    if (!chosenPlan) {
      setError('Please create or select a Membership Plan first.');
      return;
    }
    if (tempPassword.length < 6) {
      setError('Generated password must be at least 6 characters.');
      return;
    }

    setSaving(true);
    try {
      const chosenTrainer = trainers.find((t) => t.id === trainerId) || null;
      const res = await adminCreateMember({
        firstName,
        lastName,
        email,
        age: Number(age) || 24,
        dateOfBirth,
        gender,
        phone,
        temporaryPassword: tempPassword,
        plan: chosenPlan,
        startDate,
        expiryDate,
        trainer: chosenTrainer,
        paymentStatus,
        inquiryIdToApprove: inquiryIdToApprove || matchingPendingInquiry?.id,
      });

      setCreatedCreds({
        memberCode: res.memberCode,
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        email: res.email,
        password: res.password,
      });
      setCopiedCreds(false);
      setFeedback(`Member ${res.memberCode} created successfully.`);
      setShowAdd(false);
      resetAddForm();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create member.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCredentials = async () => {
    if (!createdCreds) return;
    const text = `FitCore Member Portal Credentials\nMember ID: ${createdCreds.memberCode}\nName: ${createdCreds.fullName}\nEmail: ${createdCreds.email}\nPassword: ${createdCreds.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCreds(true);
      setTimeout(() => setCopiedCreds(false), 3000);
    } catch {
      setCopiedCreds(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setSaving(true);
    setError(null);
    try {
      await adminUpdateMember(editingMember);
      setEditingMember(null);
      setFeedback('Member details updated.');
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update member.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!removingMember) return;
    setSaving(true);
    setError(null);
    try {
      await adminDeleteMember(removingMember.id);
      setFeedback(
        `Member ${removingMember.memberCode} (${removingMember.firstName} ${removingMember.lastName}) and linked records were removed.`
      );
      setRemovingMember(null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove member.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (m: Member) => {
    const nextStatus = m.status === 'active' ? 'inactive' : 'active';
    await adminUpdateMember({ ...m, status: nextStatus });
    setFeedback(`Member ${m.memberCode} set to ${nextStatus}.`);
    onRefresh();
  };

  const filtered = members.filter((m) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.memberCode.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or Member ID..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#1B1B1B] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            resetAddForm();
            setError(null);
            setShowAdd(true);
          }}
          className="px-5 py-2.5 bg-[#E51C2A] hover:bg-[#c81622] text-white text-sm font-semibold rounded transition-colors inline-flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Shareable Credentials Card right after creating a member */}
      {createdCreds && (
        <div className="p-5 bg-[#1B1B1B] border border-emerald-500/40 rounded-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                New Member Portal Credentials Ready
              </p>
              <h3 className="font-display text-xl font-bold text-white">
                {createdCreds.fullName} ({createdCreds.memberCode})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleCopyCredentials()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
              >
                {copiedCreds ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedCreds ? 'Copied Credentials!' : 'Copy Email & Password'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCreatedCreds(null)}
                className="p-1.5 text-[#858585] hover:text-white"
                aria-label="Dismiss credentials banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#111111] border border-white/10 rounded p-3">
              <p className="text-[#858585] mb-0.5">Member Portal Email</p>
              <p className="font-mono text-white select-all">{createdCreds.email}</p>
            </div>
            <div className="bg-[#111111] border border-white/10 rounded p-3">
              <p className="text-[#858585] mb-0.5">Generated Password</p>
              <p className="font-mono text-emerald-300 font-semibold select-all">
                {createdCreds.password}
              </p>
            </div>
          </div>
          <p className="text-xs text-[#858585]">
            Copy and send this Email and Password to the member so they can sign in under{' '}
            <strong className="text-white">Login → Member Portal</strong>.
          </p>
        </div>
      )}

      {feedback && !createdCreds && (
        <div className="p-4 bg-[#1B1B1B] border border-emerald-500/40 rounded text-sm text-emerald-300">
          {feedback}
        </div>
      )}
      {error && !showAdd && !editingMember && !removingMember && (
        <div className="p-4 bg-[#1B1B1B] border border-[#E51C2A]/50 rounded text-sm text-white">
          {error}
        </div>
      )}

      {/* Members Table */}
      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111111] text-xs text-[#858585]">
              <tr>
                <th className="py-3.5 px-4">Member ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Active Plan</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-[#858585]">
                    No members match your search. Click &quot;Add New Member&quot; to register one.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const sub = subscriptions.find(
                    (s) => s.memberId === m.id && s.status === 'active'
                  );
                  return (
                    <tr key={m.id} className="hover:bg-white/5">
                      <td className="py-3.5 px-4 font-mono text-xs tabular-nums text-[#E51C2A] font-semibold">
                        {m.memberCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">
                          {m.firstName} {m.lastName}
                        </p>
                        <p className="text-xs text-[#858585]">
                          {m.gender} · {m.age} yrs
                          {m.dateOfBirth ? ` · DOB: ${m.dateOfBirth}` : ''}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <p className="text-white">{m.email}</p>
                        <p className="text-[#858585] font-mono tabular-nums">{m.phone}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        {sub ? (
                          <div>
                            <p className="text-white font-medium">{sub.planName}</p>
                            <p className="text-[#858585] font-mono tabular-nums">
                              Exp: {sub.expiryDate}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[#858585]">No active plan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold uppercase">
                        <span
                          className={
                            m.status === 'active' ? 'text-emerald-400' : 'text-[#E51C2A]'
                          }
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingMember(m)}
                            title="View Profile"
                            className="p-2 bg-[#111111] hover:bg-white/10 rounded text-[#858585] hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMember({ ...m })}
                            title="Edit Member"
                            className="p-2 bg-[#111111] hover:bg-white/10 rounded text-[#858585] hover:text-white"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleStatus(m)}
                            title={m.status === 'active' ? 'Deactivate' : 'Activate'}
                            className="p-2 bg-[#111111] hover:bg-white/10 rounded text-[#858585] hover:text-amber-400"
                          >
                            {m.status === 'active' ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemovingMember(m)}
                            title="Remove Member"
                            className="p-2 bg-[#111111] hover:bg-[#E51C2A]/20 rounded text-[#858585] hover:text-[#E51C2A]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1B1B1B] border border-white/15 rounded-lg">
            <div className="sticky top-0 bg-[#1B1B1B] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-white">Add New Gym Member</h2>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  resetAddForm();
                }}
                className="p-2 text-[#858585] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-[#E51C2A]/15 border border-[#E51C2A]/50 rounded text-xs text-white leading-relaxed">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">
                    Member Portal Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="member@fitcore.pk"
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  />
                  <p className="text-[11px] text-[#858585] mt-1">
                    Use a dedicated Member Portal email if the user already has a separate Website
                    Account.
                  </p>
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Age</label>
                  <input
                    type="number"
                    min={12}
                    max={110}
                    required
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Member['gender'])}
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#858585] mb-1">
                  Auto-Generated Member Password (Share with Member)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm font-mono text-emerald-300"
                  />
                  <button
                    type="button"
                    onClick={() => setTempPassword(generateRandomMemberPassword())}
                    className="px-3.5 py-2 bg-[#111111] hover:bg-white/10 border border-white/15 rounded text-xs font-semibold text-white inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Membership Plan</label>
                  <select
                    required
                    value={planId}
                    onChange={(e) => handlePlanOrDateChange(e.target.value, startDate)}
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatPKR(p.price)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => handlePlanOrDateChange(planId, e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Assigned Trainer</label>
                  <select
                    value={trainerId}
                    onChange={(e) => setTrainerId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  >
                    <option value="">No Trainer Assigned</option>
                    {trainers
                      .filter((t) => t.status === 'active')
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} — {t.specialization}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">
                    Initial Payment Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'unpaid')}
                    className="w-full px-3.5 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid (Due)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    resetAddForm();
                  }}
                  className="px-4 py-2 text-sm text-[#858585] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#E51C2A] hover:bg-[#c81622] text-white text-sm font-semibold rounded"
                >
                  {saving ? 'Provisioning Member...' : 'Create Member & Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-display text-2xl font-bold text-white">
                Edit Member ({editingMember.memberCode})
              </h2>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-[#858585] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editingMember.firstName}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editingMember.lastName}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={editingMember.phone}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={editingMember.age}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, age: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editingMember.dateOfBirth || ''}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm font-mono text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Gender</label>
                  <select
                    value={editingMember.gender}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        gender: e.target.value as Member['gender'],
                      })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Status</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        status: e.target.value as Member['status'],
                      })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-sm text-[#858585]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#E51C2A] text-white text-sm font-semibold rounded"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {removingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#1B1B1B] border border-[#E51C2A]/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-display text-2xl font-bold text-white">Remove Gym Member</h2>
              <button
                type="button"
                onClick={() => setRemovingMember(null)}
                className="text-[#858585] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong>
                {removingMember.firstName} {removingMember.lastName}
              </strong>{' '}
              (<span className="font-mono text-[#E51C2A]">{removingMember.memberCode}</span>)? This
              revokes their Member Portal access and removes their linked subscriptions, schedules,
              attendance, workout plans, and progress records.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRemovingMember(null)}
                className="px-4 py-2 text-sm text-[#858585] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleConfirmRemove()}
                className="px-5 py-2 bg-[#E51C2A] hover:bg-[#c81622] text-white text-sm font-semibold rounded"
              >
                {saving ? 'Removing...' : 'Yes, Remove Member'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Member Modal */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-xs font-mono text-[#E51C2A]">{viewingMember.memberCode}</p>
                <h2 className="font-display text-2xl font-bold text-white">
                  {viewingMember.firstName} {viewingMember.lastName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingMember(null)}
                className="text-[#858585] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-[#111111] p-3 rounded">
                <p className="text-xs text-[#858585]">Email</p>
                <p className="text-white break-all">{viewingMember.email}</p>
              </div>
              <div className="bg-[#111111] p-3 rounded">
                <p className="text-xs text-[#858585]">Phone</p>
                <p className="text-white font-mono">{viewingMember.phone}</p>
              </div>
              <div className="bg-[#111111] p-3 rounded">
                <p className="text-xs text-[#858585]">Age / Gender</p>
                <p className="text-white">
                  {viewingMember.age} · {viewingMember.gender}
                </p>
              </div>
              <div className="bg-[#111111] p-3 rounded">
                <p className="text-xs text-[#858585]">Date of Birth</p>
                <p className="text-white font-mono">
                  {viewingMember.dateOfBirth || 'Not recorded'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#858585] mb-2">Linked Subscriptions</p>
              {subscriptions.filter((s) => s.memberId === viewingMember.id).length === 0 ? (
                <p className="text-xs text-[#858585]">No subscriptions linked.</p>
              ) : (
                <div className="space-y-2">
                  {subscriptions
                    .filter((s) => s.memberId === viewingMember.id)
                    .map((s) => (
                      <div
                        key={s.id}
                        className="bg-[#111111] border border-white/10 p-3 rounded flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-white">{s.planName}</p>
                          <p className="text-[#858585]">
                            Trainer: {s.trainerName || 'Unassigned'}
                          </p>
                        </div>
                        <div className="text-right font-mono">
                          <p className="text-white">
                            {s.startDate} → {s.expiryDate}
                          </p>
                          <p className="text-[#E51C2A] uppercase">{s.status}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
