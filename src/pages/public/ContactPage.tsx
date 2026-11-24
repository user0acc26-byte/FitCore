import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Instagram,
  Facebook,
  Youtube,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  DEFAULT_CONTACT_CONTENT,
  getSiteContent,
  submitInquiry,
} from '../../services/fitcoreDb';
import type { ContactContent } from '../../types/fitcore';

export function ContactPage() {
  const [searchParams] = useSearchParams();
  const productParam = searchParams.get('product');
  const planParam = searchParams.get('plan');
  const { websiteUser } = useAuth();

  const [contact, setContact] = useState<ContactContent>(DEFAULT_CONTACT_CONTENT);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState(
    productParam
      ? `I would like to reserve or inquire about: ${productParam}`
      : planParam
      ? `I would like to visit FitCore and inquire about the ${planParam} membership package.`
      : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (websiteUser) {
      setName((prev) => prev || websiteUser.fullName);
      setEmail((prev) => prev || websiteUser.email);
      setPhone((prev) => prev || websiteUser.phone);
    }
  }, [websiteUser]);

  useEffect(() => {
    getSiteContent<ContactContent>('contact', DEFAULT_CONTACT_CONTENT)
      .then(setContact)
      .catch(() => setContact(DEFAULT_CONTACT_CONTENT));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (phone.trim().length < 5) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (message.trim().length < 5) {
      setError('Please enter a message (at least 5 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await submitInquiry({
        type: 'contact',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        message: message.trim(),
        requestedPlanId: '',
        requestedPlanName: '',
        age: 0,
        gender: '',
      });
      setSent(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#111111] text-white min-h-[75vh]">
      <section className="border-b border-white/10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
            Get In Touch
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold mb-4">Contact FitCore</h1>
          <p className="text-base text-[#858585] max-w-2xl">
            Have a question about memberships, personal coaching, or facility hours? Send a direct
            message to our management team.
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details + Map Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-7 space-y-5">
              <h2 className="font-display text-3xl font-bold">Gym Information</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#E51C2A] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Gym Address</p>
                    <p className="text-[#858585]">{contact.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[#E51C2A] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Phone Number</p>
                    <p className="text-[#858585] tabular-nums">{contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#E51C2A] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Email</p>
                    <p className="text-[#858585]">{contact.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-[#E51C2A] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Opening Hours</p>
                    <p className="text-[#858585]">{contact.openingHours}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#858585] mb-3">
                  Social Channels
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={contact.instagramUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#111111] border border-white/10 rounded hover:border-[#E51C2A] transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href={contact.facebookUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#111111] border border-white/10 rounded hover:border-[#E51C2A] transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a
                    href={contact.youtubeUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#111111] border border-white/10 rounded hover:border-[#E51C2A] transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#E51C2A] mb-2">
                Location
              </p>
              <h3 className="font-display text-2xl font-bold mb-2">{contact.mapLabel}</h3>
              <p className="text-sm text-[#858585] leading-relaxed">{contact.address}</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-[#1B1B1B] border border-white/10 rounded-lg p-8">
            <h2 className="font-display text-3xl font-bold mb-2">Send Us a Message</h2>
            <p className="text-sm text-[#858585] mb-6">
              Submitted inquiries are saved directly to the FitCore Admin Dashboard.
            </p>

            {sent ? (
              <div className="p-8 bg-[#111111] border border-white/10 rounded-lg text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-[#E51C2A] mx-auto" />
                <h3 className="font-display text-2xl font-bold">Inquiry Submitted</h3>
                <p className="text-sm text-[#858585]">
                  Thank you for contacting FitCore. Our team has received your inquiry in the Admin
                  Dashboard and will respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-2 px-5 py-2.5 bg-[#E51C2A] hover:bg-[#c81622] text-white text-sm font-semibold rounded transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 bg-[#E51C2A]/15 border border-[#E51C2A]/40 rounded text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#858585] mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Usman Ali"
                      className="w-full px-4 py-3 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#858585] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usman@example.com"
                      className="w-full px-4 py-3 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#858585] mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-3 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#858585] mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about memberships, personal training, or visiting FitCore..."
                    className="w-full px-4 py-3 bg-[#111111] border border-white/15 rounded text-sm text-white focus:outline-none focus:border-[#E51C2A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-7 py-3 bg-[#E51C2A] hover:bg-[#c81622] disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
