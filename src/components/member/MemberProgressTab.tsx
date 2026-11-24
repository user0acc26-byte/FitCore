import { useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ShieldAlert } from 'lucide-react';
import type { ProgressRecord } from '../../types/fitcore';

interface MemberProgressTabProps {
  records: ProgressRecord[];
}

type MetricKey =
  | 'weight'
  | 'bodyFat'
  | 'chest'
  | 'biceps'
  | 'waist'
  | 'thighs'
  | 'shoulders'
  | 'fullBody';

const METRICS: { key: MetricKey; label: string; unit: string }[] = [
  { key: 'fullBody', label: 'Full Body', unit: 'score' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
  { key: 'biceps', label: 'Biceps', unit: 'cm' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'thighs', label: 'Thighs', unit: 'cm' },
  { key: 'shoulders', label: 'Shoulders', unit: 'cm' },
  { key: 'weight', label: 'Weight', unit: 'kg' },
  { key: 'bodyFat', label: 'Body Fat', unit: '%' },
];

export function MemberProgressTab({ records }: MemberProgressTabProps) {
  const [chartMetric, setChartMetric] = useState<MetricKey>('weight');

  const sorted = [...records].sort((a, b) =>
    a.measurementDate.localeCompare(b.measurementDate)
  );

  if (sorted.length === 0) {
    return (
      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-12 text-center">
        <p className="text-sm text-[#858585]">
          No body measurements have been logged yet. Your trainer or administrator will record your
          baseline measurements.
        </p>
      </div>
    );
  }

  const current = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;
  const activeMetricMeta = METRICS.find((m) => m.key === chartMetric)!;

  return (
    <div className="space-y-6">
      {/* Measurement Comparison Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {METRICS.map((m) => {
          const currVal = current[m.key];
          const prevVal = previous ? previous[m.key] : null;
          const delta = prevVal !== null ? Number((currVal - prevVal).toFixed(1)) : null;

          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setChartMetric(m.key)}
              className={`text-left p-4 rounded-lg border transition-colors ${
                chartMetric === m.key
                  ? 'bg-[#1B1B1B] border-[#E51C2A]'
                  : 'bg-[#1B1B1B] border-white/10 hover:border-white/25'
              }`}
            >
              <p className="text-xs text-[#858585] mb-1">{m.label}</p>
              <p className="font-display text-3xl font-extrabold text-white tabular-nums">
                {currVal}{' '}
                <span className="text-xs font-sans font-normal text-[#858585]">{m.unit}</span>
              </p>
              <p className="text-xs text-[#858585] mt-1 font-mono tabular-nums">
                {prevVal !== null ? (
                  <>
                    Prev: {prevVal} ({delta! >= 0 ? `+${delta}` : delta})
                  </>
                ) : (
                  `Logged ${current.measurementDate}`
                )}
              </p>
            </button>
          );
        })}
      </div>

      {/* Recharts Progress Chart */}
      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              {activeMetricMeta.label} Trend ({activeMetricMeta.unit})
            </h2>
            <p className="text-xs text-[#858585]">
              Click any measurement card above to compare its progression over time.
            </p>
          </div>
          <span className="text-xs font-mono text-[#858585] tabular-nums">
            Latest: {current.measurementDate}
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sorted}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis
                dataKey="measurementDate"
                stroke="#858585"
                tick={{ fill: '#858585', fontSize: 12 }}
              />
              <YAxis stroke="#858585" tick={{ fill: '#858585', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111111',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                }}
              />
              <Line
                type="monotone"
                dataKey={chartMetric}
                stroke="#E51C2A"
                strokeWidth={2.5}
                dot={{ fill: '#E51C2A', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Measurement History Table */}
      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="font-display text-2xl font-bold text-white">Measurement History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111111] text-[#858585]">
              <tr>
                <th className="py-3 px-4">Date</th>
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
            <tbody className="divide-y divide-white/10 tabular-nums font-mono">
              {[...sorted].reverse().map((row) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="py-3 px-4">{row.measurementDate}</td>
                  <td className="py-3 px-3 text-right">{row.weight} kg</td>
                  <td className="py-3 px-3 text-right">{row.bodyFat}%</td>
                  <td className="py-3 px-3 text-right">{row.chest} cm</td>
                  <td className="py-3 px-3 text-right">{row.biceps} cm</td>
                  <td className="py-3 px-3 text-right">{row.waist} cm</td>
                  <td className="py-3 px-3 text-right">{row.thighs} cm</td>
                  <td className="py-3 px-3 text-right">{row.shoulders} cm</td>
                  <td className="py-3 px-3 text-right">{row.fullBody}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-4 flex items-start gap-3 text-xs text-[#858585]">
        <ShieldAlert className="h-4 w-4 text-[#E51C2A] shrink-0 mt-0.5" />
        <p>
          Progress records are read-only and recorded by FitCore trainers or administrators during
          body assessments.
        </p>
      </div>
    </div>
  );
}
