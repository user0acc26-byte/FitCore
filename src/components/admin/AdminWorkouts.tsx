import React, { useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { deleteWorkoutPlan, saveWorkoutPlan } from '../../services/fitcoreDb';
import type { Member, Trainer, WorkoutExercise, WorkoutPlan } from '../../types/fitcore';

interface AdminWorkoutsProps {
  workoutPlans: WorkoutPlan[];
  members: Member[];
  trainers: Trainer[];
  onRefresh: () => void;
}

export function AdminWorkouts({
  workoutPlans,
  members,
  trainers,
  onRefresh,
}: AdminWorkoutsProps) {
  const [editing, setEditing] = useState<Partial<WorkoutPlan> | null>(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing({
      memberId: members[0]?.id || '',
      title: 'Hypertrophy 4-Day Split',
      trainerName: trainers[0]?.fullName || 'FitCore Coach',
      trainerNotes: 'Focus on controlled eccentric tempo and 90-second rest periods.',
      exercises: [
        {
          exerciseName: 'Barbell Bench Press',
          trainingDay: 'Day 1 - Chest & Triceps',
          sets: '4',
          reps: '8-10',
          instructions: 'Keep shoulder blades retracted and touch lower chest lightly.',
        },
      ],
    });
  };

  const addExerciseRow = () => {
    if (!editing) return;
    const next: WorkoutExercise[] = [
      ...(editing.exercises || []),
      {
        exerciseName: '',
        trainingDay: 'Day 1',
        sets: '3',
        reps: '10',
        instructions: '',
      },
    ];
    setEditing({ ...editing, exercises: next });
  };

  const updateExercise = (idx: number, patch: Partial<WorkoutExercise>) => {
    if (!editing?.exercises) return;
    const next = editing.exercises.map((ex, i) => (i === idx ? { ...ex, ...patch } : ex));
    setEditing({ ...editing, exercises: next });
  };

  const removeExercise = (idx: number) => {
    if (!editing?.exercises) return;
    setEditing({
      ...editing,
      exercises: editing.exercises.filter((_, i) => i !== idx),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.memberId) return;
    const m = members.find((x) => x.id === editing.memberId);
    if (!m) return;

    setSaving(true);
    try {
      const now = new Date().toISOString();
      await saveWorkoutPlan(editing.id || null, {
        memberId: m.id,
        memberUid: m.authUid,
        memberEmail: m.email,
        memberName: `${m.firstName} ${m.lastName}`,
        title: editing.title || 'Custom Workout Plan',
        trainerName: editing.trainerName || 'FitCore Coach',
        trainerNotes: editing.trainerNotes || '',
        exercises: (editing.exercises || []).filter((ex) => ex.exerciseName.trim()),
        createdAt: editing.createdAt || now,
        updatedAt: now,
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
        <h2 className="font-display text-2xl font-bold text-white">Member Workout Plans</h2>
        <button
          type="button"
          onClick={openNew}
          disabled={members.length === 0}
          className="px-4 py-2 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-50 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workout Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workoutPlans.length === 0 ? (
          <div className="md:col-span-2 bg-[#1B1B1B] border border-white/10 rounded-lg p-10 text-center text-sm text-[#858585]">
            No workout plans assigned yet.
          </div>
        ) : (
          workoutPlans.map((wp) => (
            <div
              key={wp.id}
              className="bg-[#1B1B1B] border border-white/10 rounded-lg p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#858585] mb-1">
                  <span className="text-[#E51C2A] font-semibold">{wp.memberName}</span>
                  <span className="font-mono">{wp.exercises.length} Exercises</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">{wp.title}</h3>
                <p className="text-xs text-[#858585] mt-1">Coach: {wp.trainerName}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditing({ ...wp })}
                  className="flex-1 py-1.5 bg-[#111111] hover:bg-white/10 text-xs text-white rounded inline-flex items-center justify-center gap-1"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Plan</span>
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await deleteWorkoutPlan(wp.id);
                    onRefresh();
                  }}
                  className="p-1.5 bg-[#111111] hover:bg-[#E51C2A]/20 text-[#E51C2A] rounded"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-bold text-white">
                {editing.id ? 'Update Workout Plan' : 'Create Workout Plan'}
              </h3>
              <button type="button" onClick={() => setEditing(null)}>
                <X className="h-5 w-5 text-[#858585]" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <label className="block text-xs text-[#858585] mb-1">Plan Title</label>
                  <input
                    type="text"
                    required
                    value={editing.title || ''}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Trainer Name</label>
                  <input
                    type="text"
                    required
                    value={editing.trainerName || ''}
                    onChange={(e) => setEditing({ ...editing, trainerName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#858585] mb-1">Trainer Notes</label>
                <textarea
                  rows={2}
                  value={editing.trainerNotes || ''}
                  onChange={(e) => setEditing({ ...editing, trainerNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Exercises</span>
                  <button
                    type="button"
                    onClick={addExerciseRow}
                    className="px-3 py-1.5 bg-[#111111] hover:bg-white/10 text-xs text-[#E51C2A] font-semibold rounded"
                  >
                    + Add Exercise
                  </button>
                </div>

                {(editing.exercises || []).map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#111111] border border-white/10 rounded space-y-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Training Day"
                        value={ex.trainingDay}
                        onChange={(e) => updateExercise(idx, { trainingDay: e.target.value })}
                        className="px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Exercise Name"
                        value={ex.exerciseName}
                        onChange={(e) => updateExercise(idx, { exerciseName: e.target.value })}
                        className="px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs text-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Sets (e.g. 4)"
                        value={ex.sets}
                        onChange={(e) => updateExercise(idx, { sets: e.target.value })}
                        className="px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs text-white"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Reps (e.g. 8-12)"
                          value={ex.reps}
                          onChange={(e) => updateExercise(idx, { reps: e.target.value })}
                          className="flex-1 px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeExercise(idx)}
                          className="p-1.5 text-[#E51C2A] hover:bg-white/10 rounded"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Exercise Instructions"
                      value={ex.instructions}
                      onChange={(e) => updateExercise(idx, { instructions: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs text-white"
                    />
                  </div>
                ))}
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
                  {saving ? 'Saving...' : 'Save Workout Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
