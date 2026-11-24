import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Dumbbell,
  ShieldCheck,
  TrendingUp,
  Users,
  Clock,
  ShoppingBag,
} from 'lucide-react';
import { FITCORE_IMAGES } from '../../lib/assets';
import { formatPKR } from '../../lib/currency';
import { SafeImage } from '../../components/common/SafeImage';
import {
  listClasses,
  listFacilities,
  listMembershipPlans,
  listShopProducts,
  listAnnouncements,
} from '../../services/fitcoreDb';
import type {
  Facility,
  FitnessClass,
  MembershipPlan,
  ShopProduct,
  WebsiteAnnouncement,
} from '../../types/fitcore';

const WHY_CHOOSE_ITEMS = [
  {
    number: '01',
    title: 'Calibrated Commercial Equipment',
    description:
      'Olympic power racks, urethane free weights up to 60 kg, and biomechanically aligned machines maintained daily.',
    icon: Dumbbell,
  },
  {
    number: '02',
    title: 'Certified Male Coaching Staff',
    description:
      'Dedicated strength and conditioning specialists assigned directly to your membership cycle.',
    icon: Users,
  },
  {
    number: '03',
    title: 'Tracked Body Progression',
    description:
      'Full measurements across weight, body fat, chest, biceps, waist, thighs, and shoulders charted in your Member Portal.',
    icon: TrendingUp,
  },
  {
    number: '04',
    title: 'Unified Member Portal',
    description:
      'Live access to active memberships, assigned workout splits, training schedules, attendance, and fee receipts.',
    icon: ShieldCheck,
  },
];

