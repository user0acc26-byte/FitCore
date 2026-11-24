import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Info, PackageCheck, PackageX } from 'lucide-react';
import { SafeImage } from '../../components/common/SafeImage';
import { formatPKR } from '../../lib/currency';
import { listShopCategories, listShopProducts } from '../../services/fitcoreDb';
import type { ShopCategory, ShopProduct } from '../../types/fitcore';

export function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listShopProducts(), listShopCategories()])
      .then(([prods, cats]) => {
        setProducts(prods.filter((p) => p.isAvailable));
        setCategories(cats);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load FitCore Shop.');
        setLoading(false);
      });
  }, []);

  const categoryNames = [
    'All',
    ...Array.from(
      new Set([
        ...categories.map((c) => c.name),
        ...products.map((p) => p.category).filter(Boolean),
      ])
    ),
  ];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-[#111111] text-white min-h-[75vh]">
      <section className="border-b border-white/10 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E51C2A] mb-2">
            Supplements &amp; Accessories
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold mb-4">FitCore Shop</h1>
          <p className="text-base text-[#858585] max-w-2xl mb-6">
            Browse verified gym supplements, recovery nutrition, and training accessories managed
            directly through our live inventory system.
          </p>

          <div className="p-4 bg-[#1B1B1B] border border-white/10 rounded-lg flex items-start gap-3 text-xs sm:text-sm text-[#858585] max-w-3xl mb-8">
            <Info className="h-5 w-5 text-[#E51C2A] shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-semibold">In-Gym Purchase &amp; Catalogue Notice:</span>{' '}
              Online card checkout is not connected to a payment gateway yet (requires Stripe /
              merchant gateway keys). Browse live stock below and reserve or purchase directly at
              FitCore reception or via{' '}
              <Link to="/contact" className="text-[#E51C2A] hover:underline font-medium">
                Contact Us
              </Link>
              .
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {categoryNames.map((cat) => (
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

            <div className="relative w-full md:w-72">
              <Search className="h-4 w-4 text-[#858585] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search supplements or brands..."
                className="w-full pl-10 pr-4 py-2 bg-[#1B1B1B] border border-white/15 rounded text-sm text-white placeholder:text-[#858585] focus:outline-none focus:border-[#E51C2A]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
                No products match your search or category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((prod) => (
                <article
                  key={prod.id}
                  className="bg-[#1B1B1B] border border-white/10 rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-square bg-[#161616] overflow-hidden">
                      <SafeImage
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 space-y-2">
                      <p className="text-xs text-[#858585]">
                        {prod.brand} · {prod.category}
                      </p>
                      <h2 className="font-display text-2xl font-bold text-white">{prod.name}</h2>
                      <p className="text-sm text-[#858585] leading-relaxed">{prod.description}</p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-display text-2xl font-extrabold text-[#E51C2A] tabular-nums">
                        {formatPKR(prod.price)}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs mt-1">
                        {prod.stock > 0 ? (
                          <>
                            <PackageCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-400 tabular-nums">
                              In Stock ({prod.stock})
                            </span>
                          </>
                        ) : (
                          <>
                            <PackageX className="h-3.5 w-3.5 text-[#E51C2A]" />
                            <span className="text-[#E51C2A]">Out of Stock</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/contact?product=${encodeURIComponent(prod.name)}`}
                      className="px-4 py-2 bg-[#111111] hover:bg-[#E51C2A] border border-white/15 hover:border-[#E51C2A] text-white text-xs font-semibold rounded transition-colors whitespace-nowrap"
                    >
                      Reserve at Desk
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
