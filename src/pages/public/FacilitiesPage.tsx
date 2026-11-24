import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SafeImage } from '../../components/common/SafeImage';
import { listFacilities } from '../../services/fitcoreDb';
import type { Facility } from '../../types/fitcore';

export function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listFacilities()
      .then((rows) => {
        setFacilities(rows.filter((f) => f.isActive));
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load facilities.');
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(facilities.map((f) => f.category).filter(Boolean)))];
  const filtered =
    selectedCategory === 'All'
      ? facilities
      : facilities.filter((f) => f.category === selectedCategory);

  return (
    <div className="bg-[#111111] text-white min-h-[75vh]">
      <section className="border-b border-white/10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
            Gym Floor &amp; Equipment
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold mb-4">
            FitCore Facilities
          </h1>
          <p className="text-base text-[#858585] max-w-2xl">
            Every training zone at FitCore is organized for unobstructed lifting, progressive
            conditioning, and reliable daily recovery.
          </p>

          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 mt-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#E51C2A] text-white'
                      : 'bg-[#1B1B1B] text-[#858585] hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-[#1B1B1B] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-[#1B1B1B] border border-[#E51C2A]/40 rounded-lg text-sm">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 bg-[#1B1B1B] border border-white/10 rounded-lg text-center">
              <p className="text-sm text-[#858585]">
                No gym facilities are currently listed. Administrators can add facilities in the
                Admin Dashboard.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filtered.map((fac, idx) => (
                <article
                  key={fac.id}
                  className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch"
                >
                  <div
                    className={`lg:col-span-5 aspect-[4/3] lg:aspect-auto ${
                      idx % 2 === 1 ? 'lg:order-2' : ''
                    }`}
                  >
                    <SafeImage
                      src={fac.imageUrl}
                      alt={fac.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="lg:col-span-7 p-8 flex flex-col justify-center space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#E51C2A]">
                      {fac.category}
                    </p>
                    <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                      {fac.name}
                    </h2>
                    <p className="text-sm sm:text-base text-[#858585] leading-relaxed">
                      {fac.description}
                    </p>
                    {fac.benefits.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-semibold text-white mb-2.5">Member Benefits</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {fac.benefits.map((benefit, bIdx) => (
                            <li
                              key={bIdx}
                              className="flex items-start gap-2 text-sm text-white/90"
                            >
                              <CheckCircle2 className="h-4 w-4 text-[#E51C2A] shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
