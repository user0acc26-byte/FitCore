import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { BrandMark } from '../components/common/BrandMark';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_CONTACT_CONTENT, getSiteContent } from '../services/fitcoreDb';
import type { ContactContent } from '../types/fitcore';

const NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Facilities', to: '/facilities' },
  { label: 'Memberships', to: '/memberships' },
  { label: 'Classes', to: '/classes' },
  { label: 'Shop', to: '/shop' },
  { label: 'Contact Us', to: '/contact' },
];

export function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contact, setContact] = useState<ContactContent>(DEFAULT_CONTACT_CONTENT);
  const { role, websiteUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getSiteContent<ContactContent>('contact', DEFAULT_CONTACT_CONTENT)
      .then(setContact)
      .catch(() => setContact(DEFAULT_CONTACT_CONTENT));
  }, []);

  const portalPath =
    role === 'admin'
      ? '/admin'
      : role === 'member'
      ? '/member'
      : role === 'user'
      ? '/account'
      : '/login';
  const portalLabel =
    role === 'admin'
      ? 'Admin Panel'
      : role === 'member'
      ? 'Member Portal'
      : role === 'user'
      ? websiteUser?.fullName.split(' ')[0] || 'My Account'
      : 'Login';

  return (
    <div className="min-h-screen flex flex-col bg-[#111111] text-white">
      <header className="sticky top-0 z-40 bg-[#111111]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          <Link to="/" className="shrink-0 focus-visible:outline-2 focus-visible:outline-[#E51C2A]">
            <BrandMark />
          </Link>

          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors ${
                    isActive
                      ? 'text-white border-[#E51C2A]'
                      : 'text-[#858585] border-transparent hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {role === 'user' && (
              <Link
                to="/login?tab=member"
                className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-white bg-[#1B1B1B] hover:bg-white/10 border border-white/15 rounded transition-colors whitespace-nowrap shrink-0"
              >
                Member Portal
              </Link>
            )}
            <button
              type="button"
              onClick={() => navigate(portalPath)}
              className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-[#E51C2A] hover:bg-[#c81622] rounded transition-colors whitespace-nowrap shrink-0"
            >
              {portalLabel}
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded transition-colors"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-[#1B1B1B] border-t border-white/10 px-4 py-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E51C2A]/15 text-white'
                      : 'text-[#858585] hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="pt-2 space-y-2">
              {role === 'user' && (
                <Link
                  to="/login?tab=member"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center px-4 py-2.5 bg-[#111111] border border-white/15 text-white text-sm font-semibold rounded transition-colors"
                >
                  Member Portal Login
                </Link>
              )}
              <Link
                to={portalPath}
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2.5 bg-[#E51C2A] hover:bg-[#c81622] text-white text-sm font-semibold rounded transition-colors"
              >
                {portalLabel}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#0B0B0B] border-t border-white/10 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <BrandMark />
            <p className="text-sm text-[#858585] leading-relaxed">
              Structured strength training, calibrated commercial equipment, and unified member
              coaching built around measurable progression.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm text-[#858585]">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Login Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide mb-4">
              Contact Information
            </h3>
            <ul className="space-y-3 text-sm text-[#858585]">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#E51C2A] shrink-0 mt-0.5" />
                <span>{contact.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#E51C2A] shrink-0" />
                <span className="tabular-nums">{contact.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#E51C2A] shrink-0" />
                <span>{contact.email}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wide mb-4">
              Follow FitCore
            </h3>
            <p className="text-sm text-[#858585] mb-4">{contact.openingHours}</p>
            <div className="flex items-center gap-3">
              <a
                href={contact.instagramUrl || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="FitCore Instagram"
                className="p-2.5 bg-[#1B1B1B] border border-white/10 rounded hover:border-[#E51C2A] text-white transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={contact.facebookUrl || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="FitCore Facebook"
                className="p-2.5 bg-[#1B1B1B] border border-white/10 rounded hover:border-[#E51C2A] text-white transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={contact.youtubeUrl || '#'}
                target="_blank"
                rel="noreferrer"
                aria-label="FitCore YouTube"
                className="p-2.5 bg-[#1B1B1B] border border-white/10 rounded hover:border-[#E51C2A] text-white transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#858585]">
            <p>© {new Date().getFullYear()} FitCore Gym & Performance Center. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link to="/contact" className="hover:text-white transition-colors">
                Member Inquiries
              </Link>
              <Link to="/login" className="hover:text-white transition-colors">
                Portal Access
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
