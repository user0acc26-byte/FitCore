import React, { useState } from 'react';
import { savePaymentRecord, sendMemberNotification } from '../../services/fitcoreDb';
import { formatPKR } from '../../lib/currency';
import type { Member, MemberSubscription, PaymentRecord } from '../../types/fitcore';

interface AdminPaymentsProps {
  payments: PaymentRecord[];
  members: Member[];
  subscriptions: MemberSubscription[];
  onRefresh: () => void;
}

export function AdminPayments({
  payments,
  members,
  subscriptions,
  onRefresh,
}: AdminPaymentsProps) {
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [planName, setPlanName] = useState('Monthly');
  const [amount, setAmount] = useState('5000');
  const [status, setStatus] = useState<'paid' | 'unpaid'>('paid');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState('Cash / Front Desk');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = members.find((x) => x.id === (memberId || members[0]?.id));
    if (!m) return;
    const sub = subscriptions.find((s) => s.memberId === m.id && s.status === 'active');

    setSaving(true);
    try {
      const now = new Date().toISOString();
      await savePaymentRecord(null, {
        memberId: m.id,
        memberUid: m.authUid,
        memberEmail: m.email,
        memberName: `${m.firstName} ${m.lastName}`,
        subscriptionId: sub?.id || '',
        planName: planName.trim() || sub?.planName || 'Membership Fee',
        amount: Math.max(0, Number(amount) || 0),
        status,
        paymentDate,
        method,
        notes: notes.trim(),
        createdAt: now,
      });

      if (status === 'unpaid') {
        await sendMemberNotification({
          memberId: m.id,
          memberUid: m.authUid,
          memberEmail: m.email,
          type: 'payment_due',
          title: 'Payment Due Reminder',
          message: `A fee of ${formatPKR(amount)} for ${planName} is marked unpaid. Please settle at FitCore reception.`,
          isRead: false,
          createdAt: now,
        });
      }

      setNotes('');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (p: PaymentRecord) => {
    await savePaymentRecord(p.id, {
      ...p,
      status: p.status === 'paid' ? 'unpaid' : 'paid',
    });
    onRefresh();
  };

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalUnpaid = payments
    .filter((p) => p.status === 'unpaid')
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-5">
          <p className="text-xs text-[#858585]">Total Collected Revenue</p>
          <p className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-400 tabular-nums mt-1">
            {formatPKR(totalPaid)}
          </p>
        </div>
        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-5">
          <p className="text-xs text-[#858585]">Outstanding Unpaid Dues</p>
          <p className="font-display text-3xl sm:text-4xl font-extrabold text-[#E51C2A] tabular-nums mt-1">
            {formatPKR(totalUnpaid)}
          </p>
        </div>
      </div>

      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6">
        <h2 className="font-display text-2xl font-bold text-white mb-4">Add Payment Record</h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
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
            <label className="block text-xs text-[#858585] mb-1">Fee (PKR)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm font-mono text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Date</label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm font-mono text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'paid' | 'unpaid')}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
            >
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving || members.length === 0}
            className="px-4 py-2 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-50 text-white text-sm font-semibold rounded"
          >
            {saving ? 'Saving...' : 'Add Record'}
          </button>

          <div className="sm:col-span-2">
            <label className="block text-xs text-[#858585] mb-1">Package / Label</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[#858585] mb-1">Payment Method</label>
            <input
              type="text"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[#858585] mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Receipt #"
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
            />
          </div>
        </form>
      </div>

      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-[#858585]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Status (Click to Toggle)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 font-mono tabular-nums">{p.paymentDate}</td>
                  <td className="py-3 px-4 font-semibold text-white">{p.memberName}</td>
                  <td className="py-3 px-4">{p.planName}</td>
                  <td className="py-3 px-4 text-[#858585]">{p.method}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">{formatPKR(p.amount)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => void toggleStatus(p)}
                      className={`font-semibold uppercase hover:underline ${
                        p.status === 'paid' ? 'text-emerald-400' : 'text-[#E51C2A]'
                      }`}
                    >
                      {p.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
