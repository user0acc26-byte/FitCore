import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Signal } from 'lucide-react';
import { SafeImage } from '../../components/common/SafeImage';
import { listClasses } from '../../services/fitcoreDb';
import type { FitnessClass } from '../../types/fitcore';

const DIFFICULTY_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export function ClassesPage() {
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [difficulty, setDifficulty] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listClasses()
      .then((rows) => {
        setClasses(rows.filter((c) => c.isActive));
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load classes.');
        setLoading(false);
      });
  }, []);

  const filtered =
    difficulty === 'All'
      ? classes
      : classes.filter((c) => c.difficultyLevel === difficulty);

  return (
    <div className="bg-[#111111] text-white min-h-[75vh]">
      <section className="border-b border-white/10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
            Training Programs
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold mb-4">
            FitCore Classes
          </h1>
          <p className="text-base text-[#858585] max-w-2xl">
            Structured strength, conditioning, hypertrophy, and weight-loss sessions coached by
            FitCore specialists.
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-8">
            {DIFFICULTY_FILTERS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                  difficulty === level
                    ? 'bg-[#E51C2A] text-white'
                    : 'bg-[#1B1B1B] text-[#858585] hover:text-white border border-white/10'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-[#1B1B1B] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-[#1B1B1B] border border-[#E51C2A]/40 rounded-lg text-sm">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 bg-[#1B1B1B] border border-white/10 rounded-lg text-center">
              <p className="text-sm text-[#858585]">
                No classes match this filter right now. Check back soon or contact reception.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((cls) => (
                <article
                  key={cls.id}
                  className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] overflow-hidden">
                      <SafeImage
                        src={cls.imageUrl}
                        alt={cls.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#858585]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#E51C2A]" />
                          {cls.duration}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Signal className="h-3.5 w-3.5 text-[#E51C2A]" />
                          {cls.difficultyLevel}
                        </span>
                      </div>
                      <h2 className="font-display text-3xl font-bold text-white">{cls.name}</h2>
                      <p className="text-sm text-[#858585] leading-relaxed">{cls.description}</p>
                      {cls.schedule && (
                        <div className="pt-2 flex items-start gap-2 text-xs text-white/90">
                          <Calendar className="h-4 w-4 text-[#E51C2A] shrink-0 mt-0.5" />
                          <span>{cls.schedule}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <Link
                      to={`/contact?plan=${encodeURIComponent(cls.name + ' Class')}`}
                      className="block text-center w-full py-2.5 bg-[#111111] hover:bg-[#E51C2A] border border-white/15 hover:border-[#E51C2A] text-white text-sm font-semibold rounded transition-colors"
                    >
                      Inquire About Class
                    </Link>
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
