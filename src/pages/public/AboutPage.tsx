import { useEffect, useState } from 'react';
import { Award, Building2, Target, Compass, Shield, Info } from 'lucide-react';
import { FITCORE_IMAGES } from '../../lib/assets';
import { SafeImage } from '../../components/common/SafeImage';
import { DEFAULT_ABOUT_CONTENT, getSiteContent, listTrainers } from '../../services/fitcoreDb';
import type { AboutContent, Trainer } from '../../types/fitcore';

export function AboutPage() {
  const [about, setAbout] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSiteContent<AboutContent>('about', DEFAULT_ABOUT_CONTENT).catch(() => DEFAULT_ABOUT_CONTENT),
      listTrainers().catch(() => []),
    ]).then(([aboutData, trainerList]) => {
      setAbout(aboutData);
      setTrainers(trainerList.filter((t) => t.status === 'active'));
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-[#111111] text-white">
      {/* Header Banner */}
      <section className="border-b border-white/10 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A]">
              About FitCore
            </p>
            <h1 className="font-display text-5xl sm:text-6xl font-extrabold leading-none text-balance">
              {about.headline}
            </h1>
            <p className="text-base text-[#858585] leading-relaxed">{about.introduction}</p>
          </div>
          <div className="lg:col-span-6">
            <div className="aspect-[16/10] rounded-lg overflow-hidden border border-white/10">
              <SafeImage
                src={FITCORE_IMAGES.facilityStrength}
                alt="FitCore strength training interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* History, Vision, Mission */}
      <section className="bg-[#F5F5F5] text-[#111111] py-16 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white border border-black/10 rounded-lg p-7">
            <Info className="h-6 w-6 text-[#E51C2A] mb-4" />
            <h2 className="font-display text-2xl font-bold mb-3">History &amp; Background</h2>
            <p className="text-sm text-[#444444] leading-relaxed">{about.history}</p>
          </div>
          <div className="bg-white border border-black/10 rounded-lg p-7">
            <Compass className="h-6 w-6 text-[#E51C2A] mb-4" />
            <h2 className="font-display text-2xl font-bold mb-3">Our Vision</h2>
            <p className="text-sm text-[#444444] leading-relaxed">{about.vision}</p>
          </div>
          <div className="bg-white border border-black/10 rounded-lg p-7">
            <Target className="h-6 w-6 text-[#E51C2A] mb-4" />
            <h2 className="font-display text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-sm text-[#444444] leading-relaxed">{about.mission}</p>
          </div>
        </div>
      </section>

      {/* Ownership & Leadership */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-[#E51C2A] font-semibold">
                <Shield className="h-4 w-4" />
                <span>Leadership</span>
              </div>
              <h2 className="font-display text-3xl font-bold text-white">{about.ownershipTitle}</h2>
              <p className="text-sm text-[#858585] leading-relaxed">{about.ownershipDetails}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="py-16 border-b border-white/10 bg-[#1B1B1B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
              Locations
            </p>
            <h2 className="font-display text-4xl font-extrabold text-white">Gym Branches</h2>
          </div>

          {loading ? (
            <div className="h-40 bg-[#111111] rounded-lg animate-pulse" />
          ) : about.branches.length === 0 ? (
            <p className="text-sm text-[#858585]">
              No branch locations added yet. Configure branches in Admin Dashboard.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {about.branches.map((branch, idx) => (
                <div
                  key={idx}
                  className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden"
                >
                  <div className="aspect-[16/9]">
                    <SafeImage
                      src={FITCORE_IMAGES.facilityCardio}
                      alt={branch.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#E51C2A]">
                      <Building2 className="h-4 w-4" />
                      <span>{branch.isPlaceholder ? 'Editable Placeholder' : 'Active Branch'}</span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white">{branch.name}</h3>
                    <p className="text-sm text-[#858585]">{branch.address}</p>
                    <p className="text-xs text-white/80">{branch.hours}</p>
                    <p className="text-xs font-mono text-[#858585] tabular-nums">{branch.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Achievements, Certificates, Awards & Milestones */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
              Recognition &amp; Standards
            </p>
            <h2 className="font-display text-4xl font-extrabold text-white">
              Achievements, Certificates, Awards &amp; Milestones
            </h2>
          </div>

          {about.achievements.length === 0 ? (
            <p className="text-sm text-[#858585]">
              No achievements or certificates published yet. Manage them in Admin Dashboard.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {about.achievements.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 flex items-start gap-4"
                >
                  <Award className="h-6 w-6 text-[#E51C2A] shrink-0 mt-1" />
                  <div className="space-y-1.5">
                    <div className="text-xs text-[#858585]">
                      <span>{item.category}</span>
                      <span className="mx-2">·</span>
                      <span className="font-mono tabular-nums">{item.year}</span>
                      {item.isPlaceholder && (
                        <>
                          <span className="mx-2">·</span>
                          <span className="text-[#E51C2A]">Editable Placeholder</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-[#858585] leading-relaxed">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Coaching Team */}
      {trainers.length > 0 && (
        <section className="py-16 bg-[#F5F5F5] text-[#111111]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
                Coaching Team
              </p>
              <h2 className="font-display text-4xl font-extrabold">Certified Trainers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainers.map((t) => (
                <div
                  key={t.id}
                  className="bg-white border border-black/10 rounded-lg overflow-hidden"
                >
                  <div className="aspect-square overflow-hidden">
                    <SafeImage
                      src={t.imageUrl}
                      alt={t.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-2">
                    <p className="text-xs font-medium text-[#E51C2A]">{t.specialization}</p>
                    <h3 className="font-display text-2xl font-bold">{t.fullName}</h3>
                    <p className="text-xs text-[#555555]">
                      {t.qualifications} · {t.experience}
                    </p>
                    <p className="text-sm text-[#444444] leading-relaxed pt-1">{t.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
