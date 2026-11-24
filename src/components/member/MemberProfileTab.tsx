import { ShieldAlert } from 'lucide-react';
import type { Member } from '../../types/fitcore';

interface MemberProfileTabProps {
  member: Member;
}

export function MemberProfileTab({ member }: MemberProfileTabProps) {
  const fields = [
    { label: 'Full Name', value: `${member.firstName} ${member.lastName}` },
    { label: 'Member ID', value: member.memberCode, mono: true },
    { label: 'Email Address', value: member.email },
    { label: 'Phone Number', value: member.phone, mono: true },
    { label: 'Age', value: `${member.age} Years`, mono: true },
    { label: 'Date of Birth', value: member.dateOfBirth || 'Not recorded', mono: true },
    { label: 'Gender', value: member.gender },
    { label: 'Account Status', value: member.status.toUpperCase() },
    { label: 'Member Since', value: member.createdAt.slice(0, 10), mono: true },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">
              {member.firstName} {member.lastName}
            </h2>
            <p className="text-sm text-[#858585]">Official FitCore Member Record</p>
          </div>
          <span className="font-mono text-sm font-semibold text-[#E51C2A] tabular-nums">
            {member.memberCode}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((f) => (
            <div key={f.label} className="bg-[#111111] border border-white/10 rounded p-4">
              <dt className="text-xs text-[#858585] mb-1">{f.label}</dt>
              <dd
                className={`text-sm font-semibold text-white ${
                  f.mono ? 'font-mono tabular-nums' : ''
                }`}
              >
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-4 flex items-start gap-3 text-xs text-[#858585]">
        <ShieldAlert className="h-4 w-4 text-[#E51C2A] shrink-0 mt-0.5" />
        <p>
          Official member records are read-only and verified by FitCore administration. Contact
          reception if any personal detail needs correction.
        </p>
      </div>
    </div>
  );
}
