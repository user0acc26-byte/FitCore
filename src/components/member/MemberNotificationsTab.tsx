import { Bell, Check } from 'lucide-react';
import { markNotificationRead } from '../../services/fitcoreDb';
import type { MemberNotification, WebsiteAnnouncement } from '../../types/fitcore';

interface MemberNotificationsTabProps {
  notifications: MemberNotification[];
  announcements: WebsiteAnnouncement[];
}

const TYPE_LABELS: Record<MemberNotification['type'], string> = {
  expiry_reminder: 'Membership Expiry Reminder',
  payment_due: 'Payment Due',
  schedule_update: 'Training Schedule Update',
  trainer_update: 'Trainer Assignment Update',
  announcement: 'Gym Announcement',
};

export function MemberNotificationsTab({
  notifications,
  announcements,
}: MemberNotificationsTabProps) {
  const sorted = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      {announcements.length > 0 && (
        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 space-y-4">
          <h2 className="font-display text-2xl font-bold text-white">Gym-Wide Announcements</h2>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="bg-[#111111] border border-white/10 rounded p-4 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-semibold text-[#E51C2A] mb-1">
                    {a.createdAt.slice(0, 10)} · Announcement
                  </p>
                  <h3 className="text-sm font-semibold text-white">{a.title}</h3>
                  <p className="text-sm text-[#858585] mt-1">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-white">Personal Notifications</h2>
          <span className="text-xs font-mono text-[#858585] tabular-nums">
            {sorted.filter((n) => !n.isRead).length} unread
          </span>
        </div>

        {sorted.length === 0 ? (
          <div className="py-10 text-center">
            <Bell className="h-8 w-8 text-[#858585] mx-auto mb-2" />
            <p className="text-sm text-[#858585]">No personal notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  notif.isRead
                    ? 'bg-[#111111] border-white/10'
                    : 'bg-[#111111] border-[#E51C2A]/60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold text-[#E51C2A]">
                      {TYPE_LABELS[notif.type] || 'Update'}
                    </span>
                    <span aria-hidden="true" className="text-[#858585]">
                      ·
                    </span>
                    <span className="font-mono text-[#858585] tabular-nums">
                      {notif.createdAt.slice(0, 10)}
                    </span>
                    {!notif.isRead && (
                      <>
                        <span aria-hidden="true" className="text-[#858585]">
                          ·
                        </span>
                        <span className="text-white font-semibold">Unread</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-white">{notif.title}</h3>
                  <p className="text-sm text-[#858585]">{notif.message}</p>
                </div>

                {!notif.isRead && (
                  <button
                    type="button"
                    onClick={() => void markNotificationRead(notif)}
                    className="px-3.5 py-2 bg-[#1B1B1B] hover:bg-[#E51C2A] border border-white/15 hover:border-[#E51C2A] text-white text-xs font-semibold rounded transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Mark Read</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
