import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  deleteAnnouncement,
  saveAnnouncement,
  sendMemberNotification,
} from '../../services/fitcoreDb';
import type {
  Member,
  MemberNotification,
  WebsiteAnnouncement,
} from '../../types/fitcore';

interface AdminNotificationsProps {
  members: Member[];
  notifications: MemberNotification[];
  announcements: WebsiteAnnouncement[];
  onRefresh: () => void;
}

export function AdminNotifications({
  members,
  notifications,
  announcements,
  onRefresh,
}: AdminNotificationsProps) {
  const [targetMemberId, setTargetMemberId] = useState(members[0]?.id || '');
  const [notifType, setNotifType] =
    useState<MemberNotification['type']>('expiry_reminder');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annAudience, setAnnAudience] = useState<'public' | 'members'>('public');
  const [saving, setSaving] = useState(false);

  const handleSendMemberNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = members.find((x) => x.id === (targetMemberId || members[0]?.id));
    if (!m) return;
    setSaving(true);
    try {
      await sendMemberNotification({
        memberId: m.id,
        memberUid: m.authUid,
        memberEmail: m.email,
        type: notifType,
        title,
        message,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      setTitle('');
      setMessage('');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAnnouncement({
        title: annTitle,
        message: annMessage,
        audience: annAudience,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      setAnnTitle('');
      setAnnMessage('');
      onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Member Notification */}
        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6">
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            Send Notification to Member
          </h2>
          <form onSubmit={handleSendMemberNotif} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs text-[#858585] mb-1">Select Member</label>
              <select
                required
                value={targetMemberId || members[0]?.id || ''}
                onChange={(e) => setTargetMemberId(e.target.value)}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} ({m.memberCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#858585] mb-1">Notification Type</label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value as MemberNotification['type'])}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              >
                <option value="expiry_reminder">Membership Expiry Reminder</option>
                <option value="payment_due">Payment Due</option>
                <option value="schedule_update">Training Schedule Update</option>
                <option value="trainer_update">Trainer Assignment Update</option>
                <option value="announcement">Gym Announcement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#858585] mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Membership Renewal Notice"
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#858585] mb-1">Message</label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
            <button
              type="submit"
              disabled={saving || members.length === 0}
              className="px-5 py-2.5 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-50 text-white font-semibold rounded"
            >
              Send Member Notification
            </button>
          </form>
        </div>

        {/* Publish Gym-Wide Announcement */}
        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6">
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            Publish Gym-Wide Announcement
          </h2>
          <form onSubmit={handlePublishAnnouncement} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs text-[#858585] mb-1">Audience</label>
              <select
                value={annAudience}
                onChange={(e) => setAnnAudience(e.target.value as 'public' | 'members')}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              >
                <option value="public">Public Website &amp; Members</option>
                <option value="members">Member Portal Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#858585] mb-1">Headline</label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Holiday Gym Hours"
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#858585] mb-1">Announcement Text</label>
              <textarea
                rows={4}
                required
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-50 text-white font-semibold rounded"
            >
              Publish Announcement
            </button>
          </form>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 space-y-3">
          <h3 className="font-display text-2xl font-bold text-white">Recent Member Alerts</h3>
          {notifications.slice(0, 8).map((n) => (
            <div key={n.id} className="p-3 bg-[#111111] border border-white/10 rounded text-xs">
              <div className="flex justify-between text-[#858585] mb-1">
                <span className="text-[#E51C2A] font-semibold">{n.memberEmail}</span>
                <span className="font-mono">{n.createdAt.slice(0, 10)}</span>
              </div>
              <p className="font-semibold text-white">{n.title}</p>
              <p className="text-[#858585] mt-0.5">{n.message}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 space-y-3">
          <h3 className="font-display text-2xl font-bold text-white">Published Announcements</h3>
          {announcements.map((a) => (
            <div
              key={a.id}
              className="p-3 bg-[#111111] border border-white/10 rounded text-xs flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-[#E51C2A] font-semibold uppercase mb-0.5">{a.audience}</p>
                <p className="font-semibold text-white">{a.title}</p>
                <p className="text-[#858585] mt-0.5">{a.message}</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await deleteAnnouncement(a.id);
                  onRefresh();
                }}
                className="p-1.5 text-[#E51C2A] hover:bg-white/10 rounded shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
