import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useData';
import ProductCard from '../components/common/ProductCard';
import { ProductGridSkeleton, ErrorMessage } from '../components/common/LoadingStates';

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categorySlug = searchParams.get('category') || '';
  const featuredOnly = searchParams.get('featured') === 'true';
  const sortParam = searchParams.get('sort') || 'createdAt-desc';
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';

  const [sort, order] = sortParam.split('-');

  const params = {
    ...(categorySlug && { category: categorySlug }),
    ...(featuredOnly && { featured: 'true' }),
    ...(search && { search }),
    sort,
    order,
    page,
    limit: 12,
  };

  const { products, loading, error, pagination } = useProducts(params);
  const { categories } = useCategories();

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = categorySlug || featuredOnly || search;

  // Page title
  const pageTitle = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name || 'Collection'
    : featuredOnly
    ? 'Featured Sarees'
    : 'All Sarees';

  return (
    <div className="min-h-screen pt-20">
      {/* Page Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <nav className="flex items-center gap-2 text-xs font-sans text-stone-400 mb-4">
            <Link to="/" className="hover:text-saree-gold transition-colors">Home</Link>
            <span>/</span>
            <span className="text-stone-600">{pageTitle}</span>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl text-saree-deep">{pageTitle}</h1>
          {pagination.total > 0 && (
            <p className="font-sans text-sm text-stone-400 mt-2">{pagination.total} sarees</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          {/* Left: filter chips */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 font-sans text-sm text-stone-600 border border-stone-200 px-4 py-2 hover:border-saree-gold transition-colors md:hidden"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              Filters
            </button>

            {categorySlug && (
              <span className="flex items-center gap-2 bg-saree-silk border border-saree-gold/30 px-3 py-1.5 text-xs font-sans text-saree-deep">
                {categories.find((c) => c.slug === categorySlug)?.name}
                <button onClick={() => updateParam('category', '')} className="hover:text-saree-burgundy">×</button>
              </span>
            )}
            {featuredOnly && (
              <span className="flex items-center gap-2 bg-saree-silk border border-saree-gold/30 px-3 py-1.5 text-xs font-sans text-saree-deep">
                Featured Only
                <button onClick={() => updateParam('featured', '')} className="hover:text-saree-burgundy">×</button>
              </span>
            )}
            {hasFilters && (
              <button onClick={clearFilters} className="font-sans text-xs text-stone-400 hover:text-saree-burgundy underline">
                Clear all
              </button>
            )}
          </div>

          {/* Right: Sort */}
          <select
            value={sortParam}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="font-sans text-sm border border-stone-200 px-4 py-2 bg-white text-stone-600 focus:outline-none focus:border-saree-gold"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters - desktop */}
          <aside className="hidden md:block w-48 shrink-0">
            <div className="sticky top-24">
              <h3 className="font-sans text-xs tracking-widest uppercase text-stone-400 mb-4">Category</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => updateParam('category', '')}
                    className={`font-sans text-sm transition-colors ${!categorySlug ? 'text-saree-burgundy font-medium' : 'text-stone-500 hover:text-saree-gold'}`}
                  >
                    All Sarees
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat._id}>
                    <button
                      onClick={() => updateParam('category', cat.slug)}
                      className={`font-sans text-sm transition-colors ${categorySlug === cat.slug ? 'text-saree-burgundy font-medium' : 'text-stone-500 hover:text-saree-gold'}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-8 border-t border-stone-100">
                <h3 className="font-sans text-xs tracking-widest uppercase text-stone-400 mb-4">Filter</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featuredOnly}
                    onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                    className="accent-saree-gold"
                  />
                  <span className="font-sans text-sm text-stone-500">Featured Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <ProductGridSkeleton count={12} />
            ) : error ? (
              <ErrorMessage message={error} />
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🪡</div>
                <h3 className="font-display text-2xl text-saree-deep mb-2">No sarees found</h3>
                <p className="font-serif italic text-stone-400 mb-6">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-7">
                  {products.map((product, i) => (
                    <div key={product._id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-14">
                    {Array.from({ length: pagination.pages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const np = new URLSearchParams(searchParams);
                          np.set('page', String(i + 1));
                          setSearchParams(np);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-9 h-9 font-sans text-sm transition-colors ${
                          page === i + 1
                            ? 'bg-saree-burgundy text-white'
                            : 'border border-stone-200 text-stone-500 hover:border-saree-gold hover:text-saree-gold'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
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
