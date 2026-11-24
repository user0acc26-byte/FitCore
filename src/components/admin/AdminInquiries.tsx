import { UserPlus } from 'lucide-react';
import { updateInquiryStatus } from '../../services/fitcoreDb';
import type { Inquiry } from '../../types/fitcore';

interface AdminInquiriesProps {
  inquiries: Inquiry[];
  onConvertRegistration: (inq: Inquiry) => void;
  onRefresh: () => void;
}

export function AdminInquiries({
  inquiries,
  onConvertRegistration,
  onRefresh,
}: AdminInquiriesProps) {
  const handleStatus = async (inq: Inquiry, status: Inquiry['status']) => {
    await updateInquiryStatus(inq.id, status, inq);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-white">
          Contact Inquiries &amp; Membership Requests
        </h2>
        <span className="text-xs font-mono text-[#858585] tabular-nums">
          {inquiries.length} Total Records
        </span>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-12 text-center text-sm text-[#858585]">
          No inquiries or membership registration requests received yet.
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <article
              key={inq.id}
              className="bg-[#1B1B1B] border border-white/10 rounded-lg p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-[#E51C2A]">
                    {inq.type === 'membership_registration'
                      ? 'Membership Registration'
                      : 'Contact Form'}
                  </span>
                  <span aria-hidden="true" className="text-[#858585]">
                    ·
                  </span>
                  <span className="font-mono text-[#858585] tabular-nums">
                    {inq.createdAt.slice(0, 10)}
                  </span>
                  <span aria-hidden="true" className="text-[#858585]">
                    ·
                  </span>
                  <span className="uppercase font-semibold text-white">{inq.status}</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white">{inq.name}</h3>
                <p className="text-xs text-[#858585] font-mono">
                  {inq.email} · {inq.phone}
                  {inq.requestedPlanName ? ` · Plan: ${inq.requestedPlanName}` : ''}
                </p>
                {inq.message && (
                  <p className="text-sm text-white/90 pt-1 max-w-2xl">{inq.message}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {inq.type === 'membership_registration' && inq.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => onConvertRegistration(inq)}
                    className="px-4 py-2 bg-[#E51C2A] hover:bg-[#c81622] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Approve &amp; Convert to Member</span>
                  </button>
                )}
                <select
                  value={inq.status}
                  onChange={(e) => void handleStatus(inq, e.target.value as Inquiry['status'])}
                  className="px-3 py-2 bg-[#111111] border border-white/15 rounded text-xs text-white"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="approved">Approved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
