import React, { useState } from 'react';
import { saveProgressRecord } from '../../services/fitcoreDb';
import type { Member, ProgressRecord } from '../../types/fitcore';

interface AdminProgressProps {
  progressRecords: ProgressRecord[];
  members: Member[];
  onRefresh: () => void;
}

export function AdminProgress({ progressRecords, members, onRefresh }: AdminProgressProps) {
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().slice(0, 10));
  const [fullBody, setFullBody] = useState('82');
  const [chest, setChest] = useState('102');
  const [biceps, setBiceps] = useState('37');
  const [waist, setWaist] = useState('82');
  const [thighs, setThighs] = useState('58');
  const [shoulders, setShoulders] = useState('118');
  const [weight, setWeight] = useState('76');
  const [bodyFat, setBodyFat] = useState('15.5');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = members.find((x) => x.id === (memberId || members[0]?.id));
    if (!m) return;

    setSaving(true);
    try {
      await saveProgressRecord(null, {
        memberId: m.id,
        memberUid: m.authUid,
        memberEmail: m.email,
        memberName: `${m.firstName} ${m.lastName}`,
        measurementDate,
        fullBody: Number(fullBody) || 0,
        chest: Number(chest) || 0,
        biceps: Number(biceps) || 0,
        waist: Number(waist) || 0,
        thighs: Number(thighs) || 0,
        shoulders: Number(shoulders) || 0,
        weight: Number(weight) || 0,
        bodyFat: Number(bodyFat) || 0,
        notes: notes.trim(),
        recordedBy: 'FitCore Admin / Coach',
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
        <h2 className="font-display text-2xl font-bold text-white mb-4">
          Record Member Body Measurements
        </h2>
        <form onSubmit={handleAddProgress} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
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
              <label className="block text-xs text-[#858585] mb-1">Measurement Date</label>
              <input
                type="date"
                required
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#858585] mb-1">Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Monthly assessment"
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Weight (kg)', val: weight, set: setWeight },
              { label: 'Body Fat (%)', val: bodyFat, set: setBodyFat },
              { label: 'Chest (cm)', val: chest, set: setChest },
              { label: 'Biceps (cm)', val: biceps, set: setBiceps },
              { label: 'Waist (cm)', val: waist, set: setWaist },
              { label: 'Thighs (cm)', val: thighs, set: setThighs },
              { label: 'Shoulders (cm)', val: shoulders, set: setShoulders },
              { label: 'Full Body Score', val: fullBody, set: setFullBody },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs text-[#858585] mb-1">{field.label}</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={field.val}
                  onChange={(e) => field.set(e.target.value)}
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-sm font-mono text-white tabular-nums"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving || members.length === 0}
            className="px-6 py-2.5 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-50 text-white text-sm font-semibold rounded"
          >
            {saving ? 'Saving...' : 'Save Progress Snapshot'}
          </button>
        </form>
      </div>

      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-display text-2xl font-bold text-white">Recorded Measurements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-[#858585]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-3 text-right">Weight</th>
                <th className="py-3 px-3 text-right">Body Fat</th>
                <th className="py-3 px-3 text-right">Chest</th>
                <th className="py-3 px-3 text-right">Biceps</th>
                <th className="py-3 px-3 text-right">Waist</th>
                <th className="py-3 px-3 text-right">Thighs</th>
                <th className="py-3 px-3 text-right">Shoulders</th>
                <th className="py-3 px-3 text-right">Full Body</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-mono tabular-nums">
              {[...progressRecords].reverse().map((r) => (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="py-3 px-4">{r.measurementDate}</td>
                  <td className="py-3 px-4 font-sans font-semibold text-white">{r.memberName}</td>
                  <td className="py-3 px-3 text-right">{r.weight} kg</td>
                  <td className="py-3 px-3 text-right">{r.bodyFat}%</td>
                  <td className="py-3 px-3 text-right">{r.chest}</td>
                  <td className="py-3 px-3 text-right">{r.biceps}</td>
                  <td className="py-3 px-3 text-right">{r.waist}</td>
                  <td className="py-3 px-3 text-right">{r.thighs}</td>
                  <td className="py-3 px-3 text-right">{r.shoulders}</td>
                  <td className="py-3 px-3 text-right">{r.fullBody}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
