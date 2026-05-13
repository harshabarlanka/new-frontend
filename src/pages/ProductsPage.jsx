import { useSearchParams, Link } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useData';
import ProductCard from '../components/common/ProductCard';
import { ProductGridSkeleton, ErrorMessage } from '../components/common/LoadingStates';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First'          },
  { value: 'price-asc',      label: 'Price: Low to High'    },
  { value: 'price-desc',     label: 'Price: High to Low'    },
  { value: 'rating-desc',    label: 'Top Rated'             },
];

// ─────────────────────────────────────────────────────────────────────────────
// Mobile category card — image-forward card that scrolls horizontally
// Shows the dedicated category image uploaded by admin, gradient fallback if none
// ─────────────────────────────────────────────────────────────────────────────
const MOBILE_GRADIENTS = [
  "from-amber-900 to-amber-700",
  "from-rose-900 to-rose-700",
  "from-emerald-900 to-emerald-700",
  "from-violet-900 to-violet-700",
  "from-sky-900 to-sky-700",
  "from-orange-900 to-orange-700",
  "from-teal-900 to-teal-700",
  "from-indigo-900 to-indigo-700",
];

const MobileCategoryCard = ({ category, index, isActive, onClick }) => {
  const gradient = MOBILE_GRADIENTS[index % MOBILE_GRADIENTS.length];
  // category.image is ONLY the image uploaded by admin — never a product image
  const categoryImage = category.image || "";

  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 w-24 h-28 rounded-xl overflow-hidden transition-all active:scale-95 ${
        isActive ? "ring-2 ring-saree-gold ring-offset-1" : ""
      }`}
    >
      {/* Dedicated category image from Cloudinary */}
      {categoryImage ? (
        <img
          src={categoryImage}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextElementSibling.style.display = "block";
          }}
        />
      ) : null}

      {/* Gradient fallback */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${gradient}`}
        style={{ display: categoryImage ? "none" : "block" }}
      />

      {/* Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

      {/* Active indicator dot */}
      {isActive && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-saree-gold shadow-sm" />
      )}

      {/* Category name */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <p className="font-display text-[11px] text-white leading-tight text-center line-clamp-2">
          {category.name}
        </p>
      </div>
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const categorySlug = searchParams.get('category') || '';
  const featuredOnly = searchParams.get('featured') === 'true';
  const sortParam    = searchParams.get('sort') || 'createdAt-desc';
  const page         = parseInt(searchParams.get('page') || '1');
  const search       = searchParams.get('search') || '';

  const [sort, order] = sortParam.split('-');

  const params = {
    ...(categorySlug && { category: categorySlug }),
    ...(featuredOnly  && { featured: 'true' }),
    ...(search        && { search }),
    sort, order, page, limit: 12,
  };

  const { products, loading, error, pagination } = useProducts(params);
  const { categories } = useCategories();

  const updateParam = (key, value) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});
  const hasFilters = categorySlug || featuredOnly || search;

  const pageTitle = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name || 'Collection'
    : featuredOnly ? 'Featured Sarees' : 'All Sarees';

  // Dedicated category image for the page header banner
  const activeCategoryImage = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.image || ''
    : '';

  return (
    <div className="min-h-screen pt-16 md:pt-20">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <nav className="flex items-center gap-2 text-xs font-sans text-stone-400 mb-3">
            <Link to="/" className="hover:text-saree-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-stone-600">{pageTitle}</span>
          </nav>
          <div className="flex items-end gap-4">
            {/* Show dedicated category image in header when browsing a category */}
            {activeCategoryImage && (
              <img
                src={activeCategoryImage}
                alt={pageTitle}
                className="w-14 h-14 rounded-lg object-cover border border-stone-100 shrink-0 hidden sm:block"
              />
            )}
            <div>
              <h1 className="font-display text-3xl md:text-5xl text-saree-deep leading-tight">
                {pageTitle}
              </h1>
              {pagination.total > 0 && (
                <p className="font-sans text-sm text-stone-400 mt-1">{pagination.total} sarees</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          MOBILE ONLY — Horizontal scrollable category image strip
          Hidden on md+ (desktop uses the left sidebar below)
      ──────────────────────────────────────────────────────────── */}
      <div className="md:hidden bg-stone-50 border-b border-stone-100">
        <div className="px-4 pt-3 pb-1">
          <p className="font-sans text-xs tracking-widest uppercase text-stone-400 mb-2">Collections</p>
        </div>
        <div
          className="flex gap-3 px-4 pb-4 overflow-x-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* "All" card */}
          <button
            onClick={() => updateParam('category', '')}
            className={`relative shrink-0 w-24 h-28 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-1 border-2 transition-all active:scale-95 ${
              !categorySlug
                ? 'border-saree-gold bg-saree-deep'
                : 'border-stone-200 bg-white'
            }`}
          >
            <svg
              className={`w-6 h-6 ${!categorySlug ? 'text-saree-gold' : 'text-stone-400'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className={`font-display text-[11px] text-center leading-tight ${!categorySlug ? 'text-white' : 'text-stone-600'}`}>
              All Sarees
            </span>
          </button>

          {/* Dynamic category image cards — images come from DB / admin upload only */}
          {categories.map((cat, i) => (
            <MobileCategoryCard
              key={cat._id}
              category={cat}
              index={i}
              isActive={categorySlug === cat.slug}
              onClick={() => updateParam('category', cat.slug)}
            />
          ))}
        </div>
      </div>

      {/* ── Main content area ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* Sort + active filter chips */}
        <div className="flex items-center justify-between gap-4 mb-6 md:mb-8 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {categorySlug && (
              <span className="flex items-center gap-2 bg-saree-silk border border-saree-gold/30 px-3 py-1.5 text-xs font-sans text-saree-deep rounded-full">
                {categories.find((c) => c.slug === categorySlug)?.name}
                <button onClick={() => updateParam('category', '')} className="hover:text-saree-burgundy ml-0.5 text-base leading-none">×</button>
              </span>
            )}
            {featuredOnly && (
              <span className="flex items-center gap-2 bg-saree-silk border border-saree-gold/30 px-3 py-1.5 text-xs font-sans text-saree-deep rounded-full">
                Featured Only
                <button onClick={() => updateParam('featured', '')} className="hover:text-saree-burgundy text-base leading-none">×</button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-2 bg-saree-silk border border-saree-gold/30 px-3 py-1.5 text-xs font-sans text-saree-deep rounded-full">
                "{search}"
                <button onClick={() => updateParam('search', '')} className="hover:text-saree-burgundy text-base leading-none">×</button>
              </span>
            )}
            {hasFilters && (
              <button onClick={clearFilters} className="font-sans text-xs text-stone-400 hover:text-saree-burgundy underline">
                Clear all
              </button>
            )}
          </div>

          <select
            value={sortParam}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="font-sans text-sm border border-stone-200 px-4 py-2 bg-white text-stone-600 rounded-lg focus:outline-none focus:border-saree-gold"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-8">

          {/* ────────────────────────────────────────────────────────────
              DESKTOP ONLY — Left sidebar with category list + filters
              Unchanged from original — plain text links, no images
          ──────────────────────────────────────────────────────────── */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="font-sans text-xs tracking-widest uppercase text-stone-400 mb-4">Category</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => updateParam('category', '')}
                      className={`w-full text-left px-2 py-1.5 rounded-lg font-sans text-sm transition-colors ${
                        !categorySlug
                          ? 'bg-saree-ivory text-saree-burgundy font-medium'
                          : 'text-stone-500 hover:text-saree-gold hover:bg-stone-50'
                      }`}
                    >
                      All Sarees
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id}>
                      <button
                        onClick={() => updateParam('category', cat.slug)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg font-sans text-sm transition-colors ${
                          categorySlug === cat.slug
                            ? 'bg-saree-ivory text-saree-burgundy font-medium'
                            : 'text-stone-500 hover:text-saree-gold hover:bg-stone-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-stone-100">
                <h3 className="font-sans text-xs tracking-widest uppercase text-stone-400 mb-4">Filter</h3>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                    className="accent-saree-gold w-4 h-4"
                  />
                  <span className="font-sans text-sm text-stone-500 group-hover:text-saree-gold transition-colors">
                    Featured Only
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : products.length === 0 ? (
              <div className="text-center py-20 md:py-24">
                <div className="text-5xl mb-4">🪡</div>
                <h3 className="font-display text-2xl text-saree-deep mb-2">No sarees found</h3>
                <p className="font-serif italic text-stone-400 mb-6">
                  {hasFilters ? 'Try adjusting your filters' : 'No products have been added yet'}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
                  {products.map((product, i) => (
                    <div
                      key={product._id}
                      className="animate-fade-in min-w-0"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12 md:mt-14 flex-wrap">
                    <button
                      disabled={page <= 1}
                      onClick={() => {
                        const p = new URLSearchParams(searchParams);
                        p.set('page', String(page - 1));
                        setSearchParams(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-2 border border-stone-200 text-stone-400 rounded-lg disabled:opacity-30 hover:border-saree-gold hover:text-saree-gold transition-colors text-sm"
                    >‹</button>

                    {Array.from({ length: pagination.pages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const p = new URLSearchParams(searchParams);
                          p.set('page', String(i + 1));
                          setSearchParams(p);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 font-sans text-sm rounded-lg transition-colors ${
                          page === i + 1
                            ? 'bg-saree-burgundy text-white'
                            : 'border border-stone-200 text-stone-500 hover:border-saree-gold hover:text-saree-gold'
                        }`}
                      >{i + 1}</button>
                    ))}

                    <button
                      disabled={page >= pagination.pages}
                      onClick={() => {
                        const p = new URLSearchParams(searchParams);
                        p.set('page', String(page + 1));
                        setSearchParams(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-2 border border-stone-200 text-stone-400 rounded-lg disabled:opacity-30 hover:border-saree-gold hover:text-saree-gold transition-colors text-sm"
                    >›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
