import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { FITCORE_IMAGES } from '../../lib/assets';
import { formatPKR } from '../../lib/currency';
import {
  DEFAULT_ABOUT_CONTENT,
  DEFAULT_CONTACT_CONTENT,
  deleteClass,
  deleteFacility,
  deleteShopProduct,
  getSiteContent,
  saveClass,
  saveFacility,
  saveShopProduct,
  saveSiteContent,
} from '../../services/fitcoreDb';
import type {
  AboutContent,
  ContactContent,
  Facility,
  FitnessClass,
  ShopProduct,
} from '../../types/fitcore';
import { SafeImage } from '../common/SafeImage';
import { ImagePickerInput } from './ImagePickerInput';

interface AdminWebsiteContentProps {
  facilities: Facility[];
  classes: FitnessClass[];
  products: ShopProduct[];
  onRefresh: () => void;
}

type ContentTab = 'about' | 'facilities' | 'classes' | 'shop' | 'contact';

export function AdminWebsiteContent({
  facilities,
  classes,
  products,
  onRefresh,
}: AdminWebsiteContentProps) {
  const [subTab, setSubTab] = useState<ContentTab>('facilities');
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [contact, setContact] = useState<ContactContent>(DEFAULT_CONTACT_CONTENT);
  const [editFacility, setEditFacility] = useState<Partial<Facility> | null>(null);
  const [editClass, setEditClass] = useState<Partial<FitnessClass> | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<ShopProduct> | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    getSiteContent<AboutContent>('about', DEFAULT_ABOUT_CONTENT).then(setAbout);
    getSiteContent<ContactContent>('contact', DEFAULT_CONTACT_CONTENT).then(setContact);
  }, []);

  const notifySaved = (msg: string) => {
    setFeedback(msg);
    onRefresh();
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSiteContent('about', about as unknown as Record<string, unknown>);
      notifySaved('About Us, Branches, and Achievements saved to live website.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSiteContent('contact', contact as unknown as Record<string, unknown>);
      notifySaved('Contact Information updated across public pages & footer.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFacility) return;
    setSaving(true);
    try {
      await saveFacility(editFacility.id || null, {
        name: editFacility.name || '',
        category: editFacility.category || 'Strength',
        description: editFacility.description || '',
        benefits: editFacility.benefits || [],
        imageUrl: editFacility.imageUrl || FITCORE_IMAGES.facilityStrength,
        sortOrder: Number(editFacility.sortOrder) || facilities.length + 1,
        isActive: editFacility.isActive !== false,
      });
      setEditFacility(null);
      notifySaved('Facility saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editClass) return;
    setSaving(true);
    try {
      await saveClass(editClass.id || null, {
        name: editClass.name || '',
        description: editClass.description || '',
        duration: editClass.duration || '60 Min',
        difficultyLevel: editClass.difficultyLevel || 'All Levels',
        schedule: editClass.schedule || '',
        imageUrl: editClass.imageUrl || FITCORE_IMAGES.classTraining,
        isActive: editClass.isActive !== false,
      });
      setEditClass(null);
      notifySaved('Class saved.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    setSaving(true);
    try {
      await saveShopProduct(editProduct.id || null, {
        name: editProduct.name || '',
        brand: editProduct.brand || 'FitCore Nutrition',
        description: editProduct.description || '',
        price: Number(editProduct.price) || 0,
        category: editProduct.category || 'Whey & Protein',
        stock: Number(editProduct.stock) || 0,
        imageUrl: editProduct.imageUrl || FITCORE_IMAGES.shopWhey,
        isFeatured: Boolean(editProduct.isFeatured),
        isAvailable: editProduct.isAvailable !== false,
      });
      setEditProduct(null);
      notifySaved('Shop product updated on public Shop page.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {(
          [
            ['facilities', 'Facilities'],
            ['classes', 'Classes'],
            ['shop', 'Shop Products'],
            ['about', 'About Us / Branches / Awards'],
            ['contact', 'Contact Info'],
          ] as [ContentTab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSubTab(key)}
            className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
              subTab === key
                ? 'bg-[#E51C2A] text-white'
                : 'bg-[#1B1B1B] text-[#858585] hover:text-white border border-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="p-3.5 bg-[#1B1B1B] border border-emerald-500/40 rounded text-xs text-emerald-300">
          {feedback}
        </div>
      )}

      {/* FACILITIES */}
      {subTab === 'facilities' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl font-bold">Manage Facilities</h2>
            <button
              type="button"
              onClick={() =>
                setEditFacility({
                  name: '',
                  category: 'Strength',
                  description: '',
                  benefits: ['Commercial equipment'],
                  imageUrl: FITCORE_IMAGES.facilityStrength,
                  sortOrder: facilities.length + 1,
                  isActive: true,
                })
              }
              className="px-4 py-2 bg-[#E51C2A] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Facility</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facilities.map((f) => (
              <div
                key={f.id}
                className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden"
              >
                <div className="aspect-[4/3]">
                  <SafeImage src={f.imageUrl} alt={f.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-[#E51C2A]">{f.category}</p>
                  <h3 className="font-display text-xl font-bold">{f.name}</h3>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditFacility({ ...f })}
                      className="flex-1 py-1.5 bg-[#111111] text-xs rounded inline-flex items-center justify-center gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteFacility(f.id);
                        notifySaved('Facility removed.');
                      }}
                      className="p-1.5 bg-[#111111] text-[#E51C2A] rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLASSES */}
      {subTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl font-bold">Manage Classes</h2>
            <button
              type="button"
              onClick={() =>
                setEditClass({
                  name: '',
                  description: '',
                  duration: '60 Min',
                  difficultyLevel: 'All Levels',
                  schedule: 'Mon, Wed, Fri · 6:00 PM',
                  imageUrl: FITCORE_IMAGES.classTraining,
                  isActive: true,
                })
              }
              className="px-4 py-2 bg-[#E51C2A] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Class</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((c) => (
              <div
                key={c.id}
                className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden"
              >
                <div className="aspect-[4/3]">
                  <SafeImage src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-[#E51C2A]">
                    {c.duration} · {c.difficultyLevel}
                  </p>
                  <h3 className="font-display text-xl font-bold">{c.name}</h3>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditClass({ ...c })}
                      className="flex-1 py-1.5 bg-[#111111] text-xs rounded inline-flex items-center justify-center gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteClass(c.id);
                        notifySaved('Class deleted.');
                      }}
                      className="p-1.5 bg-[#111111] text-[#E51C2A] rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SHOP PRODUCTS */}
      {subTab === 'shop' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-2xl font-bold">Manage Shop Products</h2>
            <button
              type="button"
              onClick={() =>
                setEditProduct({
                  name: '',
                  brand: 'FitCore Nutrition',
                  description: '',
                  price: 6500,
                  category: 'Whey & Protein',
                  stock: 20,
                  imageUrl: FITCORE_IMAGES.shopWhey,
                  isFeatured: true,
                  isAvailable: true,
                })
              }
              className="px-4 py-2 bg-[#E51C2A] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-[#111111]">
                  <SafeImage src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-[#858585]">
                    {p.brand} · {p.category}
                  </p>
                  <h3 className="font-display text-xl font-bold">{p.name}</h3>
                  <p className="text-sm font-mono text-[#E51C2A] tabular-nums">
                    {formatPKR(p.price)} · Stock: {p.stock}
                  </p>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditProduct({ ...p })}
                      className="flex-1 py-1.5 bg-[#111111] text-xs rounded inline-flex items-center justify-center gap-1"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteShopProduct(p.id);
                        notifySaved('Product removed.');
                      }}
                      className="p-1.5 bg-[#111111] text-[#E51C2A] rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABOUT US, BRANCHES, ACHIEVEMENTS */}
      {subTab === 'about' && (
        <form onSubmit={handleSaveAbout} className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 space-y-5 text-sm">
          <h2 className="font-display text-2xl font-bold text-white">
            Edit About Us, Branches &amp; Achievements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#858585] mb-1">Headline</label>
              <input
                type="text"
                value={about.headline}
                onChange={(e) => setAbout({ ...about, headline: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#858585] mb-1">Ownership Section Title</label>
              <input
                type="text"
                value={about.ownershipTitle}
                onChange={(e) => setAbout({ ...about, ownershipTitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Introduction</label>
            <textarea
              rows={2}
              value={about.introduction}
              onChange={(e) => setAbout({ ...about, introduction: e.target.value })}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#858585] mb-1">History</label>
              <textarea
                rows={3}
                value={about.history}
                onChange={(e) => setAbout({ ...about, history: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#858585] mb-1">Vision</label>
              <textarea
                rows={3}
                value={about.vision}
                onChange={(e) => setAbout({ ...about, vision: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#858585] mb-1">Mission</label>
              <textarea
                rows={3}
                value={about.mission}
                onChange={(e) => setAbout({ ...about, mission: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Ownership Details</label>
            <textarea
              rows={2}
              value={about.ownershipDetails}
              onChange={(e) => setAbout({ ...about, ownershipDetails: e.target.value })}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
            />
          </div>

          {/* Branches */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Branches</h3>
              <button
                type="button"
                onClick={() =>
                  setAbout({
                    ...about,
                    branches: [
                      ...about.branches,
                      { name: '', address: '', hours: '', phone: '', isPlaceholder: false },
                    ],
                  })
                }
                className="text-xs text-[#E51C2A] font-semibold"
              >
                + Add Branch
              </button>
            </div>
            {about.branches.map((b, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-[#111111] rounded">
                <input
                  type="text"
                  placeholder="Branch Name"
                  value={b.name}
                  onChange={(e) => {
                    const next = [...about.branches];
                    next[i] = { ...b, name: e.target.value, isPlaceholder: false };
                    setAbout({ ...about, branches: next });
                  }}
                  className="px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={b.address}
                  onChange={(e) => {
                    const next = [...about.branches];
                    next[i] = { ...b, address: e.target.value, isPlaceholder: false };
                    setAbout({ ...about, branches: next });
                  }}
                  className="px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Hours"
                  value={b.hours}
                  onChange={(e) => {
                    const next = [...about.branches];
                    next[i] = { ...b, hours: e.target.value };
                    setAbout({ ...about, branches: next });
                  }}
                  className="px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Phone"
                    value={b.phone}
                    onChange={(e) => {
                      const next = [...about.branches];
                      next[i] = { ...b, phone: e.target.value };
                      setAbout({ ...about, branches: next });
                    }}
                    className="flex-1 px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAbout({
                        ...about,
                        branches: about.branches.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-[#E51C2A] px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">
                Achievements, Certificates, Awards &amp; Milestones
              </h3>
              <button
                type="button"
                onClick={() =>
                  setAbout({
                    ...about,
                    achievements: [
                      ...about.achievements,
                      {
                        title: '',
                        year: '2026',
                        category: 'Award',
                        details: '',
                        isPlaceholder: false,
                      },
                    ],
                  })
                }
                className="text-xs text-[#E51C2A] font-semibold"
              >
                + Add Record
              </button>
            </div>
            {about.achievements.map((a, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 bg-[#111111] rounded">
                <input
                  type="text"
                  placeholder="Title"
                  value={a.title}
                  onChange={(e) => {
                    const next = [...about.achievements];
                    next[i] = { ...a, title: e.target.value, isPlaceholder: false };
                    setAbout({ ...about, achievements: next });
                  }}
                  className="px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs"
                />
                <select
                  value={a.category}
                  onChange={(e) => {
                    const next = [...about.achievements];
                    next[i] = {
                      ...a,
                      category: e.target.value as 'Achievement' | 'Certificate' | 'Award' | 'Milestone',
                    };
                    setAbout({ ...about, achievements: next });
                  }}
                  className="px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs"
                >
                  <option value="Achievement">Achievement</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Award">Award</option>
                  <option value="Milestone">Milestone</option>
                </select>
                <input
                  type="text"
                  placeholder="Year"
                  value={a.year}
                  onChange={(e) => {
                    const next = [...about.achievements];
                    next[i] = { ...a, year: e.target.value };
                    setAbout({ ...about, achievements: next });
                  }}
                  className="px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Details"
                    value={a.details}
                    onChange={(e) => {
                      const next = [...about.achievements];
                      next[i] = { ...a, details: e.target.value, isPlaceholder: false };
                      setAbout({ ...about, achievements: next });
                    }}
                    className="flex-1 px-2.5 py-1.5 bg-[#1B1B1B] border border-white/15 rounded text-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAbout({
                        ...about,
                        achievements: about.achievements.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-[#E51C2A] px-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#E51C2A] text-white font-semibold rounded"
          >
            {saving ? 'Saving...' : 'Save About Us Content'}
          </button>
        </form>
      )}

      {/* CONTACT INFO */}
      {subTab === 'contact' && (
        <form onSubmit={handleSaveContact} className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 space-y-4 text-sm max-w-2xl">
          <h2 className="font-display text-2xl font-bold text-white">
            Edit Gym Contact Information
          </h2>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Address</label>
            <input
              type="text"
              value={contact.address}
              onChange={(e) => setContact({ ...contact, address: e.target.value })}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#858585] mb-1">Phone</label>
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-[#858585] mb-1">Email</label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Opening Hours</label>
            <input
              type="text"
              value={contact.openingHours}
              onChange={(e) => setContact({ ...contact, openingHours: e.target.value })}
              className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#E51C2A] text-white font-semibold rounded"
          >
            {saving ? 'Saving...' : 'Save Contact Info'}
          </button>
        </form>
      )}

      {/* FACILITY MODAL */}
      {editFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-bold">Facility Editor</h3>
              <button type="button" onClick={() => setEditFacility(null)}>
                <X className="h-5 w-5 text-[#858585]" />
              </button>
            </div>
            <form onSubmit={handleSaveFacility} className="space-y-4 text-sm">
              <input
                type="text"
                required
                placeholder="Facility Name"
                value={editFacility.name || ''}
                onChange={(e) => setEditFacility({ ...editFacility, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
              <input
                type="text"
                required
                placeholder="Category"
                value={editFacility.category || ''}
                onChange={(e) => setEditFacility({ ...editFacility, category: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
              <ImagePickerInput
                label="Facility Photo"
                value={editFacility.imageUrl || FITCORE_IMAGES.facilityStrength}
                onChange={(url) => setEditFacility({ ...editFacility, imageUrl: url })}
              />
              <textarea
                rows={3}
                required
                placeholder="Description"
                value={editFacility.description || ''}
                onChange={(e) =>
                  setEditFacility({ ...editFacility, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
              <textarea
                rows={3}
                placeholder="Member Benefits (one per line)"
                value={(editFacility.benefits || []).join('\n')}
                onChange={(e) =>
                  setEditFacility({ ...editFacility, benefits: e.target.value.split('\n') })
                }
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-[#E51C2A] text-white font-semibold rounded"
              >
                {saving ? 'Saving...' : 'Save Facility'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CLASS MODAL */}
      {editClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-bold">Class Editor</h3>
              <button type="button" onClick={() => setEditClass(null)}>
                <X className="h-5 w-5 text-[#858585]" />
              </button>
            </div>
            <form onSubmit={handleSaveClass} className="space-y-4 text-sm">
              <input
                type="text"
                required
                placeholder="Class Name"
                value={editClass.name || ''}
                onChange={(e) => setEditClass({ ...editClass, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Duration (e.g. 60 Min)"
                  value={editClass.duration || ''}
                  onChange={(e) => setEditClass({ ...editClass, duration: e.target.value })}
                  className="px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                />
                <select
                  value={editClass.difficultyLevel || 'All Levels'}
                  onChange={(e) =>
                    setEditClass({
                      ...editClass,
                      difficultyLevel: e.target.value as FitnessClass['difficultyLevel'],
                    })
                  }
                  className="px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Schedule (e.g. Mon, Wed, Fri · 7:00 PM)"
                value={editClass.schedule || ''}
                onChange={(e) => setEditClass({ ...editClass, schedule: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
              <ImagePickerInput
                label="Class Photo"
                value={editClass.imageUrl || FITCORE_IMAGES.classTraining}
                onChange={(url) => setEditClass({ ...editClass, imageUrl: url })}
              />
              <textarea
                rows={3}
                required
                placeholder="Description"
                value={editClass.description || ''}
                onChange={(e) => setEditClass({ ...editClass, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-[#E51C2A] text-white font-semibold rounded"
              >
                {saving ? 'Saving...' : 'Save Class'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {editProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg bg-[#1B1B1B] border border-white/15 rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-display text-2xl font-bold">Product Editor</h3>
              <button type="button" onClick={() => setEditProduct(null)}>
                <X className="h-5 w-5 text-[#858585]" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <input
                type="text"
                required
                placeholder="Product Name"
                value={editProduct.name || ''}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Brand"
                  value={editProduct.brand || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                  className="px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                />
                <input
                  type="text"
                  required
                  placeholder="Category"
                  value={editProduct.category || ''}
                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                  className="px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    required
                    value={editProduct.price ?? 0}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#858585] mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={editProduct.stock ?? 0}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, stock: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white tabular-nums"
                  />
                </div>
              </div>
              <ImagePickerInput
                label="Product Photo"
                value={editProduct.imageUrl || FITCORE_IMAGES.shopWhey}
                onChange={(url) => setEditProduct({ ...editProduct, imageUrl: url })}
              />
              <textarea
                rows={3}
                required
                placeholder="Description"
                value={editProduct.description || ''}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#111111] border border-white/15 rounded text-white"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-[#E51C2A] text-white font-semibold rounded"
              >
                {saving ? 'Saving...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
