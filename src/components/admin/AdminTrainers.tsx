import React, { useState } from 'react';
import { Pencil, Plus, UserCheck, UserX, X } from 'lucide-react';
import { FITCORE_IMAGES } from '../../lib/assets';
import { saveTrainer } from '../../services/fitcoreDb';
import type { Trainer } from '../../types/fitcore';
import { SafeImage } from '../common/SafeImage';
import { ImagePickerInput } from './ImagePickerInput';

interface AdminTrainersProps {
  trainers: Trainer[];
  onRefresh: () => void;
}

export function AdminTrainers({ trainers, onRefresh }: AdminTrainersProps) {
  const [editing, setEditing] = useState<Partial<Trainer> | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await saveTrainer(editing.id || null, {
        fullName: editing.fullName || 'Coach',
        imageUrl: editing.imageUrl || FITCORE_IMAGES.trainerCoach,
        qualifications: editing.qualifications || '',
        experience: editing.experience || '',
        specialization: editing.specialization || '',
        bio: editing.bio || '',
        phone: editing.phone || '',
        status: editing.status || 'active',
      });
      setEditing(null);
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (t: Trainer) => {
    await saveTrainer(t.id, {
      ...t,
      status: t.status === 'active' ? 'inactive' : 'active',
    });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-white">Coaching Staff Directory</h2>
        <button
          type="button"
          onClick={() =>
            setEditing({
              fullName: '',
              imageUrl: FITCORE_IMAGES.trainerCoach,
              qualifications: '',
              experience: '',
              specialization: '',
              bio: '',
              phone: '',
              status: 'active',
            })
          }
          className="px-4 py-2 bg-[#E51C2A] hover:bg-[#c81622] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Add Trainer</span>
        </button>
      </div>

      {trainers.length === 0 ? (
        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-12 text-center text-sm text-[#858585]">
          No trainers added yet. Click &quot;Add Trainer&quot; to create a profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((t) => (
            <article
              key={t.id}
              className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square overflow-hidden">
                  <SafeImage
                    src={t.imageUrl}
                    alt={t.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#E51C2A] font-semibold">{t.specialization}</span>
                    <span
                      className={`font-semibold uppercase ${
                        t.status === 'active' ? 'text-emerald-400' : 'text-[#858585]'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">{t.fullName}</h3>
                  <p className="text-xs text-[#858585]">
                    {t.qualifications} · {t.experience}
                  </p>
                  <p className="text-xs text-white/80 line-clamp-3">{t.bio}</p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing({ ...t })}
                  className="flex-1 py-2 bg-[#111111] hover:bg-white/10 text-xs text-white rounded inline-flex items-center justify-center gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => void toggleStatus(t)}
                  className="px-3 py-2 bg-[#111111] hover:bg-white/10 text-xs text-white rounded inline-flex items-center gap-1"
                >
                  {t.status === 'active' ? (
                    <>
                      <UserX className="h-3.5 w-3.5 text-[#E51C2A]" />
                      <span>Deactivate</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-bold text-white">
                {editing.id ? 'Update Trainer Profile' : 'Add New Trainer'}
              </h3>
              <button type="button" onClick={() => setEditing(null)}>
                <X className="h-5 w-5 text-[#858585]" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-[#858585] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editing.fullName || ''}
                  onChange={(e) => setEditing({ ...editing, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                />
              </div>

              <ImagePickerInput
                label="Trainer Portrait"
                value={editing.imageUrl || FITCORE_IMAGES.trainerCoach}
                onChange={(url) => setEditing({ ...editing, imageUrl: url })}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Specialization</label>
                  <input
                    type="text"
                    required
                    value={editing.specialization || ''}
                    onChange={(e) => setEditing({ ...editing, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Experience</label>
                  <input
                    type="text"
                    required
                    value={editing.experience || ''}
                    onChange={(e) => setEditing({ ...editing, experience: e.target.value })}
                    placeholder="e.g. 8 Years"
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Qualifications</label>
                  <input
                    type="text"
                    required
                    value={editing.qualifications || ''}
                    onChange={(e) => setEditing({ ...editing, qualifications: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editing.phone || ''}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#858585] mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editing.bio || ''}
                  onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
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
                  {saving ? 'Saving...' : 'Save Trainer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
