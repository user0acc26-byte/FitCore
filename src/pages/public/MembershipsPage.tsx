import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Dumbbell, Info, ShieldCheck } from 'lucide-react';
import { formatPKR } from '../../lib/currency';
import { listMembershipPlans } from '../../services/fitcoreDb';
import type { MembershipPlan } from '../../types/fitcore';

export function MembershipsPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMembershipPlans()
      .then((rows) => {
        setPlans(rows.filter((p) => p.status === 'active'));
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load membership packages.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#111111] text-white min-h-[75vh]">
      <section className="border-b border-white/10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
            Membership Packages
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold mb-4">
            Choose Your Training Cycle
          </h1>
          <p className="text-base text-[#858585] max-w-2xl mb-6">
            Transparent PKR pricing synced directly with FitCore management. Visit our front desk
            to activate your membership and receive your official Member Portal credentials.
          </p>

          <div className="p-4 bg-[#1B1B1B] border border-white/10 rounded-lg flex items-start gap-3 text-xs sm:text-sm text-[#858585] max-w-3xl">
            <Info className="h-5 w-5 text-[#E51C2A] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-semibold">Admin-Verified Gym Enrollment:</span>{' '}
              Member Portal accounts are created directly by FitCore Administration at the gym so
              every member receives verified credentials and trainer assignment.{' '}
              <Link to="/login" className="text-[#E51C2A] hover:underline font-medium">
                Looking to browse with a General Website Account? Sign up here.
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F5F5F5] text-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-white rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-white border border-[#E51C2A] rounded-lg text-sm">{error}</div>
          ) : plans.length === 0 ? (
            <div className="p-12 bg-white border border-black/10 rounded-lg text-center">
              <p className="text-sm text-[#555555]">
                No membership plans are currently published. Administrators can configure packages in
                the Admin Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className={`rounded-lg p-8 border flex flex-col justify-between ${
                    plan.isPopular
                      ? 'bg-[#111111] text-white border-[#E51C2A]'
                      : 'bg-white text-[#111111] border-black/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#E51C2A]">
                        {plan.durationLabel} · {plan.durationDays} Days
                      </span>
                      {plan.isPopular && (
                        <span className="text-xs font-semibold text-[#E51C2A]">Recommended</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-baseline justify-between gap-4 pb-6 mb-6 border-b border-current/10">
                      <div>
                        <h2 className="font-display text-4xl font-extrabold">{plan.name}</h2>
                        <p
                          className={`text-sm mt-1 ${
                            plan.isPopular ? 'text-[#858585]' : 'text-[#555555]'
                          }`}
                        >
                          {plan.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-4xl font-extrabold tabular-nums">
                          {formatPKR(plan.price)}
                        </span>
                        <span className="block text-xs text-[#858585]">Pakistani Rupees (PKR)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#E51C2A] mb-3 flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Package Benefits</span>
                        </h3>
                        <ul className="space-y-2 text-sm">
                          {plan.benefits.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-[#E51C2A] shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        {plan.includedFacilities.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#858585] mb-2">
                              Included Facilities
                            </h3>
                            <p className="text-sm">{plan.includedFacilities.join(' · ')}</p>
                          </div>
                        )}
                        {plan.trainingBenefits.length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#858585] mb-2 flex items-center gap-1.5">
                              <Dumbbell className="h-3.5 w-3.5 text-[#E51C2A]" />
                              <span>Training Benefits</span>
                            </h3>
                            <ul className="space-y-1.5 text-sm">
                              {plan.trainingBenefits.map((tb, idx) => (
                                <li key={idx}>• {tb}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/contact?plan=${encodeURIComponent(plan.name)}`}
                    className={`w-full py-3.5 rounded text-sm font-semibold transition-colors text-center block ${
                      plan.isPopular
                        ? 'bg-[#E51C2A] hover:bg-[#c81622] text-white'
                        : 'bg-[#111111] hover:bg-[#E51C2A] text-white'
                    }`}
                  >
                    Inquire About {plan.name}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
