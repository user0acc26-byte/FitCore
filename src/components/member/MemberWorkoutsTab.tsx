import { Dumbbell, ShieldAlert } from 'lucide-react';
import type { WorkoutPlan } from '../../types/fitcore';

interface MemberWorkoutsTabProps {
  plans: WorkoutPlan[];
}

export function MemberWorkoutsTab({ plans }: MemberWorkoutsTabProps) {
  if (plans.length === 0) {
    return (
      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-12 text-center">
        <Dumbbell className="h-8 w-8 text-[#E51C2A] mx-auto mb-3" />
        <p className="text-sm text-[#858585]">
          No workout plan has been assigned to your account yet. Your trainer or administrator will
          publish your program soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {plans.map((plan) => (
        <section
          key={plan.id}
          className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[#E51C2A] font-semibold">
                Assigned Coach: {plan.trainerName || 'FitCore Coaching Staff'}
              </p>
              <h2 className="font-display text-3xl font-bold text-white">{plan.title}</h2>
            </div>
            <span className="text-xs font-mono text-[#858585] tabular-nums">
              Updated {plan.updatedAt.slice(0, 10)}
            </span>
          </div>

          {plan.trainerNotes && (
            <div className="px-6 py-4 bg-[#111111] border-b border-white/10 text-sm text-[#858585]">
              <span className="text-white font-semibold">Trainer Notes: </span>
              {plan.trainerNotes}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#111111] text-xs text-[#858585]">
                <tr>
                  <th className="py-3 px-6">Training Day</th>
                  <th className="py-3 px-4">Exercise Name</th>
                  <th className="py-3 px-4 text-right">Sets</th>
                  <th className="py-3 px-4 text-right">Repetitions</th>
                  <th className="py-3 px-6">Exercise Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {plan.exercises.map((ex, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-3.5 px-6 font-medium text-[#E51C2A] whitespace-nowrap">
                      {ex.trainingDay}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">{ex.exerciseName}</td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">{ex.sets}</td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums">{ex.reps}</td>
                    <td className="py-3.5 px-6 text-xs text-[#858585]">{ex.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-4 flex items-start gap-3 text-xs text-[#858585]">
        <ShieldAlert className="h-4 w-4 text-[#E51C2A] shrink-0 mt-0.5" />
        <p>Workout plans are managed by FitCore coaches and administrators (read-only view).</p>
      </div>
    </div>
  );
}