export function HomePage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [classes, setClasses] = useState<FitnessClass[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [announcements, setAnnouncements] = useState<WebsiteAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    Promise.all([
      listFacilities().catch(() => []),
      listMembershipPlans().catch(() => []),
      listClasses().catch(() => []),
      listShopProducts().catch(() => []),
      listAnnouncements().catch(() => []),
    ]).then(([fac, pl, cls, prod, ann]) => {
      if (!active) return;
      setFacilities(fac.filter((f) => f.isActive).slice(0, 3));
      setPlans(pl.filter((p) => p.status === 'active').slice(0, 4));
      setClasses(cls.filter((c) => c.isActive).slice(0, 3));
      setProducts(prod.filter((pr) => pr.isAvailable).slice(0, 4));
      setAnnouncements(ann.filter((a) => a.isActive && a.audience === 'public').slice(0, 1));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const goToPlanInquiry = (plan: MembershipPlan | null = null) => {
    if (plan) {
      navigate(`/contact?plan=${encodeURIComponent(plan.name)}`);
    } else {
      navigate('/contact');
    }
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#111111] overflow-hidden border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          {announcements.length > 0 && (
            <div className="mb-8 px-4 py-2.5 bg-[#1B1B1B] border border-white/10 rounded flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-[#E51C2A]">{announcements[0].title}</span>
              <span className="text-[#858585]">{announcements[0].message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#E51C2A]">
                FitCore Strength &amp; Conditioning Center
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[0.95] text-balance">
                Train With Discipline. Measure Every Rep.
              </h1>
              <p className="text-base sm:text-lg text-[#858585] max-w-xl leading-relaxed">
                A complete performance gym combining Olympic strength floors, structured coaching
                programs, and a unified Member Portal that tracks your workouts, attendance, and
                body composition in real time.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => goToPlanInquiry(null)}
                  className="px-7 py-3.5 bg-[#E51C2A] hover:bg-[#c81622] text-white text-sm font-semibold rounded transition-colors inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Join Now</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/memberships"
                  className="px-7 py-3.5 bg-[#1B1B1B] hover:bg-white/10 border border-white/15 text-white text-sm font-semibold rounded transition-colors whitespace-nowrap"
                >
                  Explore Memberships
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[340px] lg:min-h-[460px] rounded-lg overflow-hidden border border-white/10">
                <SafeImage
                  src={FITCORE_IMAGES.heroAthlete}
                  alt="Male athlete performing heavy dumbbell workout at FitCore"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-between gap-4 text-xs text-white/90">
                  <span className="font-medium">Strength Floor · Open 6:00 AM – 11:00 PM</span>
                  <span className="font-mono text-[#E51C2A] font-semibold">FITCORE PERFORMANCE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WELCOME TO FITCORE */}
      <section className="bg-[#F5F5F5] text-[#111111] py-20 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-3">
                Welcome to FitCore
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold leading-tight text-balance">
                Built Around Real Training Results, Not Shortcuts
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-4 text-[#444444] text-base leading-relaxed">
              <p>
                FitCore brings together high-capacity strength zones, focused personal coaching,
                and an integrated digital management platform. Every member starts with a clear
                plan—paired with an assigned trainer, documented measurement baselines, and a
                structured weekly training split.
              </p>
              <p>
                Whether your goal is raw barbell strength, lean muscle hypertrophy, or cardiovascular
                conditioning, our facility is organized so you never wait on equipment and never
                guess what to train next.
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#E51C2A] hover:underline"
                >
                  <span>Read About Our Facility &amp; Mission</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE FITCORE */}
      <section className="bg-[#111111] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
              The FitCore Standard
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white">
              Why Athletes Choose FitCore
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.number}
                  className="bg-[#1B1B1B] border border-white/10 rounded-lg p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-mono text-sm font-semibold text-[#E51C2A]">
                        {item.number}
                      </span>
                      <Icon className="h-5 w-5 text-white/80" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#858585] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FACILITIES PREVIEW */}
      <section className="bg-[#1B1B1B] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
                Training Environment
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white">
                Facilities Preview
              </h2>
            </div>
            <Link
              to="/facilities"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] border border-white/15 hover:border-[#E51C2A] text-white text-sm font-semibold rounded transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <span>View All Facilities</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-[#111111] border border-white/10 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : facilities.length === 0 ? (
            <div className="bg-[#111111] border border-white/10 rounded-lg p-10 text-center">
              <p className="text-sm text-[#858585] mb-4">
                No facilities have been published yet. Administrators can add or initialize gym
                facilities from the Admin Dashboard.
              </p>
              <Link
                to="/facilities"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#E51C2A]"
              >
                <span>Go to Facilities Page</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {facilities.map((fac) => (
                <article
                  key={fac.id}
                  className="bg-[#111111] border border-white/10 rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <SafeImage
                      src={fac.imageUrl}
                      alt={fac.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-xs text-[#E51C2A] font-medium mb-1">{fac.category}</p>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">{fac.name}</h3>
                    <p className="text-sm text-[#858585] leading-relaxed flex-1">
                      {fac.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. MEMBERSHIPS PREVIEW */}
      <section className="bg-[#F5F5F5] text-[#111111] py-20 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
                Flexible Plans
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold">
                Memberships Preview
              </h2>
            </div>
            <Link
              to="/memberships"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-[#2a2a2a] text-white text-sm font-semibold rounded transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <span>View All Memberships</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-white border border-black/10 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white border border-black/10 rounded-lg p-10 text-center">
              <p className="text-sm text-[#555555]">
                No membership packages are currently published. Sign in as Admin to create plans.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg p-6 flex flex-col justify-between border ${
                    plan.isPopular
                      ? 'bg-[#111111] text-white border-[#E51C2A]'
                      : 'bg-white text-[#111111] border-black/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-xs font-medium ${
                          plan.isPopular ? 'text-[#E51C2A]' : 'text-[#858585]'
                        }`}
                      >
                        {plan.durationLabel}
                      </span>
                      {plan.isPopular && (
                        <span className="text-xs font-semibold text-[#E51C2A]">Most Popular</span>
                      )}
                    </div>
                    <h3 className="font-display text-3xl font-extrabold mb-2">{plan.name}</h3>
                    <div className="mb-5 flex items-baseline gap-1.5">
                      <span className="font-display text-3xl sm:text-4xl font-extrabold tabular-nums">
                        {formatPKR(plan.price)}
                      </span>
                      <span className="text-xs text-[#858585]">/ {plan.durationLabel}</span>
                    </div>
                    <ul className="space-y-2.5 mb-6 text-sm">
                      {plan.benefits.slice(0, 4).map((b, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-[#E51C2A] shrink-0 mt-0.5" />
                          <span className={plan.isPopular ? 'text-white/90' : 'text-[#444444]'}>
                            {b}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToPlanInquiry(plan)}
                    className={`w-full py-2.5 rounded text-sm font-semibold transition-colors ${
                      plan.isPopular
                        ? 'bg-[#E51C2A] hover:bg-[#c81622] text-white'
                        : 'bg-[#111111] hover:bg-[#E51C2A] text-white'
                    }`}
                  >
                    Inquire / Visit Gym
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. POPULAR CLASSES */}
      <section className="bg-[#111111] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
                Coach-Led Programs
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white">
                Popular Classes
              </h2>
            </div>
            <Link
              to="/classes"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B1B1B] border border-white/15 hover:border-[#E51C2A] text-white text-sm font-semibold rounded transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <span>View All Classes</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-[#1B1B1B] border border-white/10 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-[#1B1B1B] border border-white/10 rounded-lg p-10 text-center">
              <p className="text-sm text-[#858585]">
                No classes have been published yet. Administrators can add classes in the Admin
                Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <article
                  key={cls.id}
                  className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <SafeImage
                      src={cls.imageUrl}
                      alt={cls.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-[#858585] mb-2">
                      <Clock className="h-3.5 w-3.5 text-[#E51C2A]" />
                      <span>{cls.duration}</span>
                      <span aria-hidden="true">·</span>
                      <span>{cls.difficultyLevel}</span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">{cls.name}</h3>
                    <p className="text-sm text-[#858585] leading-relaxed">{cls.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. SHOP PREVIEW */}
      <section className="bg-[#1B1B1B] py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
                Supplements &amp; Gear
              </p>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white">
                Shop Preview
              </h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111111] border border-white/15 hover:border-[#E51C2A] text-white text-sm font-semibold rounded transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <span>View All Products</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 bg-[#111111] border border-white/10 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-[#111111] border border-white/10 rounded-lg p-10 text-center">
              <ShoppingBag className="h-8 w-8 text-[#E51C2A] mx-auto mb-3" />
              <p className="text-sm text-[#858585]">
                No supplements or accessories are currently listed in the catalog.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((prod) => (
                <Link
                  key={prod.id}
                  to="/shop"
                  className="bg-[#111111] border border-white/10 hover:border-[#E51C2A] rounded-lg overflow-hidden transition-colors flex flex-col"
                >
                  <div className="aspect-square overflow-hidden bg-[#161616]">
                    <SafeImage
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#858585] mb-1">
                        {prod.brand} · {prod.category}
                      </p>
                      <h3 className="font-display text-xl font-bold text-white mb-2">
                        {prod.name}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="font-display text-xl font-extrabold text-[#E51C2A] tabular-nums">
                        {formatPKR(prod.price)}
                      </span>
                      <span className="text-xs text-[#858585] tabular-nums">
                        {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. CONTACT US / JOIN FITCORE CTA */}
      <section className="bg-[#E51C2A] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold mb-3">
              Ready to Start Training at FitCore?
            </h2>
            <p className="text-base text-white/90 leading-relaxed">
              Submit your membership request online or visit our facility to meet a certified coach
              and tour our strength and conditioning zones.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => goToPlanInquiry(null)}
              className="px-7 py-3.5 bg-[#111111] hover:bg-black text-white text-sm font-semibold rounded transition-colors whitespace-nowrap"
            >
              Join Now
            </button>
            <Link
              to="/contact"
              className="px-7 py-3.5 bg-white text-[#111111] hover:bg-[#F5F5F5] text-sm font-semibold rounded transition-colors whitespace-nowrap"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
